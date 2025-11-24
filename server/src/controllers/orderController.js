import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { AppError, catchAsync } from '../utils/errorHandler.js';
import { customResponse } from '../utils/response.js';
import {
    reserveStockForOrder,
    releaseStockForOrder,
    restoreStockForOrder
} from '../services/inventoryService.js';

/**
 * POST /api/orders - Create new order from cart
 */
export const createOrder = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const { shippingAddress, notes } = req.body;

    if (!shippingAddress) {
        throw new AppError('Shipping address is required', 400);
    }

    const { street, city, state, zipCode, country } = shippingAddress;
    if (!street || !city || !state || !zipCode) {
        throw new AppError('Complete shipping address required (street, city, state, zipCode)', 400);
    }

    // Get user's cart
    const cart = await Cart.findOne({ user: userId }).populate('items.product');

    if (!cart || cart.isEmpty()) {
        throw new AppError('Cart is empty', 400);
    }

    // Verify stock availability for all items
    for (const item of cart.items) {
        const product = await Product.findById(item.product._id);

        if (!product) {
            throw new AppError(`Product ${item.name} no longer available`, 400);
        }

        if (product.stock < item.quantity) {
            throw new AppError(
                `Insufficient stock for ${product.name}. Only ${product.stock} available`,
                400
            );
        }
    }

    // Reserve stock atomically
    try {
        await reserveStockForOrder(cart.items);
    } catch (error) {
        throw new AppError(error.message, 400);
    }

    // Generate unique order number
    const orderNumber = await Order.generateOrderNumber();

    // Prepare order items with calculated subtotals
    const orderItems = cart.items.map(item => ({
        product: item.product._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        subtotal: item.price * item.quantity,
    }));

    // Create order
    const order = await Order.create({
        orderNumber,
        user: userId,
        items: orderItems,
        totalAmount: cart.totalPrice,
        paymentStatus: 'pending',
        orderStatus: 'pending',
        shippingAddress: {
            street,
            city,
            state,
            zipCode,
            country: country || 'US',
        },
        notes: notes || '',
    });

    // Populate user and product details
    await order.populate('user', 'name email');
    await order.populate('items.product', 'name images');

    // Note: Payment intent will be created in Step 4 (Stripe Integration)
    // Stock is now reserved and will be deducted after payment success

    return customResponse(res, {
        status: 201,
        success: true,
        message: 'Order created successfully. Stock reserved.',
        data: {
            order,
            // Client will use this to proceed to payment
            nextStep: 'payment',
        },
    });
});

/**
 * GET /api/orders - Get all orders for current user
 */
export const getUserOrders = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    const query = { user: userId };

    // Filter by status if provided
    if (status) {
        query.orderStatus = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
        Order.find(query)
            .populate('items.product', 'name images')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit)),
        Order.countDocuments(query),
    ]);

    return customResponse(res, {
        status: 200,
        success: true,
        data: {
            orders,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit)),
            },
        },
    });
});

/**
 * GET /api/orders/:id - Get specific order by ID
 */
export const getOrderById = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const order = await Order.findById(id)
        .populate('user', 'name email')
        .populate('items.product', 'name images price');

    if (!order) {
        throw new AppError('Order not found', 404);
    }

    // Only allow user to see their own orders (unless admin)
    if (order.user._id.toString() !== userId && userRole !== 'admin') {
        throw new AppError('You do not have permission to view this order', 403);
    }

    return customResponse(res, {
        status: 200,
        success: true,
        data: { order },
    });
});

/**
 * PATCH /api/orders/:id/status - Update order status (Admin only)
 */
export const updateOrderStatus = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { status, note, trackingNumber } = req.body;

    if (!status) {
        throw new AppError('Status is required', 400);
    }

    const order = await Order.findById(id);

    if (!order) {
        throw new AppError('Order not found', 404);
    }

    // Update status with validation
    try {
        order.updateStatus(status, note || '');

        // Add tracking number if provided and status is shipped
        if (trackingNumber && status === 'shipped') {
            order.trackingNumber = trackingNumber;
        }

        await order.save();
        await order.populate('user', 'name email');
        await order.populate('items.product', 'name images');

        // TODO: Queue shipping notification email in Step 5

        return customResponse(res, {
            status: 200,
            success: true,
            message: `Order status updated to ${status}`,
            data: { order },
        });
    } catch (error) {
        throw new AppError(error.message, 400);
    }
});

/**
 * POST /api/orders/:id/cancel - Cancel order
 */
export const cancelOrder = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    const { reason } = req.body;

    const order = await Order.findById(id);

    if (!order) {
        throw new AppError('Order not found', 404);
    }

    // Only allow user to cancel their own orders (unless admin)
    if (order.user.toString() !== userId && userRole !== 'admin') {
        throw new AppError('You do not have permission to cancel this order', 403);
    }

    // Check if order can be cancelled
    if (!order.canBeCancelled()) {
        throw new AppError(
            `Order cannot be cancelled. Current status: ${order.orderStatus}`,
            400
        );
    }

    // Release or restore stock based on payment status
    try {
        if (order.paymentStatus === 'paid') {
            // Order was paid, restore stock
            await restoreStockForOrder(order.items);
        } else {
            // Order not paid yet, release reserved stock
            await releaseStockForOrder(order.items);
        }
    } catch (error) {
        console.error('Stock operation failed during cancellation:', error.message);
        // Continue with cancellation even if stock operation fails
    }

    // Update to cancelled status
    order.updateStatus('cancelled', reason || 'Cancelled by user');
    await order.save();

    await order.populate('user', 'name email');
    await order.populate('items.product', 'name images');

    // TODO: Process refund if payment was completed in Step 4
    // TODO: Queue cancellation email in Step 5

    return customResponse(res, {
        status: 200,
        success: true,
        message: 'Order cancelled successfully. Stock released.',
        data: { order },
    });
});

/**
 * GET /api/orders/admin/all - Get all orders (Admin only)
 */
export const getAllOrders = catchAsync(async (req, res, next) => {
    const { status, paymentStatus, page = 1, limit = 20, search } = req.query;

    const query = {};

    // Filter by order status
    if (status) {
        query.orderStatus = status;
    }

    // Filter by payment status
    if (paymentStatus) {
        query.paymentStatus = paymentStatus;
    }

    // Search by order number or user email
    if (search) {
        query.$or = [
            { orderNumber: new RegExp(search, 'i') },
            // Note: Can't directly search user email in this query
            // Would need to populate first or use aggregation
        ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
        Order.find(query)
            .populate('user', 'name email')
            .populate('items.product', 'name images')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit)),
        Order.countDocuments(query),
    ]);

    return customResponse(res, {
        status: 200,
        success: true,
        data: {
            orders,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit)),
            },
        },
    });
});

export default {
    createOrder,
    getUserOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
    getAllOrders,
};

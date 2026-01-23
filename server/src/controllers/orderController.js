import { fetchCourierStatus } from '../services/courierService.js';
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
import { triggerN8nWebhook } from '../utils/n8n.js';
import {
    addOrderConfirmationEmailJob,
    addShippingNotificationEmailJob,
    addOrderCancellationEmailJob,
    addSMSJob
} from '../services/queueService.js';
import { sendNotification, sendAdminNotification } from '../services/notificationService.js';
import { trackSale } from '../services/analyticsService.js';
import cache from '../utils/cache.js';

/**
 * POST /api/orders - Create new order from cart
 */
export const createOrder = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const { shippingAddress, notes, paymentMethod } = req.body;

    if (!shippingAddress) {
        throw new AppError('Shipping address is required', 400);
    }

    const { street, city, state, zipCode, country, phoneNumber } = shippingAddress;
    if (!street || !city || !state || !zipCode || !phoneNumber) {
        throw new AppError('Complete shipping address required (street, city, state, zipCode, phoneNumber)', 400);
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
        paymentMethod: paymentMethod || 'card',
        shippingAddress: {
            street,
            city,
            state,
            zipCode,
            country: country || 'US',
            phoneNumber,
        },
        notes: notes || '',
    });

    // Populate user and product details
    await order.populate('user', 'name email');
    await order.populate('items.product', 'name images');

    // Notifications and Webhooks are now triggered upon confirmation (COD or Payment Success)

    // Handle Cash on Delivery (COD) logic
    if (paymentMethod === 'cod') {
        // For COD, we clear the cart immediately and mark as success
        cart.items = [];
        cart.totalPrice = 0;
        await cart.save();

        return customResponse(res, {
            status: 201,
            success: true,
            message: 'Order placed successfully (Cash on Delivery).',
            data: {
                order,
                nextStep: 'success', // Skip payment step
            },
        });
    }

    // Default: Card Payment
    // Stock is reserved, wait for payment intent in next step
    return customResponse(res, {
        status: 201,
        success: true,
        message: 'Order created successfully. Stock reserved.',
        data: {
            order,
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

    const query = {
        user: userId,
        $or: [
            { paymentMethod: 'cod' },
            { paymentStatus: { $ne: 'pending' } }
        ]
    };

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

        // Queue shipping notification email
        if (status === 'shipped') {
            addShippingNotificationEmailJob(
                order.user.email,
                {
                    orderNumber: order.orderNumber,
                    items: order.items
                },
                trackingNumber
            );
        }

        // Queue SMS Status Update
        if (order.shippingAddress?.phoneNumber) {
            let msg = `Your Zentro order #${order.orderNumber} is now ${status}.`;
            if (status === 'shipped' && trackingNumber) {
                msg += ` Tracking: ${trackingNumber}`;
            }
            addSMSJob(order.shippingAddress.phoneNumber, msg);
        }

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
    // Queue cancellation email
    // Queue cancellation email
    addOrderCancellationEmailJob(
        order.user.email,
        {
            orderNumber: order.orderNumber,
            totalAmount: order.totalAmount
        },
        reason || 'Cancelled by user'
    );

    return customResponse(res, {
        status: 200,
        success: true,
        message: 'Order cancelled successfully. Stock released.',
        data: { order },
    });
});

/**
 * POST /api/orders/:id/confirm-cod - Confirm order as Cash on Delivery
 */
export const confirmCodOrder = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({ _id: id, user: userId });

    if (!order) {
        throw new AppError('Order not found', 404);
    }

    if (order.orderStatus !== 'pending') {
        throw new AppError('Order cannot be updated', 400);
    }

    // Update payment method to COD
    order.paymentMethod = 'cod';
    order.updateStatus('processing', 'Confirmed via Cash on Delivery');
    await order.save();

    // Clear the cart (crucial step for COD finalization)
    // Use atomic update to ensure it clears regardless of hooks
    await Cart.findOneAndUpdate(
        { user: userId },
        { $set: { items: [], totalPrice: 0 } }
    );
    // INVALIDATE REDIS CACHE
    await cache.del(`cart:user:${userId}`);

    // Populate user details for notifications
    await order.populate('user', 'name email');
    await order.populate('items.product', 'name images');

    // Send In-App Notification
    await sendNotification(
        userId,
        'Order Confirmed! (COD) 📦',
        `Your order #${order.orderNumber} has been placed. Please pay on delivery.`,
        'order',
        order._id
    );

    // Send Admin Notification
    sendAdminNotification(
        'newOrder',
        'New Order (COD) 📦',
        `Order #${order.orderNumber} placed by ${order.user.name} (Cash on Delivery)`,
        'order',
        order._id
    ).catch(err => console.error('Admin notif error:', err));

    // Queue Email Notification
    addOrderConfirmationEmailJob(order.user.email, {
        orderNumber: order.orderNumber,
        customerName: order.user.name,
        totalAmount: order.totalAmount,
        items: order.items,
        shippingAddress: order.shippingAddress
    });

    // Queue SMS Confirmation
    if (order.shippingAddress?.phoneNumber) {
        const smsMessage = `Hi ${order.user.name}, your order #${order.orderNumber} is confirmed! Please pay $${order.totalAmount} on delivery. Thanks for shopping with Zentro! We will sent you tracking details soon.`;
        addSMSJob(order.shippingAddress.phoneNumber, smsMessage);

        // High Value Alert
        if (order.totalAmount > 1000) {
            addSMSJob(
                order.shippingAddress.phoneNumber,
                `Security Alert: A high-value transaction of $${order.totalAmount} was just placed on your account.`
            );
        }
    }

    // TRIGGER N8N WEBHOOK
    triggerN8nWebhook('order-created', {
        id: order._id,
        orderNumber: order.orderNumber,
        amount: order.totalAmount,
        currency: 'USD',
        customer: {
            id: userId,
            email: order.user.email
        },
        items: order.items.map(i => ({ name: i.name, quantity: i.quantity, price: i.price }))
    });

    // Track Sale in Analytics (Redis)
    trackSale({
        totalAmount: order.totalAmount,
        items: order.items,
        createdAt: order.createdAt
    }).catch(err => console.error('Failed to track sale:', err));

    return customResponse(res, {
        status: 200,
        success: true,
        message: 'Order confirmed (Cash on Delivery).',
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

    // Execute queries in parallel: Orders, Total Count, Global Stats
    const [orders, total, stats] = await Promise.all([
        Order.find(query)
            .populate('user', 'name email')
            .populate('items.product', 'name images')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit)),
        Order.countDocuments(query),
        Order.aggregate([
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    pendingPayment: { $sum: { $cond: [{ $eq: ["$paymentStatus", "pending"] }, 1, 0] } },
                    paidPayment: { $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, 1, 0] } },
                    processing: { $sum: { $cond: [{ $eq: ["$orderStatus", "processing"] }, 1, 0] } },
                    shipped: { $sum: { $cond: [{ $eq: ["$orderStatus", "shipped"] }, 1, 0] } },
                    delivered: { $sum: { $cond: [{ $eq: ["$orderStatus", "delivered"] }, 1, 0] } },
                    cancelled: { $sum: { $cond: [{ $eq: ["$orderStatus", "cancelled"] }, 1, 0] } }
                }
            }
        ])
    ]);

    const globalStats = stats.length > 0 ? stats[0] : {
        totalOrders: 0, pendingPayment: 0, paidPayment: 0,
        processing: 0, shipped: 0, delivered: 0, cancelled: 0
    };
    delete globalStats._id;

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
            stats: globalStats
        },
    });
});





// Retained existing exports (if any) or simplified
export default {
    createOrder,
    getOrder: getOrderById,
    getMyOrders: getUserOrders,
    updateOrderStatus,
    cancelOrder,
    confirmCodOrder,
    getAllOrders
};


import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { sendAdminNotification } from './notificationService.js';

/**
 * Inventory Service
 * Handles stock reservations, releases, and deductions with concurrency control
 */

/**
 * Reserve stock for multiple products (for order creation)
 * Uses MongoDB transactions for atomicity
 */
export const reserveStockForOrder = async (orderItems) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const reservations = [];

        for (const item of orderItems) {
            const product = await Product.findById(item.product).session(session);

            if (!product) {
                throw new Error(`Product ${item.name || item.product} not found`);
            }

            if (!product.isQuantityAvailable(item.quantity)) {
                throw new Error(
                    `Insufficient stock for ${product.name}. Only ${product.availableStock} available, requested ${item.quantity}`
                );
            }

            // Reserve stock
            await product.reserveStock(item.quantity);

            reservations.push({
                productId: product._id,
                productName: product.name,
                quantity: item.quantity,
                reservedAt: new Date(),
            });
        }

        await session.commitTransaction();
        return {
            success: true,
            reservations,
        };
    } catch (error) {
        await session.abortTransaction();
        throw new Error(`Stock reservation failed: ${error.message}`);
    } finally {
        session.endSession();
    }
};

/**
 * Release reserved stock for an order (on cancellation or timeout)
 */
export const releaseStockForOrder = async (orderItems) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        for (const item of orderItems) {
            const product = await Product.findById(item.product).session(session);

            if (product) {
                await product.releaseReservedStock(item.quantity);
            }
        }

        await session.commitTransaction();
        return { success: true };
    } catch (error) {
        await session.abortTransaction();
        throw new Error(`Stock release failed: ${error.message}`);
    } finally {
        session.endSession();
    }
};

/**
 * Deduct stock after successful payment
 * This converts reserved stock to actual deduction
 */
export const deductStockForOrder = async (orderItems) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const lowStockProducts = [];

        for (const item of orderItems) {
            const product = await Product.findById(item.product).session(session);

            if (!product) {
                throw new Error(`Product ${item.product} not found`);
            }

            // Deduct stock (also releases reservation)
            await product.deductStock(item.quantity);

            // Check if stock is now low
            if (product.isLowStock) {
                lowStockProducts.push({
                    productId: product._id,
                    productName: product.name,
                    availableStock: product.availableStock,
                    threshold: product.lowStockThreshold,
                });
            }
        }

        await session.commitTransaction();

        // Send Low Stock Notifications (Post-Transaction)
        if (lowStockProducts.length > 0) {
            lowStockProducts.forEach(p => {
                sendAdminNotification(
                    'lowStock',
                    'Low Stock Alert ⚠️',
                    `Product ${p.productName} is low on stock (${p.availableStock} remaining).`,
                    'alert',
                    p.productId
                ).catch(err => console.error('Low stock notif error:', err));
            });
        }

        return {
            success: true,
            lowStockProducts,
        };
    } catch (error) {
        await session.abortTransaction();
        throw new Error(`Stock deduction failed: ${error.message}`);
    } finally {
        session.endSession();
    }
};

/**
 * Restore stock for an order (on order cancellation after payment)
 */
export const restoreStockForOrder = async (orderItems) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        for (const item of orderItems) {
            const product = await Product.findById(item.product).session(session);

            if (product) {
                await product.restoreStock(item.quantity);
            }
        }

        await session.commitTransaction();
        return { success: true };
    } catch (error) {
        await session.abortTransaction();
        throw new Error(`Stock restoration failed: ${error.message}`);
    } finally {
        session.endSession();
    }
};

/**
 * Check stock availability for multiple products
 * Use this before creating an order
 */
export const checkStockAvailability = async (items) => {
    const results = [];
    let allAvailable = true;

    for (const item of items) {
        const product = await Product.findById(item.productId || item.product);

        if (!product) {
            results.push({
                productId: item.productId || item.product,
                available: false,
                reason: 'Product not found',
            });
            allAvailable = false;
            continue;
        }

        const isAvailable = product.isQuantityAvailable(item.quantity);
        results.push({
            productId: product._id,
            productName: product.name,
            requestedQuantity: item.quantity,
            availableStock: product.availableStock,
            available: isAvailable,
            reason: isAvailable ? 'Available' : `Only ${product.availableStock} available`,
        });

        if (!isAvailable) {
            allAvailable = false;
        }
    }

    return {
        allAvailable,
        results,
    };
};

/**
 * Get low stock products (for admin notifications)
 */
export const getLowStockProducts = async () => {
    const products = await Product.find({
        $expr: {
            $lte: [{ $subtract: ['$stock', '$reservedStock'] }, '$lowStockThreshold'],
        },
    }).select('name stock reservedStock lowStockThreshold availableStock');

    return products.filter(p => p.availableStock > 0);
};

/**
 * Get out of stock products
 */
export const getOutOfStockProducts = async () => {
    const products = await Product.find({
        $expr: {
            $lte: [{ $subtract: ['$stock', '$reservedStock'] }, 0],
        },
    }).select('name stock reservedStock');

    return products;
};

/**
 * Auto-release expired reservations
 * Call this periodically (e.g., via cron job or queue)
 * Releases reservations for pending orders older than timeout
 */
export const releaseExpiredReservations = async (timeoutMinutes = 15) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const timeoutDate = new Date(Date.now() - timeoutMinutes * 60 * 1000);

        // Find pending orders older than timeout
        const expiredOrders = await Order.find({
            orderStatus: 'pending',
            paymentStatus: 'pending',
            paymentMethod: 'card', // Only cancel Card orders (COD orders are valid in 'pending' state)
            createdAt: { $lt: timeoutDate },
        }).session(session);

        const released = [];

        for (const order of expiredOrders) {
            // Release stock for each item
            for (const item of order.items) {
                const product = await Product.findById(item.product).session(session);

                if (product && product.reservedStock > 0) {
                    await product.releaseReservedStock(item.quantity);
                    released.push({
                        orderId: order._id,
                        orderNumber: order.orderNumber,
                        productId: product._id,
                        productName: product.name,
                        quantity: item.quantity,
                    });
                }
            }

            // Optionally cancel the order
            order.updateStatus('cancelled', 'Payment timeout - stock reservation expired');
            await order.save({ session });
        }

        await session.commitTransaction();

        return {
            success: true,
            releasedCount: released.length,
            released,
        };
    } catch (error) {
        await session.abortTransaction();
        throw new Error(`Failed to release expired reservations: ${error.message}`);
    } finally {
        session.endSession();
    }
};

/**
 * Sync inventory (for admin use - recalculate reserved stock)
 * Use this if there's suspected data inconsistency
 */
export const syncInventory = async (productId) => {
    const product = await Product.findById(productId);

    if (!product) {
        throw new Error('Product not found');
    }

    // Calculate actual reserved stock from pending orders
    const pendingOrders = await Order.find({
        orderStatus: { $in: ['pending', 'processing'] },
        paymentStatus: { $nin: ['paid', 'refunded'] },
        'items.product': productId,
    });

    let calculatedReservedStock = 0;
    for (const order of pendingOrders) {
        const orderItem = order.items.find(
            item => item.product.toString() === productId.toString()
        );
        if (orderItem) {
            calculatedReservedStock += orderItem.quantity;
        }
    }

    // Update product if there's a mismatch
    if (product.reservedStock !== calculatedReservedStock) {
        const oldReserved = product.reservedStock;
        product.reservedStock = calculatedReservedStock;
        await product.save();

        return {
            synced: true,
            productId: product._id,
            productName: product.name,
            oldReservedStock: oldReserved,
            newReservedStock: calculatedReservedStock,
            difference: calculatedReservedStock - oldReserved,
        };
    }

    return {
        synced: false,
        message: 'Reserved stock already in sync',
    };
};

export default {
    reserveStockForOrder,
    releaseStockForOrder,
    deductStockForOrder,
    restoreStockForOrder,
    checkStockAvailability,
    getLowStockProducts,
    getOutOfStockProducts,
    releaseExpiredReservations,
    syncInventory,
};

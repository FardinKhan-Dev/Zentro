import cron from 'node-cron';
import Order from '../models/Order.js';
import { releaseStockForOrder } from './inventoryService.js';

/**
 * Cleanup Service
 * Automatically cleans up abandoned pending orders to free up stock and database space.
 */
export const initCleanupService = () => {
    // Run every hour: '0 * * * *'
    // Run every 10 minutes for testing/demo: '*/10 * * * *'
    // Let's use 1 hour interval
    cron.schedule('0 * * * *', async () => {
        console.log('🧹 Running Order Cleanup Service...');
        
        try {
            // Find orders that are:
            // 1. Payment Status: pending
            // 2. Created more than 1 hour ago
            // 3. Payment Method: card (COD pending orders are intentional until delivery, wait.. COD orders are pending? No, we set them to success immediately in controller, but paymentStatus might still be pending? Need to check controller.)
            // Correction: In OrderController, we set COD orders to 'success' (nextStep) but paymentStatus defaults to 'pending'.
            // However, COD orders shouldn't be deleted. They are valid.
            // So we strictly clean up 'card' pending orders.

            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

            const abandonedOrders = await Order.find({
                paymentStatus: 'pending',
                paymentMethod: 'card',
                createdAt: { $lt: oneHourAgo }
            });

            if (abandonedOrders.length === 0) {
                console.log('✨ No abandoned orders found.');
                return;
            }

            console.log(`Found ${abandonedOrders.length} abandoned orders.`);

            for (const order of abandonedOrders) {
                // Release stock
                try {
                    await releaseStockForOrder(order.items);
                    console.log(`📦 Released stock for abandoned order ${order.orderNumber}`);
                } catch (stockError) {
                    console.error(`Failed to release stock for ${order.orderNumber}:`, stockError.message);
                }

                // Delete order
                await Order.findByIdAndDelete(order._id);
                console.log(`❌ Deleted abandoned order ${order.orderNumber}`);
            }

            console.log('🧹 Cleanup complete.');

        } catch (error) {
            console.error('Cleanup Service Error:', error);
        }
    });

    console.log('🕒 Order Cleanup Service initialized (Runs every hour)');
};

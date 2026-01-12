import Order from '../models/Order.js';
import { fetchCourierStatus } from './courierService.js';
import { sendNotification } from './notificationService.js';

/**
 * Start the background cron job for syncing courier statuses.
 * Runs every 5 minutes.
 */
export const startCourierSyncJob = () => {
    console.log('🔄 Courier Sync Job initialized (runs every 5 mins)');

    const runJob = async () => {
        try {
            console.log('⏰ Running Courier Sync Job...');

            // Find orders that are 'shipped' (active) and have a tracking number
            // We don't check 'delivered' orders as they are final.
            const orders = await Order.find({
                orderStatus: 'shipped',
                trackingNumber: { $exists: true, $ne: '' }
            });

            if (orders.length === 0) {
                // console.log('No active shipments to sync.');
                return;
            }

            console.log(`Checking status for ${orders.length} orders...`);

            for (const order of orders) {
                try {
                    const courierData = await fetchCourierStatus(order.trackingNumber);
                    let updated = false;
                    const updates = [];

                    // Update Delivery Status
                    // courierData.status can be 'delivered', 'returned', 'shipped'
                    // We only update if it changed to a final state or distinct state
                    if (courierData.status === 'delivered' && order.orderStatus !== 'delivered') {
                        order.orderStatus = 'delivered';
                        updates.push('Delivered');
                        updated = true;
                    } else if (courierData.status === 'returned' && order.orderStatus !== 'cancelled') {
                        order.orderStatus = 'cancelled';
                        updates.push('Returned');
                        updated = true;
                    }

                    // Update Payment Status (COD logic)
                    if (courierData.payment_collected && order.paymentStatus === 'pending') {
                        order.paymentStatus = 'paid';
                        updates.push('Payment Collected');
                        updated = true;
                    }

                    if (updated) {
                        order.statusHistory.push({
                            status: order.orderStatus,
                            timestamp: new Date(),
                            notes: `Auto-Sync: ${updates.join(', ')}`
                        });
                        await order.save();
                        console.log(`✅ Auto-Updated Order #${order.orderNumber}: ${updates.join(', ')}`);

                        // Send Notification
                        if (order.orderStatus === 'delivered') {
                            await sendNotification(
                                order.user,
                                'Order Delivered! 📦',
                                `Your order #${order.orderNumber} has been successfully delivered.`,
                                'order',
                                order._id
                            );
                        } else if (order.orderStatus === 'cancelled') {
                            await sendNotification(
                                order.user,
                                'Order Returned ↩️',
                                `Your order #${order.orderNumber} was marked as returned/cancelled.`,
                                'alert',
                                order._id
                            );
                        } else if (order.paymentStatus === 'paid') {
                            await sendNotification(
                                order.user,
                                'Payment Received 💰',
                                `Payment for order #${order.orderNumber} has been confirmed.`,
                                'info',
                                order._id
                            );
                        }
                    }

                } catch (err) {
                    console.error(`Failed to sync Order #${order.orderNumber}:`, err.message);
                }
            }
        } catch (error) {
            console.error('Courier Sync Job Error:', error);
        }
    };

    // Run immediately on start (optional, maybe wait 10s)
    setTimeout(runJob, 10000);

    // Run every 5 minutes (300,000 ms)
    setInterval(runJob, 300000);
};

export default {
    startCourierSyncJob
};

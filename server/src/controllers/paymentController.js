import Order from '../models/Order.js';
import { AppError, catchAsync } from '../utils/errorHandler.js';
import { customResponse } from '../utils/response.js';
import {
    createPaymentIntent,
    createCheckoutSession,
    verifyWebhookSignature,
    createRefund,
} from '../services/paymentService.js';
import { deductStockForOrder, releaseStockForOrder } from '../services/inventoryService.js';
import { addOrderConfirmationEmailJob } from '../services/queueService.js';

/**
 * POST /api/payments/create-intent
 * Create a Stripe Payment Intent for an order
 */
export const createIntent = catchAsync(async (req, res, next) => {
    const { orderId } = req.body;
    const userId = req.user.id;

    if (!orderId) {
        throw new AppError('Order ID is required', 400);
    }

    // Verify order belongs to user
    const order = await Order.findById(orderId);

    if (!order) {
        throw new AppError('Order not found', 404);
    }

    if (order.user.toString() !== userId) {
        throw new AppError('You do not have permission to pay for this order', 403);
    }

    if (order.paymentStatus !== 'pending') {
        throw new AppError(`Order payment status is ${order.paymentStatus}`, 400);
    }

    try {
        const paymentData = await createPaymentIntent(orderId);

        return customResponse(res, {
            status: 200,
            success: true,
            message: 'Payment intent created successfully',
            data: paymentData,
        });
    } catch (error) {
        throw new AppError(error.message, 400);
    }
});

/**
 * POST /api/payments/checkout-session
 * Create a Stripe Checkout Session (alternative to payment intent)
 */
export const createSession = catchAsync(async (req, res, next) => {
    const { orderId } = req.body;
    const userId = req.user.id;

    if (!orderId) {
        throw new AppError('Order ID is required', 400);
    }

    const order = await Order.findById(orderId);

    if (!order) {
        throw new AppError('Order not found', 404);
    }

    if (order.user.toString() !== userId) {
        throw new AppError('You do not have permission to pay for this order', 403);
    }

    const successUrl = `${process.env.CLIENT_URL}/orders/${orderId}/success`;
    const cancelUrl = `${process.env.CLIENT_URL}/orders/${orderId}/cancel`;

    try {
        const sessionData = await createCheckoutSession(orderId, successUrl, cancelUrl);

        return customResponse(res, {
            status: 200,
            success: true,
            message: 'Checkout session created successfully',
            data: sessionData,
        });
    } catch (error) {
        throw new AppError(error.message, 400);
    }
});

/**
 * POST /api/payments/webhook
 * Handle Stripe webhook events
 * This endpoint must use raw body parser, not JSON
 */
export const handleWebhook = async (req, res) => {
    const signature = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
        console.error('Stripe webhook secret not configured');
        return res.status(500).send('Webhook secret not configured');
    }

    let event;

    try {
        // Verify webhook signature
        event = verifyWebhookSignature(req.body, signature, webhookSecret);
    } catch (error) {
        console.error('Webhook signature verification failed:', error.message);
        return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    // Handle different event types
    try {
        switch (event.type) {
            case 'payment_intent.succeeded':
                await handlePaymentSuccess(event.data.object);
                break;

            case 'payment_intent.payment_failed':
                await handlePaymentFailure(event.data.object);
                break;

            case 'charge.refunded':
                await handleRefund(event.data.object);
                break;

            case 'checkout.session.completed':
                await handleCheckoutComplete(event.data.object);
                break;

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        // Return 200 to acknowledge receipt
        res.status(200).json({ received: true });
    } catch (error) {
        console.error('Error handling webhook:', error);
        res.status(500).json({ error: 'Webhook handler failed' });
    }
};

/**
 * Handle successful payment
 */
const handlePaymentSuccess = async (paymentIntent) => {
    console.log(`💰 Payment succeeded: ${paymentIntent.id}`);

    const orderId = paymentIntent.metadata.orderId;

    if (!orderId) {
        console.error('No order ID in payment intent metadata');
        return;
    }

    const order = await Order.findById(orderId).populate('user', 'name email');

    if (!order) {
        console.error(`Order ${orderId} not found`);
        return;
    }

    // Mark order as paid
    order.markAsPaid(paymentIntent.id);
    await order.save();

    // Deduct stock (convert from reserved to actual deduction)
    try {
        const { lowStockProducts } = await deductStockForOrder(order.items);

        // TODO: Queue low stock notification if products are running low
        if (lowStockProducts.length > 0) {
            console.log('Low stock detected:', lowStockProducts);
        }
    } catch (error) {
        console.error('Failed to deduct stock:', error.message);
        // Continue anyway - payment was successful
    }

    // Queue order confirmation email
    try {
        await addOrderConfirmationEmailJob(order.user.email, {
            orderNumber: order.orderNumber,
            orderId: order._id.toString(),
            customerName: order.user.name,
            items: order.items,
            totalAmount: order.totalAmount,
            shippingAddress: order.shippingAddress,
        });
    } catch (error) {
        console.error('Failed to queue order confirmation email:', error.message);
    }

    console.log(`✅ Order ${order.orderNumber} marked as paid`);
};

/**
 * Handle failed payment
 */
const handlePaymentFailure = async (paymentIntent) => {
    console.log(`❌ Payment failed: ${paymentIntent.id}`);

    const orderId = paymentIntent.metadata.orderId;

    if (!orderId) {
        console.error('No order ID in payment intent metadata');
        return;
    }

    const order = await Order.findById(orderId);

    if (!order) {
        console.error(`Order ${orderId} not found`);
        return;
    }

    // Mark payment as failed
    order.paymentStatus = 'failed';
    await order.save();

    // Release reserved stock  
    try {
        await releaseStockForOrder(order.items);
        console.log(`📦 Stock released for failed payment: ${order.orderNumber}`);
    } catch (error) {
        console.error('Failed to release stock:', error.message);
    }

    console.log(`Order ${order.orderNumber} payment failed`);
};

/**
 * Handle refund
 */
const handleRefund = async (charge) => {
    console.log(`💸 Refund processed: ${charge.id}`);

    const paymentIntentId = charge.payment_intent;

    // Find order by payment intent
    const order = await Order.findOne({ paymentIntent: paymentIntentId });

    if (!order) {
        console.error(`Order with payment intent ${paymentIntentId} not found`);
        return;
    }

    order.paymentStatus = 'refunded';
    await order.save();

    console.log(`Order ${order.orderNumber} refunded`);
};

/**
 * Handle Stripe Checkout session completion
 */
const handleCheckoutComplete = async (session) => {
    console.log(`🛒 Checkout session completed: ${session.id}`);

    const orderId = session.client_reference_id || session.metadata?.orderId;

    if (!orderId) {
        console.error('No order ID in checkout session');
        return;
    }

    // Similar to payment success handling
    const order = await Order.findById(orderId).populate('user', 'name email');

    if (!order) {
        console.error(`Order ${orderId} not found`);
        return;
    }

    order.markAsPaid(session.payment_intent);
    await order.save();

    // Deduct stock
    try {
        await deductStockForOrder(order.items);
    } catch (error) {
        console.error('Failed to deduct stock:', error.message);
    }

    // Queue confirmation email
    try {
        await addOrderConfirmationEmailJob(order.user.email, {
            orderNumber: order.orderNumber,
            customerName: order.user.name,
            items: order.items,
            totalAmount: order.totalAmount,
        });
    } catch (error) {
        console.error('Failed to queue email:', error.message);
    }
};

/**
 * POST /api/payments/refund
 * Create a refund for an order (Admin only)
 */
export const refundOrder = catchAsync(async (req, res, next) => {
    const { orderId, amount, reason } = req.body;

    if (!orderId) {
        throw new AppError('Order ID is required', 400);
    }

    const order = await Order.findById(orderId);

    if (!order) {
        throw new AppError('Order not found', 404);
    }

    if (order.paymentStatus !== 'paid') {
        throw new AppError('Order has not been paid', 400);
    }

    if (!order.paymentIntent) {
        throw new AppError('No payment intent found for this order', 400);
    }

    try {
        const refund = await createRefund(order.paymentIntent, amount, reason);

        // Update order status will be handled by webhook
        // But we can update it immediately for better UX
        order.paymentStatus = 'refunded';
        await order.save();

        return customResponse(res, {
            status: 200,
            success: true,
            message: 'Refund processed successfully',
            data: { refund, order },
        });
    } catch (error) {
        throw new AppError(error.message, 400);
    }
});

export default {
    createIntent,
    createSession,
    handleWebhook,
    refundOrder,
};

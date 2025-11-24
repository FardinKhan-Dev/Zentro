import { getStripeInstance } from '../config/stripe.js';
import Order from '../models/Order.js';

/**
 * Payment Service
 * Handles Stripe payment operations
 */

/**
 * Create a Stripe Payment Intent
 * This allows the client to process payment on the frontend
 */
export const createPaymentIntent = async (orderId, metadata = {}) => {
    const stripe = getStripeInstance();

    if (!stripe) {
        throw new Error('Stripe is not configured');
    }

    // Get order details
    const order = await Order.findById(orderId).populate('user', 'email');

    if (!order) {
        throw new Error('Order not found');
    }

    if (order.paymentStatus !== 'pending') {
        throw new Error(`Order payment status is ${order.paymentStatus}. Cannot create payment intent.`);
    }

    // Convert amount to cents (Stripe uses smallest currency unit)
    const amountInCents = Math.round(order.totalAmount * 100);

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: 'usd',
            metadata: {
                orderId: order._id.toString(),
                orderNumber: order.orderNumber,
                userId: order.user._id.toString(),
                ...metadata,
            },
            receipt_email: order.user.email,
            description: `Order #${order.orderNumber}`,
            // Automatic payment methods enable various payment types
            automatic_payment_methods: {
                enabled: true,
            },
        });

        // Save payment intent ID to order
        order.paymentIntent = paymentIntent.id;
        await order.save();

        return {
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            amount: order.totalAmount,
            currency: 'USD',
        };
    } catch (error) {
        throw new Error(`Failed to create payment intent: ${error.message}`);
    }
};

/**
 * Create a Stripe Checkout Session (Alternative approach)
 * This redirects to Stripe's hosted checkout page
 */
export const createCheckoutSession = async (orderId, successUrl, cancelUrl) => {
    const stripe = getStripeInstance();

    if (!stripe) {
        throw new Error('Stripe is not configured');
    }

    const order = await Order.findById(orderId)
        .populate('user', 'email')
        .populate('items.product', 'name images');

    if (!order) {
        throw new Error('Order not found');
    }

    // Prepare line items for Stripe
    const lineItems = order.items.map(item => ({
        price_data: {
            currency: 'usd',
            product_data: {
                name: item.name,
                images: item.image ? [item.image] : [],
            },
            unit_amount: Math.round(item.price * 100), // Convert to cents
        },
        quantity: item.quantity,
    }));

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: successUrl,
            cancel_url: cancelUrl,
            customer_email: order.user.email,
            client_reference_id: order._id.toString(),
            metadata: {
                orderId: order._id.toString(),
                orderNumber: order.orderNumber,
            },
        });

        return {
            sessionId: session.id,
            url: session.url,
        };
    } catch (error) {
        throw new Error(`Failed to create checkout session: ${error.message}`);
    }
};

/**
 * Retrieve payment intent status
 */
export const getPaymentIntentStatus = async (paymentIntentId) => {
    const stripe = getStripeInstance();

    if (!stripe) {
        throw new Error('Stripe is not configured');
    }

    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        return {
            id: paymentIntent.id,
            status: paymentIntent.status,
            amount: paymentIntent.amount / 100, // Convert back to dollars
            currency: paymentIntent.currency,
            created: new Date(paymentIntent.created * 1000),
        };
    } catch (error) {
        throw new Error(`Failed to retrieve payment intent: ${error.message}`);
    }
};

/**
 * Cancel a payment intent
 */
export const cancelPaymentIntent = async (paymentIntentId) => {
    const stripe = getStripeInstance();

    if (!stripe) {
        throw new Error('Stripe is not configured');
    }

    try {
        const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);

        return {
            id: paymentIntent.id,
            status: paymentIntent.status,
            canceled: true,
        };
    } catch (error) {
        throw new Error(`Failed to cancel payment intent: ${error.message}`);
    }
};

/**
 * Create a refund
 */
export const createRefund = async (paymentIntentId, amount = null, reason = 'requested_by_customer') => {
    const stripe = getStripeInstance();

    if (!stripe) {
        throw new Error('Stripe is not configured');
    }

    try {
        const refundData = {
            payment_intent: paymentIntentId,
            reason,
        };

        // If amount is specified, create partial refund
        if (amount !== null) {
            refundData.amount = Math.round(amount * 100); // Convert to cents
        }

        const refund = await stripe.refunds.create(refundData);

        return {
            id: refund.id,
            amount: refund.amount / 100,
            status: refund.status,
            reason: refund.reason,
        };
    } catch (error) {
        throw new Error(`Failed to create refund: ${error.message}`);
    }
};

/**
 * Verify Stripe webhook signature
 */
export const verifyWebhookSignature = (payload, signature, secret) => {
    const stripe = getStripeInstance();

    if (!stripe) {
        throw new Error('Stripe is not configured');
    }

    if (!secret) {
        throw new Error('Webhook secret not configured');
    }

    try {
        const event = stripe.webhooks.constructEvent(payload, signature, secret);
        return event;
    } catch (error) {
        throw new Error(`Webhook signature verification failed: ${error.message}`);
    }
};

export default {
    createPaymentIntent,
    createCheckoutSession,
    getPaymentIntentStatus,
    cancelPaymentIntent,
    createRefund,
    verifyWebhookSignature,
};

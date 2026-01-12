import express from 'express';
import {
    createIntent,
    createSession,
    handleWebhook,
    refundOrder,
    verifyPayment,
} from '../controllers/paymentController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   POST /api/payments/create-intent
 * @desc    Create Stripe payment intent for an order
 * @access  Private
 */
router.post('/create-intent', protect, createIntent);

/**
 * @route   POST /api/payments/checkout-session
 * @desc    Create Stripe checkout session (alternative payment flow)
 * @access  Private
 */
router.post('/checkout-session', protect, createSession);

/**
 * @route   POST /api/payments/verify
 * @desc    Verify payment status explicitly
 * @access  Private
 */
router.post('/verify', protect, verifyPayment);

/**
 * @route   POST /api/payments/webhook
 * @desc    Handle Stripe webhook events
 * @access  Public (Stripe calls this)
 * @note    This route MUST be registered with express.raw() body parser
 */
router.post('/webhook', handleWebhook);

/**
 * @route   POST /api/payments/refund
 * @desc    Create refund for an order
 * @access  Private/Admin
 */
router.post('/refund', protect, restrictTo('admin'), refundOrder);

export default router;

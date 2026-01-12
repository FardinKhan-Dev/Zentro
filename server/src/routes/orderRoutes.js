import express from 'express';
import {
    createOrder,
    getUserOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
    getAllOrders,
    confirmCodOrder
} from '../controllers/orderController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// All order routes require authentication
router.use(protect);

/**
 * @route   POST /api/orders
 * @desc    Create new order from cart
 * @access  Private
 */
router.post('/', createOrder);

/**
 * @route   GET /api/orders
 * @desc    Get current user's orders
 * @access  Private
 */
router.get('/', getUserOrders);

/**
 * @route   GET /api/orders/admin/all
 * @desc    Get all orders (admin only)
 * @access  Private/Admin
 */
router.get('/admin/all', restrictTo('admin'), getAllOrders);

/**
 * @route   GET /api/orders/:id
 * @desc    Get specific order by ID
 * @access  Private
 */
router.get('/:id', getOrderById);

/**
 * @route   PATCH /api/orders/:id/status
 * @desc    Update order status (admin only)
 * @access  Private/Admin
 */
router.patch('/:id/status', restrictTo('admin'), updateOrderStatus);

/**
 * @route   POST /api/orders/:id/cancel
 * @desc    Cancel order
 * @access  Private
 */
router.post('/:id/cancel', cancelOrder);

/**
 * @route   POST /api/orders/:id/confirm-cod
 * @desc    Confirm order as COD
 * @access  Private
 */
router.post('/:id/confirm-cod', confirmCodOrder);



export default router;

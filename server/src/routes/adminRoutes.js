import express from 'express';
import {
    getDashboardOverview,
    getSalesAnalytics,
    getProductAnalytics,
    getUserAnalytics,
    getAllOrders,
    updateOrderStatus,
    getAllUsers,
    updateUserRole,
    getUserDetails,
} from '../controllers/adminController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * Admin Routes - All protected with admin role
 */

// Protect all routes - must be authenticated
router.use(protect);

// Restrict all routes to admin only
router.use(restrictTo('admin'));

// Dashboard
router.get('/stats', getDashboardOverview);

// Analytics
router.get('/analytics/sales', getSalesAnalytics);
router.get('/analytics/products', getProductAnalytics);
router.get('/analytics/users', getUserAnalytics);

// Order Management
router.get('/orders', getAllOrders);
router.patch('/orders/:orderId/status', updateOrderStatus);

// User Management
router.get('/users', getAllUsers);
router.get('/users/:userId', getUserDetails);
router.patch('/users/:userId/role', updateUserRole);

export default router;

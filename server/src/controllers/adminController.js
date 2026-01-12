import { catchAsync as CatchAsync } from '../utils/errorHandler.js';
import { AppError } from '../utils/errorHandler.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import {
    getDashboardStats,
    getSalesData,
    getTopViewedProducts,
    getBestSellingProducts,
    getLowStockProducts,
    getUserStats,
} from '../services/analyticsService.js';
import { sendNotification } from '../services/notificationService.js';

/**
 * Admin Controller - Admin-only operations
 * All routes protected with admin role
 */

// ==================== DASHBOARD ====================

/**
 * Get dashboard overview statistics
 * GET /api/admin/stats
 */
export const getDashboardOverview = CatchAsync(async (req, res) => {
    const stats = await getDashboardStats();

    res.status(200).json({
        status: 'success',
        data: stats,
    });
});

// ==================== ANALYTICS ====================

/**
 * Get sales analytics
 * GET /api/admin/analytics/sales?startDate=2024-01-01&endDate=2024-12-31
 */
export const getSalesAnalytics = CatchAsync(async (req, res) => {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return res.status(400).json({
            status: 'fail',
            message: 'Please provide startDate and endDate query parameters',
        });
    }

    const salesData = await getSalesData(startDate, endDate);

    // Calculate aggregates
    const totalRevenue = salesData.reduce((acc, curr) => acc + curr.revenue, 0);
    const totalOrders = salesData.reduce((acc, curr) => acc + curr.orders, 0);

    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Note: Conversion Rate requires 'total visitors' tracking which is not yet implemented.
    // For now, we returns 0 or could estimate based on Views if available.
    // Let's keep it 0 to be accurate to known data.
    const conversionRate = 0;

    res.status(200).json({
        status: 'success',
        data: {
            sales: salesData,
            averageOrderValue,
            conversionRate,
            period: { startDate, endDate },
        },
    });
});

/**
 * Get product analytics
 * GET /api/admin/analytics/products
 */
export const getProductAnalytics = CatchAsync(async (req, res) => {
    const [topViewed, bestSellers, lowStock] = await Promise.all([
        getTopViewedProducts(10),
        getBestSellingProducts(10),
        getLowStockProducts(10),
    ]);

    // Format top viewed products for chart
    const formattedTopViewed = topViewed.map(item => ({
        name: item.product?.name || 'Unknown',
        views: item.views,
        id: item.product?._id
    }));

    res.status(200).json({
        status: 'success',
        data: {
            topViewed: formattedTopViewed,
            bestSellers,
            lowStock,
        },
    });
});

/**
 * Get user analytics
 * GET /api/admin/analytics/users
 */
export const getUserAnalytics = CatchAsync(async (req, res) => {
    const userStats = await getUserStats();

    // Get user growth data (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const userGrowth = await User.aggregate([
        {
            $match: {
                createdAt: { $gte: thirtyDaysAgo },
            },
        },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                count: { $sum: 1 },
            },
        },
        {
            $sort: { _id: 1 },
        },
    ]);

    // Format growth data for chart
    const formattedGrowth = userGrowth.map(item => ({
        date: item._id,
        count: item.count
    }));

    res.status(200).json({
        status: 'success',
        data: {
            stats: userStats,
            growth: formattedGrowth,
        },
    });
});

// ==================== ORDER MANAGEMENT ====================

/**
 * Get all orders with filters
 * GET /api/admin/orders?status=pending&page=1&limit=20
 */
export const getAllOrders = CatchAsync(async (req, res) => {
    const { status, page = 1, limit = 20, search } = req.query;

    const query = {
        // Hide abandoned checkout sessions (pending card orders)
        $or: [
            { paymentMethod: 'cod' },
            { paymentStatus: { $ne: 'pending' } }
        ]
    };

    if (status) {
        query.orderStatus = status;
    }

    if (search) {
        query.$or = [
            { orderNumber: { $regex: search, $options: 'i' } },
            { 'shippingAddress.street': { $regex: search, $options: 'i' } },
        ];
    }

    const skip = (page - 1) * limit;

    const [orders, total, stats] = await Promise.all([
        Order.find(query)
            .populate('user', 'name email')
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

    res.status(200).json({
        status: 'success',
        results: orders.length,
        data: {
            orders,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit),
            },
            stats: globalStats
        },
    });
});

/**
 * Update order status
 * PATCH /api/admin/orders/:orderId/status
 */
export const updateOrderStatus = CatchAsync(async (req, res, next) => {
    const { orderId } = req.params;
    const { status, notes, paymentStatus, trackingNumber } = req.body;

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];

    if (status && !validStatuses.includes(status)) {
        return next(new AppError('Invalid order status', 400));
    }

    const order = await Order.findById(orderId);

    if (!order) {
        return next(new AppError('Order not found', 404));
    }

    const updates = [];

    // Update status
    if (status && status !== order.orderStatus) {
        order.orderStatus = status;
        updates.push(`Status: ${status}`);
    }

    // Update payment status if provided
    if (paymentStatus && validPaymentStatuses.includes(paymentStatus)) {
        order.paymentStatus = paymentStatus;
        updates.push(`Payment: ${paymentStatus}`);
    }

    // Update tracking number if provided
    if (trackingNumber) {
        order.trackingNumber = trackingNumber;
        updates.push(`Tracking: ${trackingNumber}`);
    }

    // Add to status history
    order.statusHistory.push({
        status: order.orderStatus,
        timestamp: new Date(),
        notes: notes || `Updated by admin: ${updates.join(', ')}`,
    });

    await order.save();

    // Send Notification to User
    await sendNotification(
        order.user,
        `Order Update: ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        `Your order #${order.orderNumber} is now ${status}.`,
        'order',
        order._id
    );

    res.status(200).json({
        status: 'success',
        data: {
            order,
        },
    });
});

// ==================== USER MANAGEMENT ====================

/**
 * Get all users
 * GET /api/admin/users?page=1&limit=20&search=john
 */
export const getAllUsers = CatchAsync(async (req, res) => {
    const { page = 1, limit = 20, search, role } = req.query;

    const query = {};

    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
        ];
    }

    if (role) {
        query.role = role;
    }

    const skip = (page - 1) * limit;

    const [users, total, stats] = await Promise.all([
        User.find(query)
            .select('-password -refreshToken')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit)),
        User.countDocuments(query),
        User.aggregate([
            {
                $group: {
                    _id: null,
                    totalUsers: { $sum: 1 },
                    verifiedUsers: { $sum: { $cond: ["$isVerified", 1, 0] } },
                    adminUsers: { $sum: { $cond: [{ $eq: ["$role", "admin"] }, 1, 0] } },
                    newUsers: {
                        $sum: {
                            $cond: [
                                { $gte: ["$createdAt", new Date(new Date().setDate(new Date().getDate() - 30))] },
                                1, 0
                            ]
                        }
                    }
                }
            }
        ])
    ]);

    const globalStats = stats.length > 0 ? stats[0] : {
        totalUsers: 0, verifiedUsers: 0, adminUsers: 0, newUsers: 0
    };
    delete globalStats._id;

    res.status(200).json({
        status: 'success',
        results: users.length,
        data: {
            users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit),
            },
            stats: globalStats
        },
    });
});

/**
 * Update user role
 * PATCH /api/admin/users/:userId/role
 */
export const updateUserRole = CatchAsync(async (req, res, next) => {
    const { userId } = req.params;
    const { role } = req.body;

    const validRoles = ['user', 'admin'];

    if (!validRoles.includes(role)) {
        return next(new AppError('Invalid role. Must be "user" or "admin"', 400));
    }

    const user = await User.findByIdAndUpdate(
        userId,
        { role },
        { new: true, runValidators: true }
    ).select('-password -refreshToken');

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            user,
        },
    });
});

/**
 * Get user details with order history
 * GET /api/admin/users/:userId
 */
export const getUserDetails = CatchAsync(async (req, res, next) => {
    const { userId } = req.params;

    const user = await User.findById(userId).select('-password -refreshToken');

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    // Get user's order history
    const orders = await Order.find({ user: userId })
        .sort({ createdAt: -1 })
        .select('orderNumber totalAmount orderStatus createdAt');

    // Calculate user stats
    const totalSpent = await Order.aggregate([
        { $match: { user: user._id, paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            user,
            orders,
            stats: {
                totalOrders: orders.length,
                totalSpent: totalSpent[0]?.total || 0,
            },
        },
    });
});

export default {
    getDashboardOverview,
    getSalesAnalytics,
    getProductAnalytics,
    getUserAnalytics,
    getAllOrders,
    updateOrderStatus,
    getAllUsers,
    updateUserRole,
    getUserDetails,
};

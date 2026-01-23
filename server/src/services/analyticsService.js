import { getRedisClient } from '../config/redis.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

/**
 * Analytics Service - Redis-based metrics tracking
 * Provides real-time analytics for admin dashboard
 */

// Redis client is retrieved lazily in functions

// ==================== SALES ANALYTICS ====================

/**
 * Track a sale in Redis
 * Called when an order is paid
 */
export const trackSale = async (orderData) => {
    const redis = getRedisClient();
    if (!redis) return;

    const { totalAmount, items, createdAt } = orderData;
    const date = new Date(createdAt).toISOString().split('T')[0]; // YYYY-MM-DD

    try {
        // Increment daily sales
        const salesKey = `analytics:sales:daily:${date}`;
        await redis.hIncrBy(salesKey, 'revenue', Math.round(totalAmount * 100)); // Store as cents
        await redis.hIncrBy(salesKey, 'orders', 1);
        await redis.hIncrBy(salesKey, 'items', items.length);
        await redis.expire(salesKey, 90 * 24 * 60 * 60); // Keep for 90 days

        // Update product sales counters
        for (const item of items) {
            await redis.zIncrBy('analytics:products:sales', item.quantity, item.product.toString());
        }

        console.log(`✓ Sale tracked: $${totalAmount} on ${date}`);
    } catch (error) {
        console.error('Error tracking sale:', error);
    }
};

/**
 * Get sales data for a date range
 */
export const getSalesData = async (startDate, endDate) => {
    const redis = getRedisClient();

    // Try Redis first
    if (redis) {
        try {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const salesData = [];

            // Iterate through each day
            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                const date = d.toISOString().split('T')[0];
                const key = `analytics:sales:daily:${date}`;

                const data = await redis.hGetAll(key);

                salesData.push({
                    date,
                    revenue: data.revenue ? parseFloat(data.revenue) / 100 : 0,
                    orders: data.orders ? parseInt(data.orders) : 0,
                    items: data.items ? parseInt(data.items) : 0,
                });
            }

            return salesData;
        } catch (error) {
            console.error('Error getting sales data from Redis:', error);
            // Fall through to database fallback
        }
    }

    // Fallback to database when Redis unavailable
    console.log('⚠️  Using database fallback for sales data (Redis unavailable)');
    try {
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Query database for orders in date range
        const orders = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: start, $lte: end },
                    paymentStatus: 'paid'
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    revenue: { $sum: '$totalAmount' },
                    orders: { $sum: 1 },
                    items: { $sum: { $size: '$items' } }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        // Create a map of dates to data
        const dataMap = new Map(orders.map(o => [o._id, o]));

        // Fill in all dates in range (including zeros)
        const salesData = [];
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const date = d.toISOString().split('T')[0];
            const data = dataMap.get(date);

            salesData.push({
                date,
                revenue: data?.revenue || 0,
                orders: data?.orders || 0,
                items: data?.items || 0,
            });
        }

        return salesData;
    } catch (error) {
        console.error('Error getting sales data from database:', error);
        return [];
    }
};

/**
 * Get total sales metrics
 */
export const getTotalSalesMetrics = async () => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const thisWeekStart = new Date();
        thisWeekStart.setDate(thisWeekStart.getDate() - 7);
        const thisMonthStart = new Date();
        thisMonthStart.setDate(1);

        // Get from database for accurate totals
        const [todayOrders, weekOrders, monthOrders, totalOrders] = await Promise.all([
            Order.countDocuments({
                createdAt: { $gte: new Date(today) },
                paymentStatus: 'paid',
            }),
            Order.countDocuments({
                createdAt: { $gte: thisWeekStart },
                paymentStatus: 'paid',
            }),
            Order.countDocuments({
                createdAt: { $gte: thisMonthStart },
                paymentStatus: 'paid',
            }),
            Order.countDocuments({ paymentStatus: 'paid' }),
        ]);

        const [todayRevenue, weekRevenue, monthRevenue, totalRevenue] = await Promise.all([
            Order.aggregate([
                { $match: { createdAt: { $gte: new Date(today) }, paymentStatus: 'paid' } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } },
            ]),
            Order.aggregate([
                { $match: { createdAt: { $gte: thisWeekStart }, paymentStatus: 'paid' } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } },
            ]),
            Order.aggregate([
                { $match: { createdAt: { $gte: thisMonthStart }, paymentStatus: 'paid' } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } },
            ]),
            Order.aggregate([
                { $match: { paymentStatus: 'paid' } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } },
            ]),
        ]);

        return {
            today: {
                orders: todayOrders,
                revenue: todayRevenue[0]?.total || 0,
            },
            week: {
                orders: weekOrders,
                revenue: weekRevenue[0]?.total || 0,
            },
            month: {
                orders: monthOrders,
                revenue: monthRevenue[0]?.total || 0,
            },
            total: {
                orders: totalOrders,
                revenue: totalRevenue[0]?.total || 0,
            },
        };
    } catch (error) {
        console.error('Error getting sales metrics:', error);
        return null;
    }
};

// ==================== PRODUCT ANALYTICS ====================

/**
 * Track product view
 */
export const trackProductView = async (productId) => {
    const redis = getRedisClient();
    if (!redis) return;

    try {
        await redis.zIncrBy('analytics:products:views', 1, productId.toString());

        // Also track daily views
        const date = new Date().toISOString().split('T')[0];
        await redis.hIncrBy(`analytics:products:views:${date}`, productId.toString(), 1);
        await redis.expire(`analytics:products:views:${date}`, 90 * 24 * 60 * 60);
    } catch (error) {
        console.error('Error tracking product view:', error);
    }
};

/**
 * Get top viewed products
 */
export const getTopViewedProducts = async (limit = 10) => {
    const redis = getRedisClient();

    // Try Redis first
    if (redis) {
        try {
            const productIdsWithScores = await redis.zRangeWithScores('analytics:products:views', 0, limit - 1, {
                REV: true
            });

            const products = [];

            for (const item of productIdsWithScores) {
                const productId = item.value;
                const views = item.score;

                try {
                    const product = await Product.findById(productId).select('name price images');

                    if (product) {
                        products.push({
                            product,
                            views,
                        });
                    }
                } catch (err) {
                    console.error(`Error finding product ${productId}:`, err);
                }
            }

            if (products.length > 0) return products;
            // Fall through if no products found
        } catch (error) {
            console.error('Error getting top viewed products from Redis:', error);
            // Fall through to database fallback
        }
    }

    // Fallback: Return empty array (views not tracked without Redis)
    console.log('⚠️  Product views not available (Redis disabled)');
    return [];
};

/**
 * Get best selling products
 */
export const getBestSellingProducts = async (limit = 10) => {
    const redis = getRedisClient();

    // Try Redis first
    if (redis) {
        try {
            const productIdsWithScores = await redis.zRangeWithScores('analytics:products:sales', 0, limit - 1, {
                REV: true
            });

            const products = [];

            for (const item of productIdsWithScores) {
                const productId = item.value;
                const sales = item.score;

                const product = await Product.findById(productId).select('name price images');
                if (product) {
                    products.push({
                        product,
                        sales,
                    });
                }
            }

            if (products.length > 0) return products;
            // Fall through if no products found
        } catch (error) {
            console.error('Error getting best sellers from Redis:', error);
            // Fall through to database fallback
        }
    }

    // Fallback to database
    console.log('⚠️  Using database fallback for best sellers (Redis unavailable)');
    try {
        // Aggregate sales from Order items
        const topSellers = await Order.aggregate([
            {
                $match: { paymentStatus: 'paid' }
            },
            {
                $unwind: '$items'
            },
            {
                $group: {
                    _id: '$items.product',
                    soldQuantity: { $sum: '$items.quantity' }
                }
            },
            {
                $sort: { soldQuantity: -1 }
            },
            {
                $limit: limit
            }
        ]);

        const products = [];
        for (const item of topSellers) {
            const product = await Product.findById(item._id).select('name price images');
            if (product) {
                products.push({
                    product,
                    sales: item.soldQuantity,
                    soldQuantity: item.soldQuantity  // Add both for compatibility
                });
            }
        }

        return products;
    } catch (error) {
        console.error('Error getting best sellers from database:', error);
        return [];
    }
};

/**
 * Get low stock products
 */
export const getLowStockProducts = async (threshold = 10) => {
    try {
        const products = await Product.find({ stock: { $lte: threshold, $gt: 0 } })
            .select('name stock price')
            .sort({ stock: 1 })
            .limit(20);

        return products;
    } catch (error) {
        console.error('Error getting low stock products:', error);
        return [];
    }
};

// ==================== USER ANALYTICS ====================

/**
 * Get user statistics
 */
export const getUserStats = async () => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);

        const [totalUsers, newToday, newThisWeek, newThisMonth, activeUsers] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ createdAt: { $gte: today } }),
            User.countDocuments({ createdAt: { $gte: weekAgo } }),
            User.countDocuments({ createdAt: { $gte: monthAgo } }),
            User.countDocuments({ isVerified: true }),
        ]);

        return {
            total: totalUsers,
            newToday,
            newThisWeek,
            newThisMonth,
            active: activeUsers,
        };
    } catch (error) {
        console.error('Error getting user stats:', error);
        return null;
    }
};

// ==================== DASHBOARD OVERVIEW ====================

/**
 * Get complete dashboard statistics
 */
export const getDashboardStats = async () => {
    try {
        const results = await Promise.allSettled([
            getTotalSalesMetrics(),
            getUserStats(),
            Product.countDocuments(),
            Order.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('user', 'name email')
                .select('orderNumber totalAmount orderStatus createdAt'),
            getBestSellingProducts(5),
        ]);

        const salesMetrics = results[0].status === 'fulfilled' ? results[0].value : null;
        const userStats = results[1].status === 'fulfilled' ? results[1].value : null;
        const productCount = results[2].status === 'fulfilled' ? results[2].value : 0;
        const recentOrders = results[3].status === 'fulfilled' ? results[3].value : [];
        const topProducts = results[4].status === 'fulfilled' ? results[4].value : [];

        // Log failures
        results.forEach((result, index) => {
            if (result.status === 'rejected') {
                console.error(`Error in getDashboardStats index ${index}:`, result.reason);
            }
        });

        return {
            sales: salesMetrics,
            users: userStats,
            products: {
                total: productCount,
            },
            recentOrders,
            topProducts,
        };
    } catch (error) {
        console.error('Error getting dashboard stats:', error);
        return null; // Fallback only if something catastrophic happens outside Promise.allSettled
    }
};

export default {
    trackSale,
    getSalesData,
    getTotalSalesMetrics,
    trackProductView,
    getTopViewedProducts,
    getBestSellingProducts,
    getLowStockProducts,
    getUserStats,
    getDashboardStats,
};

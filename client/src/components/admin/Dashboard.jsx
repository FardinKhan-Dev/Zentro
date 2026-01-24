import { useGetAdminStatsQuery, useGetSalesAnalyticsQuery, useGetProductAnalyticsQuery } from '../../features/admin/adminApi';
import { format, subDays } from 'date-fns';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { FiUsers } from '@react-icons/all-files/fi/FiUsers';
import { FiBox } from '@react-icons/all-files/fi/FiBox';
import { FiShoppingCart } from '@react-icons/all-files/fi/FiShoppingCart';
import { FiActivity } from '@react-icons/all-files/fi/FiActivity';
import { useSocket } from '../../hooks/useSocket';
import { useAuth } from '../../hooks/useAuth';
import { notificationApi } from '../../features/notifications/notificationApi';
import toast from 'react-hot-toast';
import StatsCard from './widgets/StatsCard';
import SalesChart from './widgets/SalesChart';
import RecentOrdersTable from './widgets/RecentOrdersTable';
import TopProductsList from './widgets/TopProductsList';
import ProductViewsChart from './widgets/ProductViewsChart';

const Dashboard = () => {
    const dispatch = useDispatch();
    const { user } = useAuth();
    const { socket, isConnected } = useSocket();

    const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useGetAdminStatsQuery();
    const { data: productAnalytics, isLoading: productLoading } = useGetProductAnalyticsQuery();
    const [timeRange, setTimeRange] = useState('weekly'); // 'weekly' or 'monthly'

    const endDate = format(new Date(), 'yyyy-MM-dd');
    const startDate = format(subDays(new Date(), timeRange === 'weekly' ? 7 : 30), 'yyyy-MM-dd');

    const { data: salesData, isLoading: salesLoading } = useGetSalesAnalyticsQuery({ startDate, endDate });

    // 🔔 Listen for Real-Time Notifications (Admin)
    useEffect(() => {
        if (socket && isConnected && user?._id) {
            // Join admin's user room
            socket.emit('join:user', user._id);
            console.log(`📢 Admin joined Socket.IO room: user:${user._id}`);

            const handleNewNotification = (notification) => {
                console.log('🔔 Admin received notification:', notification);

                // Invalidate cache to refresh notification list
                dispatch(notificationApi.util.invalidateTags(['Notifications', 'UnreadCount']));

                // Show Toast with sound
                toast(notification.title, {
                    icon: notification.type === 'order' ? '💰' : '🔔',
                    duration: 5000,
                    position: 'top-right',
                    style: {
                        background: '#10B981',
                        color: '#fff',
                        fontWeight: 'bold'
                    }
                });

                // Refetch stats if it's an order notification
                if (notification.type === 'order') {
                    refetchStats();
                }
            };

            socket.on('notification:new', handleNewNotification);

            return () => {
                socket.off('notification:new', handleNewNotification);
            };
        }
    }, [socket, isConnected, user, dispatch, refetchStats]);

    if (statsLoading || salesLoading || productLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6C5DD3]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold dark:text-white text-gray-900">Dashboard Overview</h1>
                    <p className="text-xl text-gray-500 mt-1 dark:text-gray-400">Welcome back, here's what's happening today.</p>
                </div>
                <div className="flex items-center gap-3 bg-white/50 dark:bg-white/5 backdrop-blur-md px-4 py-2 rounded-xl border border-gray-100 dark:border-white/10 text-sm font-medium text-gray-600 dark:text-gray-300">
                    <span>{format(new Date(), 'EEEE, MMMM do, yyyy')}</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Customers */}
                <div className="relative overflow-hidden p-6 rounded-2xl bg-linear-to-br from-violet-600 to-purple-600 text-white shadow-lg transition-transform hover:scale-[1.02] group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                        <FiUsers className="w-24 h-24 transform translate-x-4 -translate-y-4" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
                                <FiUsers className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-sm font-bold bg-white/20 px-2.5 py-1 rounded-lg backdrop-blur-md border border-white/10">
                                Customers
                            </span>
                        </div>
                        <h3 className="text-3xl font-bold tracking-tight">{stats?.data?.users?.total || 0}</h3>
                        <p className="text-violet-100 text-sm mt-1 font-medium">Active users</p>
                    </div>
                </div>

                {/* Total Products */}
                <div className="relative overflow-hidden p-6 rounded-2xl bg-linear-to-br from-orange-500 to-amber-600 text-white shadow-lg transition-transform hover:scale-[1.02] group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                        <FiBox className="w-24 h-24 transform translate-x-4 -translate-y-4" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
                                <FiBox className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-sm font-bold bg-white/20 px-2.5 py-1 rounded-lg backdrop-blur-md border border-white/10">
                                Products
                            </span>
                        </div>
                        <h3 className="text-3xl font-bold tracking-tight">{stats?.data?.products?.total || 0}</h3>
                        <p className="text-orange-100 text-sm mt-1 font-medium">In catalog</p>
                    </div>
                </div>

                {/* Total Orders */}
                <div className="relative overflow-hidden p-6 rounded-2xl bg-linear-to-br from-pink-500 to-rose-600 text-white shadow-lg transition-transform hover:scale-[1.02] group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                        <FiShoppingCart className="w-24 h-24 transform translate-x-4 -translate-y-4" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
                                <FiShoppingCart className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-sm font-bold bg-white/20 px-2.5 py-1 rounded-lg backdrop-blur-md border border-white/10">
                                Sales
                            </span>
                        </div>
                        <h3 className="text-3xl font-bold tracking-tight">{stats?.data?.sales?.total?.orders || 0}</h3>
                        <p className="text-pink-100 text-sm mt-1 font-medium">All time</p>
                    </div>
                </div>

                {/* Total Sales */}
                <div className="relative overflow-hidden p-6 rounded-2xl bg-linear-to-br from-emerald-500 to-teal-600 text-white shadow-lg transition-transform hover:scale-[1.02] group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                        <FiActivity className="w-24 h-24 transform translate-x-4 -translate-y-4" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
                                <FiActivity className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-sm font-bold bg-white/20 px-2.5 py-1 rounded-lg backdrop-blur-md border border-white/10">
                                Revenue
                            </span>
                        </div>
                        <h3 className="text-3xl font-bold tracking-tight">${stats?.data?.sales?.total?.revenue?.toFixed(0) || '0'}</h3>
                        <p className="text-emerald-100 text-sm mt-1 font-medium">Total earnings</p>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sales Trend - Spans 2 columns */}
                <div className="lg:col-span-2 h-[420px] bg-white dark:bg-[#1b1c1d] p-6 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Sales Analytics</h3>
                    <div className="h-[320px]">
                        <SalesChart
                            data={salesData?.data?.sales || []}
                            timeRange={timeRange}
                            onTimeRangeChange={setTimeRange}
                        />
                    </div>
                </div>

                {/* Product Views - Spans 1 column */}
                <div className="h-[420px] bg-white dark:bg-[#1b1c1d] p-6 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Popularity</h3>
                    <div className="h-[320px]">
                        <ProductViewsChart data={productAnalytics?.data?.topViewed || []} />
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* All Orders - Spans 2 columns */}
                <div className="lg:col-span-2 bg-white dark:bg-[#1b1c1d] rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden">
                    <RecentOrdersTable orders={stats?.data?.recentOrders} />
                </div>

                {/* Top Sold Items - Spans 1 column */}
                <div className="bg-white dark:bg-[#1b1c1d] rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Top Selling Products</h3>
                    <TopProductsList products={stats?.data?.topProducts} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

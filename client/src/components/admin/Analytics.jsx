import { useState } from 'react';
import { useGetSalesAnalyticsQuery, useGetProductAnalyticsQuery, useGetUserAnalyticsQuery } from '../../features/admin/adminApi';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { format, subDays } from 'date-fns';
import { FiDownload, FiCalendar, FiDollarSign, FiTrendingUp, FiAlertTriangle, FiPieChart, FiActivity, FiUsers } from 'react-icons/fi';
import { toast } from 'react-hot-toast';


const Analytics = () => {
    const [dateRange, setDateRange] = useState(30);

    const endDate = format(new Date(), 'yyyy-MM-dd');
    const startDate = format(subDays(new Date(), dateRange), 'yyyy-MM-dd');

    const { data: salesData, isLoading: salesLoading } = useGetSalesAnalyticsQuery({ startDate, endDate });
    const { data: productData, isLoading: productLoading } = useGetProductAnalyticsQuery();
    const { data: userData, isLoading: userLoading } = useGetUserAnalyticsQuery();


    const stats = [
        {
            title: 'Avg Order Value',
            value: `$${salesData?.data?.averageOrderValue?.toFixed(2) || '0.00'}`,
            subtext: 'Per successfully paid order',
            icon: FiDollarSign,
            gradient: 'from-blue-600 to-indigo-600',
            bgIcon: 'text-blue-600',
            lightBg: 'bg-blue-100',
        },
        {
            title: 'Conversion Rate',
            value: `${salesData?.data?.conversionRate?.toFixed(1) || '0'}%`,
            subtext: 'Visitors to customers ratio',
            icon: FiTrendingUp,
            gradient: 'from-emerald-500 to-green-600',
            bgIcon: 'text-emerald-600',
            lightBg: 'bg-emerald-100',
        },
        {
            title: 'Low Stock Items',
            value: productData?.data?.lowStock?.length || 0,
            subtext: 'Products needing restock',
            icon: FiAlertTriangle,
            gradient: 'from-rose-500 to-red-600',
            bgIcon: 'text-rose-600',
            lightBg: 'bg-rose-100',
        },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold bg-linear-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                        Analytics
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
                        insights and performance metrics
                    </p>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 z-10" />
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(Number(e.target.value))}
                            className="pl-10 pr-8 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white appearance-none cursor-pointer text-sm font-medium dark:text-white"
                        >
                            <option value={7} className="dark:bg-gray-900">Last 7 days</option>
                            <option value={30} className="dark:bg-gray-900">Last 30 days</option>
                            <option value={90} className="dark:bg-gray-900">Last 90 days</option>
                        </select>
                    </div>
                    <button
                        onClick={() => toast.success('Exporting analytics report...')}
                        className="px-4 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors flex items-center font-medium text-sm"
                    >

                        <FiDownload className="mr-2" />
                        Export
                    </button>
                </div>
            </div>

            {/* Stats Overview Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className={`relative overflow-hidden p-6 rounded-2xl bg-linear-to-br ${stat.gradient} text-white shadow-lg transition-transform hover:scale-[1.02] group`}>
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                            <stat.icon className="w-24 h-24 transform translate-x-4 -translate-y-4" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
                                    <stat.icon className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-sm font-bold bg-white/20 px-2.5 py-1 rounded-lg backdrop-blur-md border border-white/10">
                                    {stat.title}
                                </span>
                            </div>
                            <h3 className="text-4xl font-bold tracking-tight">{stat.value}</h3>
                            <p className="text-white/80 text-sm mt-1 font-medium">{stat.subtext}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sales Trend Chart */}
                <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-gray-100 dark:border-white/10 p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                            <FiActivity className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Revenue Trend</h2>
                    </div>
                    {salesData?.data?.sales ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={salesData.data.sales}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.3} />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                    dx={-10}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    labelFormatter={(date) => format(new Date(date), 'MMMM dd, yyyy')}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#4F46E5"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                    name="Revenue ($)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-500">
                            No sales data available
                        </div>
                    )}
                </div>

                {/* User Growth Chart */}
                <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-gray-100 dark:border-white/10 p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400">
                            <FiUsers className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">User Growth</h2>
                    </div>
                    {userData?.data?.growth?.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={userData.data.growth}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.3} />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                    dx={-10}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    labelFormatter={(date) => format(new Date(date), 'MMMM dd, yyyy')}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="count"
                                    stroke="#F59E0B"
                                    name="New Users"
                                    strokeWidth={3}
                                    dot={{ fill: '#F59E0B', r: 4, strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-500">
                            No user growth data available
                        </div>
                    )}
                </div>

                {/* Top Products Chart (Full Width) */}
                <div className="lg:col-span-2 bg-white/80 dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-gray-100 dark:border-white/10 p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                            <FiPieChart className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Most Viewed Products</h2>
                    </div>
                    {productData?.data?.topViewed?.length > 0 ? (
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={productData.data.topViewed.slice(0, 10)}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.3} />
                                <XAxis
                                    dataKey="name"
                                    angle={-45}
                                    textAnchor="end"
                                    height={100}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                    dx={-10}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Bar
                                    dataKey="views"
                                    fill="#8B5CF6"
                                    name="Views"
                                    radius={[4, 4, 0, 0]}
                                    barSize={40}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-500">
                            No product data available
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Analytics;

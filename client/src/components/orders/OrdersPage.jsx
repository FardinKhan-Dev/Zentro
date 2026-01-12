import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPackage, FiClock, FiCheck, FiTruck, FiX, FiArrowRight, FiShoppingBag, FiCalendar } from 'react-icons/fi';
import { useGetUserOrdersQuery } from '../../features/orders/orderApi';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * OrdersPage - User order history with premium design
 */
const OrdersPage = () => {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const { data, isLoading, isError } = useGetUserOrdersQuery({ page, limit: 10 });

    const orders = data?.data?.orders || [];
    const pagination = data?.data?.pagination || {};

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    const getStatusColor = (status) => {
        const styles = {
            pending: 'bg-yellow-50 text-yellow-700 border-yellow-100 ring-yellow-500/10 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-900/30',
            processing: 'bg-blue-50 text-blue-700 border-blue-100 ring-blue-500/10 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/30',
            shipped: 'bg-purple-50 text-purple-700 border-purple-100 ring-purple-500/10 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-900/30',
            delivered: 'bg-green-50 text-green-700 border-green-100 ring-green-500/10 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30',
            cancelled: 'bg-red-50 text-red-700 border-red-100 ring-red-500/10 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30',
        };
        return styles[status] || 'bg-gray-50 text-gray-700 border-gray-100 ring-gray-500/10 dark:bg-zinc-800 dark:text-gray-400 dark:border-zinc-700';
    };

    const getStatusIcon = (status) => {
        const icons = {
            pending: <FiClock className="w-3.5 h-3.5" />,
            processing: <FiPackage className="w-3.5 h-3.5" />,
            shipped: <FiTruck className="w-3.5 h-3.5" />,
            delivered: <FiCheck className="w-3.5 h-3.5" />,
            cancelled: <FiX className="w-3.5 h-3.5" />,
        };
        return icons[status] || <FiPackage className="w-3.5 h-3.5" />;
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full min-h-[400px]">
                <div className="w-10 h-10 border-2 border-gray-100 dark:border-zinc-800 border-t-black dark:border-t-white rounded-full animate-spin" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-8">
                <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 rounded-full flex items-center justify-center mb-4">
                    <FiX size={24} />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Failed to Load Orders</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm">We couldn't retrieve your order history. Please check your connection and try again.</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-xl text-sm font-medium hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Order History</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Track and manage your recent purchases</p>
                </div>
                <div className="w-10 h-10 bg-gray-50 dark:bg-zinc-800 rounded-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                    <FiShoppingBag size={20} />
                </div>
            </div>

            {/* Orders List */}
            {orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-20 h-20 bg-gray-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6 text-gray-300 dark:text-gray-600">
                        <FiShoppingBag size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Orders Yet</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm">Looks like you haven't placed any orders yet. Start shopping to fill this page!</p>
                    <button
                        onClick={() => navigate('/products')}
                        className="bg-black dark:bg-white text-white dark:text-black px-8 py-3 rounded-xl font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-all shadow-lg shadow-gray-200 dark:shadow-none hover:-translate-y-0.5"
                    >
                        Start Shopping
                    </button>
                </div>
            ) : (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-4"
                >
                    <AnimatePresence>
                        {orders.map((order) => (
                            <motion.div
                                key={order._id}
                                variants={itemVariants}
                                layout
                                className="group bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-600 hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)] dark:hover:shadow-none transition-all duration-200 overflow-hidden"
                            >
                                {/* Order Header */}
                                <div className="p-5 flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white border border-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold text-sm shadow-sm">
                                            #{order.orderNumber.toString().slice(-2)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                                                    Order #{order.orderNumber}
                                                </h3>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <FiCalendar className="w-3 h-3" />
                                                {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ring-1 ring-inset ${getStatusColor(order.orderStatus)}`}>
                                            {getStatusIcon(order.orderStatus)}
                                            <span className="capitalize">{order.orderStatus}</span>
                                        </span>
                                        <div className="text-right pl-4 border-l border-gray-200 dark:border-zinc-700">
                                            <p className="text-md font-bold text-gray-900 dark:text-white">${order.totalAmount.toFixed(2)}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Items Preview */}
                                <div className="p-5 flex items-center justify-between gap-6">
                                    <div className="flex flex-col xl:flex-row items-start xl:items-center gap-3">
                                        <div className="flex -space-x-3 overflow-hidden py-1">
                                            {order.items.slice(0, 4).map((item, index) => (
                                                <div key={index} className="relative inline-block w-12 h-12 rounded-lg border-2 border-white dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800 shadow-sm overflow-hidden" title={item.name}>
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                </div>
                                            ))}
                                            {order.items.length > 4 && (
                                                <div className="relative w-12 h-12 rounded-lg border-2 border-white dark:border-zinc-800 bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-400 shadow-sm z-10">
                                                    +{order.items.length - 4}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0 hidden md:block">
                                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                                {order.items.length} {order.items.length === 1 ? 'item' : 'items'} including <span className="font-medium text-gray-900 dark:text-white">{order.items[0].name}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/orders/${order._id}`)}
                                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm font-medium hover:bg-black hover:text-white hover:border-black dark:hover:bg-white dark:hover:text-black dark:hover:border-white transition-all whitespace-nowrap group-hover:bg-black dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-black group-hover:border-black dark:group-hover:border-white"
                                    >
                                        View Details <FiArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                    <button
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                        className="px-4 py-2 text-sm border border-gray-200 dark:border-zinc-700 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-600 dark:text-gray-400 font-medium"
                    >
                        Previous
                    </button>
                    <span className="px-4 py-2 text-sm text-gray-900 dark:text-white font-medium bg-gray-50 dark:bg-zinc-800 rounded-lg">
                        Page {page} of {pagination.totalPages}
                    </span>
                    <button
                        onClick={() => setPage(page + 1)}
                        disabled={page === pagination.totalPages}
                        className="px-4 py-2 text-sm border border-gray-200 dark:border-zinc-700 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-600 dark:text-gray-400 font-medium"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default OrdersPage;

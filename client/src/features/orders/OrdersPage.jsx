import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetUserOrdersQuery } from './orderApi';

/**
 * OrdersPage - User order history with pagination
 */
const OrdersPage = () => {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const { data, isLoading, isError } = useGetUserOrdersQuery({ page, limit: 10 });

    const orders = data?.data?.orders || [];
    const pagination = data?.data?.pagination || {};

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            processing: 'bg-blue-100 text-blue-800',
            shipped: 'bg-purple-100 text-purple-800',
            delivered: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getPaymentStatusColor = (status) => {
        const colors = {
            pending: 'text-yellow-600',
            paid: 'text-green-600',
            failed: 'text-red-600',
            refunded: 'text-purple-600',
        };
        return colors[status] || 'text-gray-600';
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="max-w-4xl mx-auto text-center py-12">
                <div className="text-red-500 mb-4">
                    <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">Failed to Load Orders</h2>
                    <p className="text-gray-600">Please try again later</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
                <p className="text-gray-600">View and track your order history</p>
            </div>

            {/* Orders List */}
            {orders.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                    <svg className="w-24 h-24 mx-auto text-gray-300 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">No Orders Yet</h2>
                    <p className="text-gray-600 mb-8">Start shopping to see your orders here</p>
                    <button onClick={() => navigate('/products')} className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                        Browse Products
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div key={order._id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                            {/* Order Header */}
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                Order #{order.orderNumber}
                                            </h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                                                {order.orderStatus}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-600 mb-1">Total</p>
                                        <p className="text-2xl font-bold text-gray-900">${order.totalAmount.toFixed(2)}</p>
                                        <p className={`text-sm font-medium capitalize ${getPaymentStatusColor(order.paymentStatus)}`}>
                                            {order.paymentStatus}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items Preview */}
                            <div className="p-6">
                                <div className="flex items-center gap-4 mb-4">
                                    {order.items.slice(0, 3).map((item, index) => (
                                        <div key={index} className="flex items-center gap-3 flex-1">
                                            <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                                                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {order.items.length > 3 && (
                                        <div className="text-sm text-gray-500">
                                            +{order.items.length - 3} more
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => navigate(`/orders/${order._id}`)}
                                    className="w-full border-2 border-green-500 text-green-500 hover:bg-green-50 py-2 rounded-lg font-medium transition-colors"
                                >
                                    View Order Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                    <button
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Previous
                    </button>
                    <span className="px-4 py-2 text-gray-700">
                        Page {page} of {pagination.totalPages}
                    </span>
                    <button
                        onClick={() => setPage(page + 1)}
                        disabled={page === pagination.totalPages}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default OrdersPage;

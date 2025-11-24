import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetOrderByIdQuery, useCancelOrderMutation } from './orderApi';

/**
 * OrderDetailPage - Detailed view of a single order
 */
const OrderDetailPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { data, isLoading, isError } = useGetOrderByIdQuery(orderId);
    const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');

    const order = data?.data?.order;

    const handleCancelOrder = async () => {
        if (!cancelReason.trim()) {
            alert('Please provide a reason for cancellation');
            return;
        }

        try {
            await cancelOrder({ orderId, reason: cancelReason }).unwrap();
            setShowCancelModal(false);
            alert('Order cancelled successfully');
        } catch (error) {
            alert(error?.data?.message || 'Failed to cancel order');
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            processing: 'bg-blue-100 text-blue-800 border-blue-300',
            shipped: 'bg-purple-100 text-purple-800 border-purple-300',
            delivered: 'bg-green-100 text-green-800 border-green-300',
            cancelled: 'bg-red-100 text-red-800 border-red-300',
        };
        return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
    };

    const canCancelOrder = order &&
        order.orderStatus !== 'delivered' &&
        order.orderStatus !== 'cancelled' &&
        order.paymentStatus !== 'refunded';

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (isError || !order) {
        return (
            <div className="max-w-4xl mx-auto text-center py-12">
                <div className="text-red-500 mb-4">
                    <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">Order Not Found</h2>
                    <p className="text-gray-600">Unable to load order details</p>
                </div>
                <button onClick={() => navigate('/orders')} className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                    Back to Orders
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <button onClick={() => navigate('/orders')} className="flex items-center text-green-500 hover:text-green-600 font-medium mb-4">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Orders
                </button>
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order #{order.orderNumber}</h1>
                        <p className="text-gray-600">
                            Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                    </div>
                    {canCancelOrder && (
                        <button
                            onClick={() => setShowCancelModal(true)}
                            className="border-2 border-red-500 text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                            Cancel Order
                        </button>
                    )}
                </div>
            </div>

            {/* Order Status Card */}
            <div className={`mb-6 p-6 rounded-lg border-2 ${getStatusColor(order.orderStatus)}`}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium mb-1">Order Status</p>
                        <p className="text-2xl font-bold capitalize">{order.orderStatus}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-medium mb-1">Payment Status</p>
                        <p className="text-xl font-semibold capitalize">{order.paymentStatus}</p>
                    </div>
                </div>
            </div>

            {/* Order Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Shipping Address */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h2>
                    <div className="text-gray-700 space-y-1">
                        <p>{order.shippingAddress.street}</p>
                        <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                        <p>{order.shippingAddress.country}</p>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
                    <div className="space-y-2">
                        <div className="flex justify-between text-gray-700">
                            <span>Subtotal</span>
                            <span>${order.totalAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-700">
                            <span>Shipping</span>
                            <span>FREE</span>
                        </div>
                        <div className="pt-2 border-t border-gray-200 flex justify-between text-lg font-semibold text-gray-900">
                            <span>Total</span>
                            <span>${order.totalAmount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Items ({order.items.length})</h2>
                <div className="space-y-4">
                    {order.items.map((item, index) => (
                        <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                            <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center">
                                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                                <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                <p className="text-sm text-gray-600">${item.price.toFixed(2)} each</p>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Order Timeline */}
            {order.statusHistory && order.statusHistory.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Timeline</h2>
                    <div className="space-y-4">
                        {order.statusHistory.map((history, index) => (
                            <div key={index} className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900 capitalize">{history.status}</p>
                                    <p className="text-sm text-gray-600">
                                        {new Date(history.timestamp).toLocaleString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                    {history.notes && <p className="text-sm text-gray-500 mt-1">{history.notes}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Cancel Order Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Cancel Order</h3>
                        <p className="text-gray-600 mb-4">
                            Are you sure you want to cancel this order? This action cannot be undone.
                        </p>
                        <textarea
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            placeholder="Please provide a reason for cancellation..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent mb-4"
                            rows="4"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowCancelModal(false)}
                                className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 py-2 rounded-lg font-medium transition-colors"
                                disabled={isCancelling}
                            >
                                Keep Order
                            </button>
                            <button
                                onClick={handleCancelOrder}
                                disabled={isCancelling}
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                                {isCancelling ? 'Cancelling...' : 'Cancel Order'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderDetailPage;

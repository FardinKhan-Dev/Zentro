import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetOrderByIdQuery } from '../orders/orderApi';

/**
 * OrderConfirmation Component
 * Shows order success and details
 */
const OrderConfirmation = () => {
    const navigate = useNavigate();
    const { orderId } = useParams();
    const { data, isLoading, isError } = useGetOrderByIdQuery(orderId);

    const order = data?.data?.order;

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (isError || !order) {
        return (
            <div className="max-w-2xl mx-auto text-center py-12">
                <div className="text-red-500 mb-4">
                    <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">Order Not Found</h2>
                    <p className="text-gray-600">Unable to load order details</p>
                </div>
                <button onClick={() => navigate('/products')} className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                    Continue Shopping
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto">
            {/* Success Header */}
            <div className="text-center mb-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
                <p className="text-lg text-gray-600">Thank you for your purchase</p>
                <p className="text-sm text-gray-500 mt-2">Order #{order.orderNumber}</p>
            </div>

            {/* Order Details Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Details</h2>

                {/* Order Status */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-600">Order Status</p>
                            <p className="text-lg font-semibold text-gray-900 capitalize">{order.orderStatus}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-600">Payment Status</p>
                            <p className={`text-lg font-semibold capitalize ${order.paymentStatus === 'paid' ? 'text-green-600' :
                                    order.paymentStatus === 'pending' ? 'text-yellow-600' :
                                        'text-red-600'
                                }`}>
                                {order.paymentStatus}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Shipping Address */}
                <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-2">Shipping Address</h3>
                    <div className="text-gray-700">
                        <p>{order.shippingAddress.street}</p>
                        <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                        <p>{order.shippingAddress.country}</p>
                    </div>
                </div>

                {/* Order Items */}
                <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Items</h3>
                    <div className="space-y-3">
                        {order.items.map((item, index) => (
                            <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-400">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                                    <p className="text-sm text-gray-600">${item.price.toFixed(2)} × {item.quantity}</p>
                                </div>
                                <p className="font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Order Total */}
                <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-lg font-semibold text-gray-900">
                        <span>Total</span>
                        <span>${order.totalAmount.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Next Steps */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">What's Next?</h3>
                <ul className="space-y-2 text-blue-800">
                    <li className="flex items-start">
                        <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>You'll receive an email confirmation shortly</span>
                    </li>
                    <li className="flex items-start">
                        <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>We'll notify you when your order ships</span>
                    </li>
                    <li className="flex items-start">
                        <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Track your order anytime from your account</span>
                    </li>
                </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
                <button onClick={() => navigate('/products')} className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-medium transition-colors">
                    Continue Shopping
                </button>
                <button onClick={() => navigate('/orders')} className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 py-3 rounded-lg font-medium transition-colors">
                    View All Orders
                </button>
            </div>
        </div>
    );
};

export default OrderConfirmation;

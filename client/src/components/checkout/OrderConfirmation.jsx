import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetOrderByIdQuery } from '../../features/orders/orderApi';
import { motion } from 'framer-motion';
import { FiCheck } from '@react-icons/all-files/fi/FiCheck';
import { FiPackage } from '@react-icons/all-files/fi/FiPackage';
import { FiTruck } from '@react-icons/all-files/fi/FiTruck';
import { FiMapPin } from '@react-icons/all-files/fi/FiMapPin';
import { FiArrowRight } from '@react-icons/all-files/fi/FiArrowRight';
import { FiShoppingBag } from '@react-icons/all-files/fi/FiShoppingBag';
import { FiCalendar } from '@react-icons/all-files/fi/FiCalendar';

/**
 * OrderConfirmation Component
 * Premium success screen with order details
 */
const OrderConfirmation = () => {
    const navigate = useNavigate();
    const { orderId } = useParams();
    const { data, isLoading, isError } = useGetOrderByIdQuery(orderId);

    const order = data?.data?.order;

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
            </div>
        );
    }

    if (isError || !order) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
                    <FiPackage size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
                <p className="text-gray-500 mb-8">We couldn't retrieve the order details.</p>
                <button
                    onClick={() => navigate('/products')}
                    className="bg-black text-white px-8 py-3 rounded-xl font-medium hover:bg-gray-900 transition-colors"
                >
                    Return to Shop
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-3xl mx-auto"
            >
                {/* Success Header */}
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 20,
                            delay: 0.1
                        }}
                        className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
                    >
                        <FiCheck className="w-12 h-12 text-white" strokeWidth={3} />
                    </motion.div>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">Order Confirmed!</h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
                        Thank you for your purchase. We've received your order and will begin processing it right away.
                    </p>
                    <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 rounded-full border border-gray-200 dark:border-zinc-700 text-sm font-medium text-gray-600 dark:text-gray-300 shadow-sm">
                        <FiPackage className="text-indigo-600 dark:text-indigo-400" />
                        Order #{order.orderNumber}
                    </div>
                </div>

                {/* Main Content Card */}
                <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden border border-gray-100 dark:border-zinc-800">
                    {/* Progress Guide */}
                    <div className="bg-gray-50/50 dark:bg-zinc-800/50 border-b border-gray-100 dark:border-zinc-800 p-8">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-6">Order Status</h3>
                        <div className="relative">
                            <div className="absolute top-1/2 left-4 right-4 h-1 bg-gray-200 -translate-y-1/2 rounded-full" />
                            <div className="absolute top-1/2 left-4 w-[10%] h-1 bg-green-600 -translate-y-1/2 rounded-full" />
                            <div className="relative flex justify-between">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center ring-4 ring-white z-10 shadow-sm">
                                        <FiCheck size={16} />
                                    </div>
                                    <span className="text-xs font-bold text-green-600">Confirmed</span>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-8 h-8 bg-white dark:bg-zinc-800 border-2 border-gray-200 dark:border-zinc-700 text-gray-300 dark:text-gray-600 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-zinc-900 z-10">
                                        <FiPackage size={16} />
                                    </div>
                                    <span className="text-xs font-medium text-gray-400 dark:text-gray-500">Processing</span>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-8 h-8 bg-white dark:bg-zinc-800 border-2 border-gray-200 dark:border-zinc-700 text-gray-300 dark:text-gray-600 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-zinc-900 z-10">
                                        <FiTruck size={16} />
                                    </div>
                                    <span className="text-xs font-medium text-gray-400 dark:text-gray-500">Shipped</span>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-8 h-8 bg-white dark:bg-zinc-800 border-2 border-gray-200 dark:border-zinc-700 text-gray-300 dark:text-gray-600 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-zinc-900 z-10">
                                        <FiMapPin size={16} />
                                    </div>
                                    <span className="text-xs font-medium text-gray-400 dark:text-gray-500">Delivered</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Order Details Left Col */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <FiShoppingBag className="text-gray-400" /> Order Summary
                            </h3>
                            <div className="space-y-4 mb-2">
                                {order.items.slice(0, 3).map((item, index) => (
                                    <div key={index} className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-gray-50 dark:bg-zinc-800 rounded-xl overflow-hidden border border-gray-100 dark:border-zinc-700 shrink-0">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-gray-900 dark:text-white text-sm truncate">{item.name}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
                                        </div>
                                        <p className="font-bold text-gray-900 dark:text-white text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                ))}
                                {order.items.length > 3 && (
                                    <p className="text-sm text-gray-500 italic pl-1">
                                        + {order.items.length - 3} more items...
                                    </p>
                                )}
                            </div>

                            <div className="border-t border-gray-100 dark:border-zinc-800 pt-4 space-y-2">
                                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                    <span>Subtotal</span>
                                    <span>${order.totalAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                    <span>Shipping</span>
                                    <span className="text-green-600 font-medium">Free</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white pt-2">
                                    <span>Total</span>
                                    <span>${order.totalAmount.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Order Details Right Col */}
                        <div className="space-y-8 flex flex-col">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <FiMapPin className="text-gray-400" /> Delivery Details
                            </h3>
                            <div className="bg-gray-50 dark:bg-zinc-800 p-5 rounded-2xl border border-gray-100 dark:border-zinc-700 mt-auto">
                                <p className="font-bold text-gray-900 dark:text-white mb-1">
                                    {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                                </p>
                                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                    {order.shippingAddress.street}<br />
                                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
                                    {order.shippingAddress.country}
                                </p>
                                <p className="text-gray-600 dark:text-gray-400 text-sm mt-3 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-green-600 rounded-full" />
                                    Standard Shipping (5-7 Business Days)
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="w-full p-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">What happens next?</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">
                            You will receive an order confirmation email with details of your order and a SMS will be sent to your phone number with a link to track its progress.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => navigate('/products')}
                                className="flex-1 bg-black dark:bg-white text-white dark:text-black px-6 py-3.5 rounded-xl font-bold hover:bg-gray-900 dark:hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
                            >
                                Continue Shopping <FiArrowRight />
                            </button>
                            <button
                                onClick={() => navigate('/profile')}
                                className="flex-1 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white border border-gray-200 dark:border-zinc-700 px-6 py-3.5 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-zinc-700 transition-all flex items-center justify-center gap-2"
                            >
                                View Order
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default OrderConfirmation;

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetOrderByIdQuery, useCancelOrderMutation } from '../../features/orders/orderApi';
import { FiArrowLeft } from '@react-icons/all-files/fi/FiArrowLeft';
import { FiPackage } from '@react-icons/all-files/fi/FiPackage';
import { FiTruck } from '@react-icons/all-files/fi/FiTruck';
import { FiMapPin } from '@react-icons/all-files/fi/FiMapPin';
import { FiCreditCard } from '@react-icons/all-files/fi/FiCreditCard';
import { FiClock } from '@react-icons/all-files/fi/FiClock';
import { FiAlertCircle } from '@react-icons/all-files/fi/FiAlertCircle';
import { FiCheck } from '@react-icons/all-files/fi/FiCheck';
import { FiX } from '@react-icons/all-files/fi/FiX';
import { FiShoppingBag } from '@react-icons/all-files/fi/FiShoppingBag';
import { FiInfo } from '@react-icons/all-files/fi/FiInfo';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * OrderDetailPage - Detailed view of a single order with minimal, professional design
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
        } catch (error) {
            console.error(error);
        }
    };



    const canCancelOrder = order &&
        order.orderStatus !== 'delivered' &&
        order.orderStatus !== 'cancelled' &&
        order.paymentStatus !== 'refunded';

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-black flex justify-center items-center">
                <div className="w-8 h-8 border-2 border-gray-200 dark:border-zinc-800 border-t-black dark:border-t-white rounded-full animate-spin" />
            </div>
        );
    }

    if (isError || !order) {
        return (
            <div className="min-h-screen bg-white dark:bg-zinc-900 flex flex-col items-center justify-center p-8">
                <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 rounded-full flex items-center justify-center mb-6">
                    <FiAlertCircle size={24} />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Order Not Found</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-8">We couldn't retrieve the order details.</p>
                <button
                    onClick={() => navigate('/profile')}
                    className="flex items-center gap-2 px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors"
                >
                    <FiArrowLeft /> Back to Orders
                </button>
            </div>
        );
    }

    return (
        <div className="h-full py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Header Navigation */}
                <div className="flex items-center justify-between gap-4 mb-8">
                    <button
                        onClick={() => navigate('/profile')}
                        className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors text-sm font-medium group w-fit"
                    >
                        <FiArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        Back to Orders
                    </button>

                    {canCancelOrder && (
                        <button
                            onClick={() => setShowCancelModal(true)}
                            className="text-red-500 text-sm font-medium hover:text-red-600 hover:underline transition-all w-fit"
                        >
                            Cancel Order
                        </button>
                    )}
                </div>

                {/* Main Content Card */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">

                    {/* Header Section */}
                    <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Order #{order.orderNumber}</h1>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${order.orderStatus === 'delivered' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                    order.orderStatus === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                        'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                                    }`}>
                                    {order.orderStatus}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                <FiClock className="w-4 h-4" />
                                Placed on {new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold mb-1">Total Amount</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">${order.totalAmount.toFixed(2)}</p>
                        </div>
                    </div>



                    {/* Progress Bar Section (Only if not cancelled) */}
                    {
                        order.orderStatus !== 'cancelled' && (
                            <div className={`p-6 ${order.trackingNumber ? '' : 'pb-12'} border-b border-gray-100 dark:border-zinc-800 bg-gray-50/30 dark:bg-zinc-800/20`}>
                                <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-6">Order Status</h3>
                                <div className="relative mx-4">
                                    <div className="absolute top-1/2 left-4 right-4 h-1 bg-gray-200 dark:bg-zinc-700 -translate-y-1/2 rounded-full" />
                                    <div
                                        className="absolute top-1/2 left-4 right-4 h-1 bg-green-500 -translate-y-1/2 rounded-full transition-all duration-1000 ease-out"
                                        style={{
                                            width: `${order.orderStatus === 'delivered' ? '100%' :
                                                order.orderStatus === 'shipped' ? '66%' :
                                                    order.orderStatus === 'processing' ? '33%' : '0%'
                                                }`
                                        }}
                                    />
                                    <div className="relative flex justify-between">
                                        {[
                                            { status: 'pending', label: 'Confirmed', icon: FiCheck },
                                            { status: 'processing', label: 'Processing', icon: FiPackage },
                                            { status: 'shipped', label: 'Shipped', icon: FiTruck },
                                            { status: 'delivered', label: 'Delivered', icon: FiMapPin },
                                        ].map((step, index) => {
                                            const stepOrder = ['pending', 'processing', 'shipped', 'delivered'];
                                            const currentStepIndex = stepOrder.indexOf(order.orderStatus === 'confirmed' ? 'pending' : order.orderStatus);
                                            const isCompleted = index <= currentStepIndex;
                                            const isActive = index === currentStepIndex;

                                            // Find timestamp from history
                                            const historyEntry = order.statusHistory?.find(h => h.status === step.status || (step.status === 'pending' && h.status === 'confirmed'));
                                            const stepDate = historyEntry ? new Date(historyEntry.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : null;

                                            return (
                                                <div key={step.label} className="flex flex-col items-center gap-2 relative">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-zinc-900 z-10 shadow-sm transition-colors duration-300 ${isCompleted ? 'bg-green-500 text-white' : 'bg-white dark:bg-zinc-800 border-2 border-gray-200 dark:border-zinc-700 text-gray-300 dark:text-zinc-600'
                                                        }`}>
                                                        <step.icon size={14} />
                                                    </div>
                                                    <div className={`text-center absolute w-32 flex flex-col items-center
                                                ${stepDate ? '-bottom-10' : '-bottom-6'}
                                                `}>
                                                        <span className={`text-xs font-bold transition-colors duration-300 ${isActive ? 'text-green-600 dark:text-green-400' : isCompleted ? 'text-gray-900 dark:text-gray-300' : 'text-gray-400 dark:text-zinc-600'
                                                            }`}>
                                                            {step.label}
                                                        </span>
                                                        {stepDate && (
                                                            <span className="text-[10px] text-gray-500 dark:text-gray-500 font-medium mt-0.5">
                                                                {stepDate}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Courier Link (Bottom Right) */}
                                {order.trackingNumber && (
                                    <div className="mt-12 flex justify-end">
                                        <a
                                            href={`https://www.google.com/search?q=${order.trackingNumber}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm font-bold transition-colors group"
                                        >
                                            View Full Details on Courier Site
                                            <FiArrowLeft className="rotate-180 group-hover:translate-x-1 transition-transform" />
                                        </a>
                                    </div>
                                )}
                            </div>
                        )
                    }

                    <div className="flex flex-col lg:flex-row">
                        {/* Left Column: Items */}
                        <div className="flex-1 p-6 border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-zinc-800">
                            <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-6">Items ({order.items.length})</h3>
                            <div className="space-y-6">
                                {order.items.map((item, index) => (
                                    <div key={index} className="flex gap-4">
                                        <div className="w-20 h-20 bg-gray-50 dark:bg-zinc-800 rounded-lg overflow-hidden border border-gray-100 dark:border-zinc-700 shrink-0">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                                            <h4 className="font-bold text-gray-900 dark:text-white text-sm truncate mb-1">{item.name}</h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
                                        </div>
                                        <div className="flex flex-col justify-center items-end">
                                            <p className="font-bold text-gray-900 dark:text-white text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Column: Details */}
                        <div className="w-full lg:w-80 bg-gray-50/50 dark:bg-zinc-800/20 p-6 space-y-8">
                            {/* Delivery */}
                            <div>
                                <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Delivery Address</h3>
                                <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                    <p className="font-bold text-gray-900 dark:text-white mb-1">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                                    <p>{order.shippingAddress.street}</p>
                                    <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                                    <p>{order.shippingAddress.country}</p>
                                    <p><span>+91 </span>{order.shippingAddress.phoneNumber}</p>
                                </div>
                            </div>

                            {/* Payment */}
                            <div>
                                <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Payment Info</h3>
                                <div className="flex items-center justify-between text-sm bg-white dark:bg-zinc-800 p-3 rounded-lg border border-gray-100 dark:border-zinc-700 shadow-sm">
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                        <FiCreditCard />
                                        <span className="capitalize">
                                            {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentStatus}
                                        </span>
                                    </div>
                                    {(order.paymentStatus === 'paid' || (order.paymentMethod === 'cod' && order.orderStatus === 'delivered')) && <FiCheck className="text-green-500" />}
                                </div>
                            </div>
                        </div>
                    </div>
                </div >

                {/* Cancel Modal */}
                {
                    showCancelModal && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full p-8 shadow-2xl"
                            >
                                <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 rounded-full flex items-center justify-center mb-6">
                                    <FiX size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Cancel Order?</h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-6">
                                    Are you sure you want to cancel this order? This action cannot be undone.
                                </p>
                                <textarea
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                    placeholder="Reason for cancellation..."
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent mb-6 outline-none transition-all placeholder-gray-400 dark:text-white"
                                    rows="3"
                                />
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setShowCancelModal(false)}
                                        className="flex-1 px-4 py-3 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-xl font-bold transition-colors"
                                        disabled={isCancelling}
                                    >
                                        Keep Order
                                    </button>
                                    <button
                                        onClick={handleCancelOrder}
                                        disabled={isCancelling}
                                        className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                                    >
                                        {isCancelling ? 'Cancelling...' : 'Yes, Cancel'}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )
                }
            </div >
        </div >
    );
};

export default OrderDetailPage;

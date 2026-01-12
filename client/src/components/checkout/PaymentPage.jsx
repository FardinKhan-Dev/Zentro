import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCreatePaymentIntentMutation, useVerifyPaymentMutation } from '../../features/payment/paymentApi';
import { useGetOrderByIdQuery } from '../../features/orders/orderApi';
import { FiLock, FiCreditCard, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

// Initialize Stripe (replace with your publishable key)
const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
if (!stripeKey) {
    console.error('Stripe Publishable Key is missing in environment variables');
}
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

const CheckoutForm = ({ orderId, amount }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [verifyPayment] = useVerifyPaymentMutation();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsLoading(true);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Return URL where the customer is redirected after the payment
                return_url: `${window.location.origin}/checkout/confirmation/${orderId}`,
            },
            redirect: 'if_required',
        });

        if (error) {
            setMessage(error.message);
            toast.error(error.message);
            setIsLoading(false);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            try {
                // Verify with backend to update order status immediately
                await verifyPayment({
                    paymentIntentId: paymentIntent.id,
                    orderId
                }).unwrap();
                toast.success('Payment successful!');
                navigate(`/checkout/confirmation/${orderId}`);
            } catch (err) {
                console.error('Payment verification failed:', err);
                // Navigate anyway since payment succeeded on Stripe
                toast.success('Payment successful! Updating order status...');
                navigate(`/checkout/confirmation/${orderId}`);
            }
        } else {
            setMessage('An unexpected error occurred.');
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <PaymentElement />
            </div>

            {message && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2 text-sm">
                    <FiAlertCircle className="shrink-0" />
                    <span>{message}</span>
                </div>
            )}

            <button
                disabled={isLoading || !stripe || !elements}
                className="w-full bg-black text-white py-4 px-6 rounded-xl font-medium text-lg hover:bg-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-gray-200"
            >
                {isLoading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <>
                        <FiLock />
                        Pay ${(amount / 100).toFixed(2)}
                    </>
                )}
            </button>

            <div className="text-center">
                <p className="text-xs text-gray-500 mt-4 flex items-center justify-center gap-1">
                    <FiLock className="w-3 h-3" />
                    Payments are secure and encrypted
                </p>
            </div>
        </form>
    );
};

import { useTheme } from '../../context/ThemeContext';

const PaymentPage = () => {
    const { darkMode } = useTheme();
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { data: orderData, isLoading: isOrderLoading } = useGetOrderByIdQuery(orderId);
    const [createPaymentIntent, { isLoading: isIntentLoading }] = useCreatePaymentIntentMutation();
    const [clientSecret, setClientSecret] = useState('');


    useEffect(() => {
        if (orderData?.data?.order && !clientSecret) {
            const initPayment = async () => {
                try {
                    const result = await createPaymentIntent({
                        orderId,
                        currency: 'usd'
                    }).unwrap();

                    if (result.data && result.data.clientSecret) {
                        setClientSecret(result.data.clientSecret);
                    } else if (result.clientSecret) {
                        // Fallback in case API changes
                        setClientSecret(result.clientSecret);
                    } else {
                        console.error('No clientSecret found in response', result);
                        toast.error('Failed to initialize payment: Invalid response');
                    }
                } catch (error) {
                    console.error('Failed to create payment intent:', error);
                    toast.error('Failed to initialize payment');
                }
            };
            if (!stripeKey) {
                toast.error('Stripe Configuration Error: Missing API Key');
                return;
            }
            initPayment();
        }
    }, [orderData, orderId, createPaymentIntent, clientSecret]);

    const appearance = React.useMemo(() => ({
        theme: darkMode ? 'night' : 'stripe',
        variables: {
            colorPrimary: darkMode ? '#ffffff' : '#000000',
            fontFamily: 'system-ui, sans-serif',
            borderRadius: '12px',
            colorText: darkMode ? '#ffffff' : '#30313d',
            colorBackground: darkMode ? '#18181b' : '#ffffff',
        },
        rules: {
            '.Input': {
                backgroundColor: darkMode ? '#27272a' : '#ffffff', // zinc-800
                color: darkMode ? '#ffffff' : '#30313d',
                borderColor: darkMode ? '#3f3f46' : '#e5e7eb',
            }
        }
    }), [darkMode]);

    const options = React.useMemo(() => ({
        clientSecret,
        appearance,
    }), [clientSecret, appearance]);

    if (isOrderLoading || isIntentLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
        );
    }

    if (!orderData?.data?.order) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Order not found</h2>
                    <button onClick={() => navigate('/')} className="text-indigo-600 hover:underline">
                        Return Home
                    </button>
                </div>
            </div>
        );
    }

    const { order } = orderData.data;


    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-gray-900">Secure Checkout</h1>
                    <p className="mt-2 text-gray-600">Complete your purchase safely</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    {/* Payment Form */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 relative z-0 order-1 md:order-1" style={{ isolation: 'isolate' }}>
                        <div className="absolute top-0 left-[6px] right-[6px] h-1 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-t-[calc(1rem-1px)]"></div>
                        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 dark:text-white">
                            <FiCreditCard className="text-indigo-600" />
                            Payment Details
                        </h2>

                        {stripeKey ? (
                            clientSecret ? (
                                <Elements key={clientSecret} options={options} stripe={stripePromise}>
                                    <CheckoutForm orderId={orderId} amount={order.totalAmount * 100} />
                                </Elements>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                    <div className="w-8 h-8 border-2 border-gray-300 border-t-indigo-500 rounded-full animate-spin mb-2" />
                                    <span className="text-sm">Initializing secure payment...</span>
                                </div>
                            )
                        ) : (
                            <div className="bg-red-50 p-4 rounded-xl border border-red-200 text-center">
                                <FiAlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                                <h3 className="text-red-800 font-medium">Payment Configuration Error</h3>
                                <p className="text-red-600 text-sm mt-1">Stripe API Key is missing. Please check your environment variables.</p>
                            </div>
                        )}
                    </div>

                    {/* Order Summary */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 order-2 md:order-2">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <FiCheckCircle className="text-green-500" />
                            Order Summary
                        </h2>
                        <div className="space-y-4">
                            {order.items.map((item) => (
                                <div key={item.product?._id} className="flex gap-4">
                                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                                        <img
                                            src={item.product?.images?.[0]?.url || item.product?.image}
                                            alt={item.product?.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-medium text-sm text-gray-900 line-clamp-1">{item.product?.name}</h3>
                                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                        <p className="text-sm font-medium mt-1">${item.price}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 pt-6 border-t border-gray-100 space-y-2">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Subtotal</span>
                                <span>${order.totalAmount}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Shipping</span>
                                <span>Free</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-100 mt-2">
                                <span>Total</span>
                                <span>${order.totalAmount}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;

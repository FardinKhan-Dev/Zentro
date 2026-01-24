import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCreatePaymentIntentMutation, useVerifyPaymentMutation } from '../../features/payment/paymentApi';
import { useConfirmCodOrderMutation } from '../../features/orders/orderApi';
import { FiLock } from '@react-icons/all-files/fi/FiLock';
import { FiAlertCircle } from '@react-icons/all-files/fi/FiAlertCircle';
import { FiCreditCard } from '@react-icons/all-files/fi/FiCreditCard';
import { FiTruck } from '@react-icons/all-files/fi/FiTruck';
import { FiCheckCircle } from '@react-icons/all-files/fi/FiCheckCircle';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';

// Initialize Stripe
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
    const [isSuccess, setIsSuccess] = useState(false);
    const [verifyPayment] = useVerifyPaymentMutation();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsLoading(true);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // We'll handle redirection manually or show success state
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
                await verifyPayment({
                    paymentIntentId: paymentIntent.id,
                    orderId
                }).unwrap();

                // Show success state
                setIsSuccess(true);
                toast.success('Payment successful!');

                // Redirect after delay
                setTimeout(() => {
                    window.location.href = `/checkout/confirmation/${orderId}`;
                }, 2000);
            } catch (err) {
                console.error('Payment verification failed:', err);
                setIsSuccess(true);
                toast.success('Payment successful! Updating order status...');

                setTimeout(() => {
                    window.location.href = `/checkout/confirmation/${orderId}`;
                }, 2000);
            }
        } else {
            setMessage('An unexpected error occurred.');
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                {/* Stripe-like Checkmark Animation */}
                <div className="mb-6">
                    <svg className="w-20 h-20 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                        <circle className="stroke-current animate-[dash_0.5s_ease-in-out_forwards]" cx="26" cy="26" r="25" fill="none" strokeWidth="2" strokeDasharray="166" strokeDashoffset="166" style={{ animationName: 'circle-fill', animationDuration: '0.6s', animationFillMode: 'forwards' }} />
                        <path className="stroke-current text-green-500 animate-[dash_0.5s_ease-in-out_forwards_0.6s]" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" strokeWidth="2" strokeDasharray="48" strokeDashoffset="48" style={{ animationName: 'check-stroke', animationDuration: '0.4s', animationDelay: '0.6s', animationFillMode: 'forwards' }} />
                    </svg>
                    <style>{`
                        @keyframes circle-fill {
                            to { stroke-dashoffset: 0; }
                        }
                        @keyframes check-stroke {
                            to { stroke-dashoffset: 0; }
                        }
                    `}</style>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Payment Succeeded</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Amount paid: <span className="font-medium text-gray-900 dark:text-white">${(amount / 100).toFixed(2)}</span>
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-xs mt-8">Redirecting to order confirmation...</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-gray-200 dark:border-zinc-700">
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
                className="w-full bg-black dark:bg-white text-white dark:text-black py-4 px-6 rounded-xl font-medium text-lg hover:bg-gray-900 dark:hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-gray-200 dark:shadow-none"
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


const PaymentStep = ({ orderId, totalAmount }) => {
    const { darkMode } = useTheme();
    const [createPaymentIntent, { isLoading: isIntentLoading }] = useCreatePaymentIntentMutation();
    const [confirmCodOrder, { isLoading: isCodLoading }] = useConfirmCodOrderMutation();
    const [clientSecret, setClientSecret] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [isCodSuccess, setIsCodSuccess] = useState(false);

    useEffect(() => {
        if (orderId && !clientSecret && paymentMethod === 'card') {
            const initPayment = async () => {
                try {
                    const result = await createPaymentIntent({
                        orderId,
                        currency: 'usd'
                    }).unwrap();

                    if (result.data && result.data.clientSecret) {
                        setClientSecret(result.data.clientSecret);
                    } else if (result.clientSecret) {
                        setClientSecret(result.clientSecret);
                    }
                } catch (error) {
                    console.error('Failed to create payment intent:', error);
                    toast.error('Failed to initialize payment');
                }
            };

            if (!stripeKey) {
                // Don't toast here to avoid spam, UI will show error
                return;
            }
            initPayment();
        }
    }, [orderId, createPaymentIntent, clientSecret, paymentMethod]);

    const handleCodConfirm = async () => {
        try {
            await confirmCodOrder(orderId).unwrap();
            setIsCodSuccess(true);
            toast.success('Order placed successfully!');
            setTimeout(() => {
                window.location.href = `/checkout/confirmation/${orderId}`;
            }, 2000);
        } catch (error) {
            console.error('COD confirmation failed:', error);
            toast.error(error?.data?.message || 'Failed to place order');
        }
    };

    const appearance = React.useMemo(() => ({
        theme: darkMode ? 'night' : 'stripe',
        variables: {
            colorPrimary: darkMode ? '#ffffff' : '#000000',
            fontFamily: 'system-ui, sans-serif',
            borderRadius: '12px',
            colorText: darkMode ? '#ffffff' : '#30313d',
            colorBackground: darkMode ? '#18181b' : '#ffffff', // zinc-900 vs white
        },
        rules: {
            '.Input': {
                backgroundColor: darkMode ? '#27272a' : '#ffffff', // zinc-800 vs white
                color: darkMode ? '#ffffff' : '#30313d',
                borderColor: darkMode ? '#3f3f46' : '#e5e7eb',
            },
        }
    }), [darkMode]);

    const options = React.useMemo(() => ({
        clientSecret,
        appearance,
    }), [clientSecret, appearance]);

    if (isIntentLoading && paymentMethod === 'card') {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
                <span className="ml-3 text-gray-500">Initializing secure payment...</span>
            </div>
        );
    }

    if (isCodSuccess) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-2xl border border-gray-100 shadow-lg">
                <div className="mb-6 w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center">
                    <FiCheckCircle size={32} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Order Confirmed!</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Thank you for your purchase.</p>
                <p className="text-gray-400 dark:text-gray-500 text-xs mt-8">Redirecting...</p>
            </div>
        );
    }



    return (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-zinc-800 relative z-0" style={{ isolation: 'isolate' }}>
            {/* Header Gradient */}
            <div className="absolute top-0 left-[6px] right-[6px] h-1 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-t-full"></div>

            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 dark:text-white">
                <FiCreditCard className="text-indigo-600" />
                Payment Details
            </h2>

            {/* Payment Method Toggle */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                    onClick={() => setPaymentMethod('card')}
                    className={`flex-1 py-3 px-4 rounded-xl border-2 flex items-center justify-center gap-2 transition-all font-medium ${paymentMethod === 'card'
                        ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black'
                        : 'border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-zinc-600'
                        }`}
                >
                    <FiCreditCard /> Card
                </button>
                <button
                    onClick={() => setPaymentMethod('cod')}
                    className={`flex-1 py-3 px-4 rounded-xl border-2 flex items-center justify-center gap-2 transition-all font-medium ${paymentMethod === 'cod'
                        ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black'
                        : 'border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-zinc-600'
                        }`}
                >
                    <FiTruck /> Cash on Delivery
                </button>
            </div>

            {/* Content based on selection */}
            {paymentMethod === 'card' ? (
                stripeKey ? (
                    clientSecret ? (
                        <Elements key={clientSecret} options={options} stripe={stripePromise}>
                            <CheckoutForm orderId={orderId} amount={totalAmount * 100} />
                        </Elements>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                            <div className="w-8 h-8 border-2 border-gray-300 border-t-indigo-500 rounded-full animate-spin mb-2" />
                            <span className="text-sm">Preparing payment form...</span>
                        </div>
                    )
                ) : (
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800 text-center">
                        <FiAlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                        <h3 className="text-red-800 dark:text-red-300 font-medium">Payment Configuration Error</h3>
                        <p className="text-red-600 dark:text-red-400 text-sm mt-1">Stripe API Key is missing. Please check your environment variables.</p>
                    </div>
                )
            ) : (
                <div className="text-center py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-gray-50 dark:bg-zinc-800 p-6 rounded-xl border border-gray-200 dark:border-zinc-700 mb-6">
                        <div className="w-16 h-16 bg-white dark:bg-zinc-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-gray-900 dark:text-white border border-gray-100 dark:border-zinc-600">
                            <FiTruck size={28} />
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">Cash on Delivery</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                            You can pay in cash when our courier arrives with your package.
                        </p>
                        <div className="text-xs text-gray-400 dark:text-gray-500 bg-white dark:bg-zinc-900 py-2 px-3 rounded-lg inline-block border border-gray-100 dark:border-zinc-800">
                            Please keep exact change ready if possible
                        </div>
                    </div>

                    <button
                        onClick={handleCodConfirm}
                        disabled={isCodLoading}
                        className="w-full bg-black dark:bg-white text-white dark:text-black py-4 px-6 rounded-xl font-medium text-lg hover:bg-gray-900 dark:hover:bg-gray-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-gray-200 dark:shadow-none"
                    >
                        {isCodLoading ? (
                            <span className="flex items-center gap-2">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Processing...
                            </span>
                        ) : (
                            <>
                                Place Order via COD
                                <FiCheckCircle />
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};

export default PaymentStep;

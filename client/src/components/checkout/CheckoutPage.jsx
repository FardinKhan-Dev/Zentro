import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetCartQuery } from '../../features/cart/cartApi';
import { useCreateOrderMutation } from '../../features/orders/orderApi';
import ShippingForm from './ShippingForm';
import OrderReview from './OrderReview';
import PaymentStep from './PaymentStep';
import { FiCheckCircle } from '@react-icons/all-files/fi/FiCheckCircle';

/**
 * CheckoutPage - Multi-step checkout process
 */
const CheckoutPage = () => {
    const navigate = useNavigate();
    const { data: cartData, isLoading: cartLoading } = useGetCartQuery();
    const [createOrder, { isLoading: creatingOrder }] = useCreateOrderMutation();

    const [step, setStep] = useState(1); // 1: Shipping, 2: Review, 3: Payment
    const [shippingAddress, setShippingAddress] = useState(null);
    const [orderError, setOrderError] = useState(null);
    const [createdOrderId, setCreatedOrderId] = useState(null);

    const cart = cartData?.data?.cart;
    const itemCount = cartData?.data?.itemCount || 0;

    // Redirect if cart is empty (unless we've just created an order)
    if (!cartLoading && itemCount === 0 && !createdOrderId) {
        return (
            <div className="max-w-2xl mx-auto text-center py-12">
                <svg className="w-24 h-24 mx-auto text-gray-300 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your cart is empty</h2>
                <p className="text-gray-600 mb-8">Add items to your cart before checking out</p>
                <button onClick={() => navigate('/products')} className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                    Browse Products
                </button>
            </div>
        );
    }

    const handleShippingSubmit = (address) => {
        setShippingAddress(address);
        setStep(2);
    };

    const handleCreateOrder = async () => {
        try {
            const orderData = {
                shippingAddress,
                notes: '',
                // paymentMethod defaults to 'card' in backend
            };

            const result = await createOrder(orderData).unwrap();
            const orderId = result.data.order._id;

            // Move to payment step (where user chooses Card or COD)
            setCreatedOrderId(orderId);
            setStep(3);
        } catch (error) {
            setOrderError(error?.data?.message || 'Failed to create order');
            console.error('Order creation failed:', error);
        }
    };

    if (cartLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="h-full py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">Secure Checkout</h1>

                {/* Progress Steps */}
                <div className="max-w-4xl mx-auto mb-12">
                    <nav aria-label="Progress">
                        <ol role="list" className="flex items-center w-full">
                            {['Shipping', 'Review', 'Payment'].map((label, index) => {
                                const stepNumber = index + 1;
                                const isActive = step === stepNumber;
                                const isComplete = step > stepNumber;
                                const isLast = index === 2;

                                return (
                                    <li key={label} className="relative flex flex-1 items-center justify-center">
                                        {/* Line */}
                                        {!isLast && (
                                            <div className={`absolute top-4 left-0 w-full h-0.5 ${isComplete ? 'bg-black dark:bg-white' : 'bg-gray-300 dark:bg-gray-700'}`} style={{ left: '50%', width: '100%', zIndex: 0 }} />
                                        )}

                                        {/* Dot & Label */}
                                        <div className="group relative flex flex-col items-center px-2" style={{ zIndex: 10 }}>
                                            <span className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors duration-200 ${isComplete ? 'bg-black dark:bg-white border-black dark:border-white text-white dark:text-black' :
                                                isActive ? 'bg-white dark:bg-zinc-900 border-black dark:border-white text-black dark:text-white' :
                                                    'bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-700 text-gray-500 dark:text-gray-400'
                                                }`}>
                                                {isComplete ? (
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                ) : (
                                                    <span className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-black dark:bg-white' : 'bg-transparent'}`} />
                                                )}
                                            </span>
                                            <span className={`mt-2 text-sm font-medium ${isActive ? 'text-black dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                                                {label}
                                            </span>
                                        </div>
                                    </li>
                                );
                            })}
                        </ol>
                    </nav>
                </div>

                <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
                    {/* Left Column: Steps */}
                    <div className="lg:col-span-7">
                        {orderError && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 flex items-center gap-2">
                                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {orderError}
                            </div>
                        )}

                        <div className="space-y-6">
                            {step === 1 && (
                                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6 sm:p-8">
                                    <ShippingForm
                                        onSubmit={handleShippingSubmit}
                                        initialData={shippingAddress || {}}
                                    />
                                </div>
                            )}

                            {step === 2 && (
                                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6 sm:p-8">
                                    <OrderReview
                                        cart={cart}
                                        shippingAddress={shippingAddress}
                                        onBack={() => setStep(1)}
                                        onConfirm={handleCreateOrder}
                                        isLoading={creatingOrder}
                                    />
                                </div>
                            )}

                            {step === 3 && createdOrderId && (
                                <PaymentStep orderId={createdOrderId} totalAmount={cart.totalPrice} />
                            )}
                        </div>
                    </div>

                    {/* Right Column: Order Summary (Sticky) */}
                    <div className="lg:col-span-5 mt-8 lg:mt-0">
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6 sticky top-24">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <FiCheckCircle className="text-green-500" />
                                Order Summary
                            </h2>
                            <div className="flow-root">
                                <ul role="list" className="-my-4 divide-y divide-gray-100">
                                    {cart.items.map((item) => (
                                        <li key={item.product._id} className="flex py-4">
                                            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md border border-gray-200 dark:border-zinc-700">
                                                <img
                                                    src={item.product.images[0]?.url || item.product.image}
                                                    alt={item.product.name}
                                                    className="h-full w-full object-cover object-center"
                                                />
                                            </div>

                                            <div className="ml-4 flex flex-1 flex-col">
                                                <div>
                                                    <div className="flex justify-between text-base font-medium text-gray-900 dark:text-white">
                                                        <h3 className="line-clamp-1 text-gray-900 dark:text-white">
                                                            {item.product.name}
                                                        </h3>
                                                        <p className="ml-4">${(item.price * item.quantity).toFixed(2)}</p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-1 items-end justify-between text-sm">
                                                    <p className="text-gray-500 dark:text-gray-400">Qty {item.quantity}</p>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <dl className="space-y-4 border-t border-gray-100 dark:border-zinc-800 pt-6 mt-6">
                                <div className="flex items-center justify-between">
                                    <dt className="text-sm text-gray-600 dark:text-gray-400">Subtotal</dt>
                                    <dd className="text-sm font-medium text-gray-900 dark:text-white">${cart.totalPrice.toFixed(2)}</dd>
                                </div>
                                <div className="flex items-center justify-between">
                                    <dt className="text-sm text-gray-600 dark:text-gray-400">Shipping</dt>
                                    <dd className="text-sm font-medium text-gray-900 dark:text-white">Free</dd>
                                </div>
                                <div className="flex items-center justify-between border-t border-gray-100 dark:border-zinc-800 pt-4">
                                    <dt className="text-base font-bold text-gray-900 dark:text-white">Total</dt>
                                    <dd className="text-base font-bold text-gray-900 dark:text-white">${cart.totalPrice.toFixed(2)}</dd>
                                </div>
                            </dl>

                            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                SSL Secured Payment
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;

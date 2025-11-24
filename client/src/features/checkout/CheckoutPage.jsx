import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetCartQuery } from '../cart/cartApi';
import { useCreateOrderMutation } from '../orders/orderApi';
import ShippingForm from './ShippingForm';
import OrderReview from './OrderReview';

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

    const cart = cartData?.data?.cart;
    const itemCount = cartData?.data?.itemCount || 0;

    // Redirect if cart is empty
    if (!cartLoading && itemCount === 0) {
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
            };

            const result = await createOrder(orderData).unwrap();

            // Navigate to payment page with order ID
            navigate(`/checkout/payment/${result.data.order._id}`);
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
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

            {/* Progress Steps */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    {['Shipping', 'Review', 'Payment'].map((label, index) => {
                        const stepNumber = index + 1;
                        const isActive = step === stepNumber;
                        const isComplete = step > stepNumber;

                        return (
                            <div key={label} className="flex items-center flex-1">
                                <div className="flex items-center">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${isComplete ? 'bg-green-500 text-white' :
                                            isActive ? 'bg-green-500 text-white' :
                                                'bg-gray-200 text-gray-600'
                                        }`}>
                                        {isComplete ? '✓' : stepNumber}
                                    </div>
                                    <span className={`ml-3 font-medium ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                                        {label}
                                    </span>
                                </div>
                                {index < 2 && (
                                    <div className={`flex-1 h-1 mx-4 ${step > stepNumber ? 'bg-green-500' : 'bg-gray-200'}`} />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Error Message */}
            {orderError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {orderError}
                </div>
            )}

            {/* Step Content */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                {step === 1 && (
                    <ShippingForm onSubmit={handleShippingSubmit} />
                )}

                {step === 2 && (
                    <OrderReview
                        cart={cart}
                        shippingAddress={shippingAddress}
                        onBack={() => setStep(1)}
                        onConfirm={handleCreateOrder}
                        isLoading={creatingOrder}
                    />
                )}
            </div>

            {/* Cart Summary Sidebar */}
            <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                <div className="space-y-3">
                    <div className="flex justify-between text-gray-600">
                        <span>Subtotal ({itemCount} items)</span>
                        <span>${cart?.totalPrice?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>Shipping</span>
                        <span>Calculated at next step</span>
                    </div>
                    <div className="pt-3 border-t border-gray-200 flex justify-between text-lg font-semibold text-gray-900">
                        <span>Total</span>
                        <span>${cart?.totalPrice?.toFixed(2) || '0.00'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;

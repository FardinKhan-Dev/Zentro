import React from 'react';

/**
 * OrderReview Component - Review order before payment
 */
const OrderReview = ({ cart, shippingAddress, onBack, onConfirm, isLoading }) => {

    return (
        <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Review Your Order</h2>

            {/* Shipping Address */}
            <div className="mb-6 p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Shipping Address</h3>
                    <button onClick={onBack} className="text-green-500 hover:text-green-600 text-sm font-medium">
                        Edit
                    </button>
                </div>
                <p className="text-gray-700 dark:text-gray-400">{shippingAddress.street}</p>
                <p className="text-gray-700 dark:text-gray-400">
                    {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}
                </p>
                <p className="text-gray-700 dark:text-gray-400">{shippingAddress.country}</p>
                <p className="text-gray-700 dark:text-gray-400"><span>+91</span> {shippingAddress.phoneNumber}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
                <button
                    onClick={onBack}
                    className="flex-1 border-2 border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 py-3 rounded-lg font-medium transition-colors"
                    disabled={isLoading}
                >
                    Back
                </button>
                <button
                    onClick={onConfirm}
                    disabled={isLoading}
                    className="sm:flex-1 bg-black dark:bg-white hover:bg-gray-900 dark:hover:bg-gray-200 text-white dark:text-black py-3 px-8 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-gray-200 dark:shadow-none"
                >
                    {isLoading ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Creating Order...
                        </span>
                    ) : (
                        'Proceed to Payment'
                    )}
                </button>
            </div>
        </div>
    );
};

export default OrderReview;

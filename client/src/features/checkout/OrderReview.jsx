import React from 'react';

/**
 * OrderReview Component - Review order before payment
 */
const OrderReview = ({ cart, shippingAddress, onBack, onConfirm, isLoading }) => {
    return (
        <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Review Your Order</h2>

            {/* Shipping Address */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">Shipping Address</h3>
                    <button onClick={onBack} className="text-green-500 hover:text-green-600 text-sm font-medium">
                        Edit
                    </button>
                </div>
                <p className="text-gray-700">{shippingAddress.street}</p>
                <p className="text-gray-700">
                    {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}
                </p>
                <p className="text-gray-700">{shippingAddress.country}</p>
            </div>

            {/* Order Items */}
            <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Items ({cart?.items?.length || 0})</h3>
                <div className="space-y-3">
                    {cart?.items?.map((item) => {
                        const product = item.product;
                        const productName = item.name || product?.name || 'Product';
                        const productImage = item.image || product?.images?.[0]?.url || '/placeholder.jpg';
                        const productPrice = item.price || product?.price || 0;

                        return (
                            <div key={product._id || product} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                <img src={productImage} alt={productName} className="w-16 h-16 object-cover rounded" />
                                <div className="flex-1">
                                    <h4 className="font-medium text-gray-900">{productName}</h4>
                                    <p className="text-sm text-gray-600">
                                        ${productPrice.toFixed(2)} × {item.quantity}
                                    </p>
                                </div>
                                <p className="font-semibold text-gray-900">
                                    ${(productPrice * item.quantity).toFixed(2)}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Order Total */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-2">
                    <div className="flex justify-between text-gray-700">
                        <span>Subtotal</span>
                        <span>${cart?.totalPrice?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                        <span>Shipping</span>
                        <span>FREE</span>
                    </div>
                    <div className="pt-2 border-t border-gray-200 flex justify-between text-lg font-semibold text-gray-900">
                        <span>Total</span>
                        <span>${cart?.totalPrice?.toFixed(2) || '0.00'}</span>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
                <button
                    onClick={onBack}
                    className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 py-3 rounded-lg font-medium transition-colors"
                    disabled={isLoading}
                >
                    Back
                </button>
                <button
                    onClick={onConfirm}
                    disabled={isLoading}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Processing...
                        </span>
                    ) : (
                        'Continue to Payment'
                    )}
                </button>
            </div>
        </div>
    );
};

export default OrderReview;

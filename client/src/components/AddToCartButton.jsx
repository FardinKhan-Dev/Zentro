import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useAddToCartMutation } from '../features/cart/cartApi';
import { openCartDrawer } from '../features/cart/cartSlice';

/**
 * AddToCartButton Component
 * Reusable button for adding products to cart
 */
const AddToCartButton = ({ productId, initialQuantity = 1, className = '', variant = 'primary' }) => {
    const dispatch = useDispatch();
    const [addToCart, { isLoading }] = useAddToCartMutation();
    const [quantity, setQuantity] = useState(initialQuantity);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleAddToCart = async () => {
        try {
            await addToCart({ productId, quantity }).unwrap();

            // Show success feedback
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);

            // Open cart drawer after short delay
            setTimeout(() => dispatch(openCartDrawer()), 500);
        } catch (error) {
            console.error('Failed to add to cart:', error);
            alert(error?.data?.message || 'Failed to add item to cart');
        }
    };

    const baseStyles = "relative font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-green-500 hover:bg-green-600 text-white px-6 py-3 shadow-md hover:shadow-lg",
        secondary: "border-2 border-green-500 text-green-500 hover:bg-green-50 px-6 py-3",
        small: "bg-green-500 hover:bg-green-600 text-white px-4 py-2 text-sm"
    };

    return (
        <div className="relative inline-block">
            <button
                onClick={handleAddToCart}
                disabled={isLoading}
                className={`${baseStyles} ${variants[variant]} ${className}`}
            >
                {isLoading ? (
                    <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Adding...
                    </span>
                ) : (
                    <span className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Add to Cart
                    </span>
                )}
            </button>

            {/* Success Toast */}
            {showSuccess && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-bounce-in whitespace-nowrap">
                    ✓ Added to cart!
                </div>
            )}
        </div>
    );
};

export default AddToCartButton;

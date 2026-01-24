import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useAddToCartMutation } from '../../features/cart/cartApi';
import { openCartDrawer } from '../../features/cart/cartSlice';
import { openAuthDrawer } from '../../features/auth/authSlice';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

/**
 * AddToCartButton Component
 * Reusable button for adding products to cart (Auth Required)
 */
const AddToCartButton = ({ productId, initialQuantity = 1, quantity, className = '', variant = 'primary', children, ...props }) => {
    const dispatch = useDispatch();
    const { isAuthenticated } = useAuth();
    const [addToCart, { isLoading }] = useAddToCartMutation();
    const [internalQuantity, setInternalQuantity] = useState(initialQuantity);

    const handleAddToCart = async () => {
        // Check if user is logged in
        if (!isAuthenticated) {
            toast.error('Please login to add items to cart', {
                duration: 3000,
                icon: '🔒',
            });
            // Open login drawer
            dispatch(openAuthDrawer('login'));
            return;
        }

        const quantityToAdd = quantity !== undefined ? quantity : internalQuantity;
        try {
            await addToCart({ productId, quantity: quantityToAdd }).unwrap();

            // Custom Toast Notification
            toast.custom((t) => (
                <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-white shadow-xl rounded-xl pointer-events-auto flex border border-gray-100`}>
                    <div className="flex-1 w-0 p-4">
                        <div className="flex items-center">
                            <div className="shrink-0 pt-0.5">
                                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-500">
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-3 flex-1">
                                <p className="text-sm font-medium text-gray-900">Added to Cart!</p>
                                <p className="mt-1 text-xs text-gray-500">You have added {quantityToAdd} {quantityToAdd === 1 ? 'item' : 'items'} to your cart.</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <button
                            onClick={() => {
                                toast.dismiss(t.id);
                                dispatch(openCartDrawer());
                            }}
                            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gray-100 text-gray-900 font-semibold hover:bg-gray-200 transition-colors  cursor-pointer m-2"
                        >
                            <span className="text-sm truncate">View Cart</span>
                        </button>
                    </div>
                </div>
            ), {
                position: 'bottom-center',
                duration: 4000
            });
        } catch (error) {
            console.error('Failed to add to cart:', error);
            alert(error?.data?.message || 'Failed to add item to cart');
        }
    };

    const baseStyles = "relative font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-green-700 hover:bg-green-800 text-white px-6 py-3 shadow-md hover:shadow-lg",
        secondary: "border-2 border-green-500 text-green-500 hover:bg-green-50 px-6 py-3",
        small: "bg-green-700 hover:bg-green-800 text-white px-4 py-2 text-sm",
        ghost: "" // No default styles, fully custom via className
    };

    return (
        <div className="relative flex">
            <button
                onClick={handleAddToCart}
                disabled={isLoading || props.disabled}
                className={`${baseStyles} ${variants[variant]} ${className}`}
                {...props}
            >
                {children ? (
                    isLoading ? (
                        <div className="opacity-70 pointer-events-none flex items-center gap-2 justify-center w-full">
                            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            {children}
                        </div>
                    ) : (
                        children
                    )
                ) : (
                    isLoading ? (
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
                    )
                )}
            </button>


        </div>
    );
};

export default AddToCartButton;

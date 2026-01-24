import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useGetCartQuery } from '../../features/cart/cartApi';
import { closeCartDrawer, selectIsCartDrawerOpen } from '../../features/cart/cartSlice';
import { openAuthDrawer } from '../../features/auth/authSlice';
import { useAuth } from '../../hooks/useAuth';
import CartItem from './CartItem';
import CartSummary from './CartSummary';

/**
 * CartDrawer Component -  Slide-out drawer with Tailwind CSS
 */
const CartDrawer = () => {
    const dispatch = useDispatch();
    const { isAuthenticated } = useAuth();
    const isOpen = useSelector(selectIsCartDrawerOpen);
    const { data, isLoading, isError, error } = useGetCartQuery();

    const cart = data?.data?.cart;
    const itemCount = data?.data?.itemCount || 0;

    const handleClose = () => dispatch(closeCartDrawer());
    const handleOverlayClick = (e) => e.target === e.currentTarget && handleClose();

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fadeIn"
                onClick={handleOverlayClick}
                aria-hidden="true"
            />

            {/* Drawer */}
            <div className={`fixed top-0 right-0 h-screen w-full md:w-[450px] bg-white dark:bg-[#121212] z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Shopping Cart</h2>
                    <button onClick={handleClose} className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors" aria-label="Close cart">
                        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                            <path d="M6 6l12 12M6 18L18 6" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto flex flex-col">
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center p-12 text-gray-500 dark:text-gray-400">
                            <div className="w-10 h-10 border-3 border-gray-200 border-t-green-500 rounded-full animate-spin mb-4" />
                            <p>Loading cart...</p>
                        </div>
                    )}

                    {isError && (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                            {error?.status === 401 || !isAuthenticated ? (
                                <>
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                        <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Login Required</h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-6">Please login to view your cart</p>
                                    <button
                                        onClick={() => {
                                            handleClose();
                                            dispatch(openAuthDrawer('login'));
                                        }}
                                        className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
                                    >
                                        Login Now
                                    </button>
                                </>
                            ) : (
                                <div className="text-red-500">
                                    <p>Failed to load cart. Please try again.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {!isLoading && !isError && itemCount === 0 && (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                            <svg width="80" height="80" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-300 dark:text-gray-600 mb-6">
                                <circle cx="40" cy="40" r="30" />
                                <path d="M25 40h30M40 25v30" />
                            </svg>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Your cart is empty</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-8">Add items to get started</p>
                            <button onClick={handleClose} className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium transition-colors">
                                Continue Shopping
                            </button>
                        </div>
                    )}

                    {!isLoading && !isError && cart?.items && cart.items.length > 0 && (
                        <>
                            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                                {cart.items.map((item) => <CartItem key={item.product._id || item.product} item={item} />)}
                            </div>
                            <CartSummary cart={cart} itemCount={itemCount} onClose={handleClose} />
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default CartDrawer;

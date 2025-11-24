import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useGetCartQuery } from './cartApi';
import { closeCartDrawer, selectIsCartDrawerOpen } from './cartSlice';
import CartItem from './CartItem';
import CartSummary from './CartSummary';

/**
 * CartDrawer Component -  Slide-out drawer with Tailwind CSS
 */
const CartDrawer = () => {
    const dispatch = useDispatch();
    const isOpen = useSelector(selectIsCartDrawerOpen);
    const { data, isLoading, isError } = useGetCartQuery();

    const cart = data?.data?.cart;
    const itemCount = data?.data?.itemCount || 0;

    const handleClose = () => dispatch(closeCartDrawer());
    const handleOverlayClick = (e) => e.target === e.currentTarget && handleClose();

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/50 z-[999] animate-fadeIn"
                onClick={handleOverlayClick}
                aria-hidden="true"
            />

            {/* Drawer */}
            <div className={`fixed top-0 right-0 h-screen w-full max-w-md bg-white z-[1000] shadow-2xl flex flex-col transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-2xl font-semibold text-gray-900">Shopping Cart</h2>
                    <button onClick={handleClose} className="p-2 text-gray-500 hover:text-gray-900 transition-colors" aria-label="Close cart">
                        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                            <path d="M6 6l12 12M6 18L18 6" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto flex flex-col">
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center p-12 text-gray-500">
                            <div className="w-10 h-10 border-3 border-gray-200 border-t-green-500 rounded-full animate-spin mb-4" />
                            <p>Loading cart...</p>
                        </div>
                    )}

                    {isError && (
                        <div className="p-12 text-center text-red-500">
                            <p>Failed to load cart. Please try again.</p>
                        </div>
                    )}

                    {!isLoading && !isError && itemCount === 0 && (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                            <svg width="80" height="80" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-300 mb-6">
                                <circle cx="40" cy="40" r="30" />
                                <path d="M25 40h30M40 25v30" />
                            </svg>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h3>
                            <p className="text-gray-600 mb-8">Add items to get started</p>
                            <button onClick={handleClose} className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-medium transition-colors">
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

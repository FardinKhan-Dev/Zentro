import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useClearCartMutation } from '../../features/cart/cartApi';

/**
 * CartSummary Component
 * Shows cart totals and checkout button
 */
const CartSummary = ({ cart, itemCount, onClose }) => {
    const navigate = useNavigate();
    const [clearCart, { isLoading: isClearing }] = useClearCartMutation();

    const totalPrice = cart?.totalPrice || 0;

    const handleCheckout = () => {
        onClose();
        navigate('/checkout');
    };

    const handleClearCart = async () => {
        if (window.confirm('Are you sure you want to clear your cart?')) {
            try {
                await clearCart().unwrap();
            } catch (error) {
                console.error('Failed to clear cart:', error);
            }
        }
    };

    return (
        <div className="p-6 border-t border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50">
            {/* Summary Details */}
            <div className="mb-6 space-y-3">
                <div className="flex justify-between items-center text-gray-600 dark:text-gray-400 text-sm">
                    <span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
                    <span className="font-medium text-gray-900 dark:text-white">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-semibold text-gray-900 dark:text-white pt-4 border-t border-gray-200 dark:border-zinc-800">
                    <span>Total</span>
                    <span>${totalPrice.toFixed(2)}</span>
                </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
                <button
                    onClick={handleCheckout}
                    disabled={itemCount === 0}
                    className="w-full bg-green-700 hover:bg-green-800 text-white py-4 px-6 rounded-lg font-semibold uppercase tracking-wide disabled:bg-gray-300 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
                >
                    Proceed to Checkout
                </button>

                <button
                    onClick={() => onClose()}
                    className="w-full text-green-500 hover:text-green-600 py-3 font-medium transition-colors hover:underline cursor-pointer"
                >
                    Continue Shopping
                </button>

                <button
                    onClick={handleClearCart}
                    disabled={isClearing || itemCount === 0}
                    className="w-full border border-gray-300 dark:border-zinc-700 text-gray-600 dark:text-gray-400 hover:border-red-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 py-2.5 px-4 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                    {isClearing ? 'Clearing...' : 'Clear Cart'}
                </button>
            </div>

            {/* Note */}
            <p className="mt-4 text-center text-xs text-gray-500">
                Taxes and shipping calculated at checkout
            </p>
        </div>
    );
};

export default CartSummary;

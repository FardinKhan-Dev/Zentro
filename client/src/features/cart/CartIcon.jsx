import React from 'react';
import { useDispatch } from 'react-redux';
import { useGetCartQuery } from './cartApi';
import { toggleCartDrawer } from './cartSlice';

/**
 * CartIcon Component
 * Cart button for navbar with item count badge
 */
const CartIcon = () => {
    const dispatch = useDispatch();
    const { data } = useGetCartQuery();

    const itemCount = data?.data?.itemCount || 0;

    const handleClick = () => {
        dispatch(toggleCartDrawer());
    };

    return (
        <button
            onClick={handleClick}
            className="relative p-2 text-gray-700 hover:text-green-500 transition-colors"
            aria-label={`Shopping cart with ${itemCount} items`}
        >
            {/* Cart Icon SVG */}
            <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-6 h-6"
            >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>

            {/* Badge */}
            {itemCount > 0 && (
                <span
                    className="absolute top-0 right-0 flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-semibold text-white bg-green-500 rounded-full px-1 shadow-sm animate-bounce-in"
                    aria-label={`${itemCount} items in cart`}
                >
                    {itemCount > 99 ? '99+' : itemCount}
                </span>
            )}
        </button>
    );
};

export default CartIcon;

import React from 'react';
import { useDispatch } from 'react-redux';
import { useGetCartQuery } from '../../features/cart/cartApi';
import { toggleCartDrawer } from '../../features/cart/cartSlice';
import { FiShoppingCart } from '@react-icons/all-files/fi/FiShoppingCart';
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
            className="relative p-2 text-gray-900 hover:text-green-500 transition-colors"
            aria-label={`Shopping cart with ${itemCount} items`}
        >
            {/* Cart Icon SVG */}
            <FiShoppingCart className="w-5 h-5 text-gray-900 dark:text-gray-200 cursor-pointer hover:text-green-600" />
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

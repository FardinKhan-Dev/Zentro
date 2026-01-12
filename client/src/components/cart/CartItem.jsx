import React, { useState } from 'react';
import { useUpdateCartItemMutation, useRemoveFromCartMutation } from '../../features/cart/cartApi';

/**
 * CartItem Component - With Tailwind CSS
 */
const CartItem = ({ item }) => {
    const [updateCartItem, { isLoading: isUpdating }] = useUpdateCartItemMutation();
    const [removeFromCart, { isLoading: isRemoving }] = useRemoveFromCartMutation();
    const [localQuantity, setLocalQuantity] = useState(item.quantity);

    const product = item.product;
    const productId = product._id || product;
    const productName = item.name || product.name || 'Product';
    const productImage = item.image || product.images?.[0]?.url || '/placeholder-product.jpg';
    const productPrice = item.price || product.price || 0;

    const handleQuantityChange = async (newQuantity) => {
        if (newQuantity < 1 || newQuantity > 99) return;
        setLocalQuantity(newQuantity);
        try {
            await updateCartItem({ productId, quantity: newQuantity }).unwrap();
        } catch (error) {
            setLocalQuantity(item.quantity);
            console.error('Failed to update cart:', error);
        }
    };

    const handleRemove = async () => {
        try {
            await removeFromCart(productId).unwrap();
        } catch (error) {
            console.error('Failed to remove item:', error);
        }
    };

    const subtotal = (productPrice * localQuantity).toFixed(2);
    const isProcessing = isUpdating || isRemoving;

    return (
        <div className={`flex gap-4 p-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg transition-opacity ${isProcessing ? 'opacity-60 pointer-events-none' : ''}`}>
            <div className="shrink-0 w-20 h-20 rounded-md overflow-hidden bg-gray-100 dark:bg-zinc-800">
                <img src={productImage} alt={productName} loading="lazy" className="w-full h-full object-cover" />
            </div>

            <div className="flex-1 flex flex-col gap-2">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">{productName}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">${productPrice.toFixed(2)}</p>

                <div className="flex items-center gap-2 mt-auto">
                    <button onClick={() => handleQuantityChange(localQuantity - 1)} disabled={localQuantity <= 1 || isProcessing} className="w-7 h-7 flex items-center justify-center border border-gray-300 dark:border-zinc-700 rounded hover:border-green-500 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/30 text-gray-600 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all" aria-label="Decrease quantity">−</button>
                    <span className="min-w-[30px] text-center font-medium text-gray-900 dark:text-white">{localQuantity}</span>
                    <button onClick={() => handleQuantityChange(localQuantity + 1)} disabled={isProcessing} className="w-7 h-7 flex items-center justify-center border border-gray-300 dark:border-zinc-700 rounded hover:border-green-500 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/30 text-gray-600 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all" aria-label="Increase quantity">+</button>
                </div>
            </div>

            <div className="flex flex-col items-end justify-between">
                <p className="text-base font-semibold text-gray-900 dark:text-white">${subtotal}</p>
                <button onClick={handleRemove} disabled={isProcessing} className="p-2 text-gray-400 hover:text-red-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors" aria-label="Remove item">
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" className="w-4.5 h-4.5">
                        <path d="M3 6h12M5 6V4a1 1 0 011-1h4a1 1 0 011 1v2m3 0v10a1 1 0 01-1 1H5a1 1 0 01-1-1V6h8z" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default CartItem;

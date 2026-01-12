import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiArrowRight } from 'react-icons/fi';
import RatingStars from '../common/RatingStars';
import { useAddToCartMutation } from '../../features/cart/cartApi';
import AddToCartButton from '../common/AddToCartButton';

const ProductCard = ({ product, highlight = false }) => {
    const {
        _id,
        id,
        name,
        price,
        images = [],
        rating = 0,
        stock = 0,
    } = product;

    const navigate = useNavigate();
    const [addToCart, { isLoading }] = useAddToCartMutation();

    // Use images array 
    const imageUrl = images?.[0]?.url || 'https://via.placeholder.com/300x300?text=No+Image';
    const productId = _id || id;



    return (
        <div
            className={`relative rounded-3xl p-4 transition-all duration-300 min-h-[500px] hover:-translate-y-2 group
                        ${highlight
                    ? 'bg-linear-to-b from-[#9cdb8f] via-[#aaf399] to-[#e4e4e7] shadow-xl'
                    : 'bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:border-[#9cdb8f]/50 dark:hover:border-[#9cdb8f]/50'
                }
                      `}
        >
            {highlight && (
                <div className="absolute top-6 right-6 z-20 bg-white dark:bg-zinc-800 p-2 rounded-full shadow-sm cursor-pointer hover:text-red-500 transition-colors">
                    <FiHeart className="w-5 h-5 text-[#9cdb8f]" />
                </div>
            )}

            {/* Image Container */}
            <div className="h-[55%] w-full relative overflow-hidden rounded-2xl bg-white dark:bg-zinc-800 group-hover:bg-[#f0fdf4] dark:group-hover:bg-zinc-800/80 transition-colors">
                <Link to={`/products/${productId}`}>
                    <img
                        src={imageUrl}
                        alt={name}
                        className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-110"
                    />

                    {stock === 0 && (
                        <div className="absolute inset-0 bg-white/60 dark:bg-black/60 flex items-center justify-center backdrop-blur-xs">
                            <span className="px-4 py-2 bg-red-500 text-white text-sm font-bold rounded-full shadow-lg">
                                Out of Stock
                            </span>
                        </div>
                    )}
                </Link>
            </div>

            {/* Content */}
            <div className="flex flex-col h-[45%] justify-between pt-4">
                <div className="flex justify-between items-start">
                    <Link to={`/products/${productId}`} className="group-hover:text-[#2E7D32] dark:group-hover:text-[#4ade80] transition-colors">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 leading-tight">{name}</h3>
                    </Link>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex text-yellow-400 text-sm">
                        <RatingStars rating={rating} size="small" />
                    </div>
                    <span className="text-xs text-gray-400 dark:text-gray-500">({rating})</span>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">${typeof price === 'number' ? price.toFixed(2) : price}</span>
                    <span className="text-sm text-gray-400 dark:text-gray-500 line-through">${(price * 1.2).toFixed(2)}</span>
                    <span className="text-xs font-semibold text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30 px-2 py-1 rounded-full">20% OFF</span>
                </div>
                <div className="flex flex-col gap-2">
                    <AddToCartButton
                        productId={productId}
                        variant="ghost"
                        disabled={stock === 0}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-gray-200 font-semibold hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group/btn cursor-pointer"
                    >
                        <span className="text-sm truncate">Add To Cart</span>
                        <FiShoppingCart className="w-5 h-5 shrink-0" />
                    </AddToCartButton>
                    <button
                        onClick={async (e) => {
                            e.preventDefault();
                            if (stock === 0) return;
                            try {
                                await addToCart({ productId, quantity: 1 }).unwrap();
                                navigate('/checkout');
                            } catch (err) {
                                console.error('Failed to buy now', err);
                            }
                        }}
                        disabled={stock === 0 || isLoading}
                        className="flex-[1.5] flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#2E7D32] hover:bg-[#1b5e20] dark:bg-green-600 dark:hover:bg-green-700 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        <span className="text-sm truncate">Buy Now</span>
                        <FiArrowRight className="w-4 h-4 shrink-0" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
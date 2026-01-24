import React from 'react';
import { motion } from 'framer-motion';
import { FaTruck } from '@react-icons/all-files/fa/FaTruck';
import { FaUndo } from '@react-icons/all-files/fa/FaUndo';
import { FaShieldAlt } from '@react-icons/all-files/fa/FaShieldAlt';
import AddToCartButton from '../common/AddToCartButton';

/**
 * BuyNowSection Component
 * 
 * Commerce section with pricing, features, and Add to Cart CTA
 * Integrates with existing Redux cart system
 */
const BuyNowSection = ({ product }) => {
    // Mock product ID - in real implementation, fetch from API or pass as prop
    const productId = "674e3a1234567890abcdef12"; // Replace with actual MongoDB ObjectId

    const commerceFeatures = [
        { icon: <FaTruck />, text: product.buyNowSection.deliveryPromise },
        { icon: <FaUndo />, text: product.buyNowSection.returnPolicy },
        { icon: <FaShieldAlt />, text: "Secure payment powered by Stripe" }
    ];

    return (
        <section className="relative py-20 md:py-32 px-6 md:px-12 bg-linear-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
            <div className="max-w-5xl mx-auto">
                {/* Title */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-4">
                        Bring Nature Home Today
                    </h2>
                    <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400">
                        Premium quality, delivered with care
                    </p>
                </motion.div>

                {/* Pricing Card */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-200 dark:border-gray-700"
                >
                    {/* Price Display */}
                    <div className="text-center mb-8">
                        <div className="flex items-baseline justify-center gap-2 mb-2">
                            <span className="text-6xl md:text-7xl font-black text-green-600 dark:text-green-400">
                                {product.buyNowSection.price}
                            </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-lg">
                            {product.buyNowSection.unit}
                        </p>
                    </div>

                    {/* Features List */}
                    <div className="space-y-4 mb-8">
                        {product.buyNowSection.features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
                                className="flex items-center gap-3"
                            >
                                <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center shrink-0">
                                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 font-medium">
                                    {feature}
                                </p>
                            </motion.div>
                        ))}
                    </div>

                    {/* CTA Button */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6, duration: 0.4 }}
                        className="mb-8"
                    >
                        <AddToCartButton
                            productId={productId}
                            quantity={1}
                            variant="primary"
                            className="w-full text-xl py-4 rounded-2xl font-bold uppercase tracking-wide shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all"
                        >
                            Add to Cart — {product.buyNowSection.price}
                        </AddToCartButton>
                    </motion.div>

                    {/* Commerce Features */}
                    <div className="space-y-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                        {commerceFeatures.map((item, index) => (
                            <div key={index} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                                <div className="mt-0.5 text-green-500 text-lg shrink-0">
                                    {item.icon}
                                </div>
                                <p className="leading-relaxed">{item.text}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default BuyNowSection;

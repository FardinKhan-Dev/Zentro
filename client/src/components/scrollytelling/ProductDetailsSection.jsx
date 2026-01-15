import React from 'react';
import { motion } from 'framer-motion';
import { FaLeaf, FaRecycle, FaSeedling, FaBook } from 'react-icons/fa';

/**
 * ProductDetailsSection Component
 * 
 * Rich content section showing product details, features, and stats
 * Positioned below the scroll experience
 */
const ProductDetailsSection = ({ product }) => {
    // Icon mapping for features
    const featureIcons = {
        "100% Organic & Chemical-Free": <FaLeaf className="w-6 h-6" />,
        "Sustainable Packaging": <FaRecycle className="w-6 h-6" />,
        "Hand-Picked Premium Plants": <FaSeedling className="w-6 h-6" />,
        "Expert Care Guide Included": <FaBook className="w-6 h-6" />
    };

    return (
        <section className="relative py-20 md:py-32 px-6 md:px-12 bg-white dark:bg-gray-900">
            <div className="max-w-7xl mx-auto">
                {/* Title */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-6">
                        {product.detailsSection.title}
                    </h2>
                    <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed">
                        {product.detailsSection.description}
                    </p>
                </motion.div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    {product.features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                            className="bg-linear-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 border border-green-100 dark:border-gray-600 shadow-sm hover:shadow-lg transition-shadow"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-500 rounded-xl text-white">
                                    {featureIcons[feature] || <FaLeaf className="w-6 h-6" />}
                                </div>
                                <p className="font-semibold text-gray-900 dark:text-white text-sm md:text-base">
                                    {feature}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Stats Display */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-6"
                >
                    {product.stats.map((stat, index) => (
                        <div
                            key={index}
                            className="text-center p-6 bg-linear-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700"
                        >
                            <p className="text-3xl md:text-4xl font-black text-green-600 dark:text-green-400 mb-2">
                                {stat.value}
                            </p>
                            <p className="text-sm md:text-base font-medium text-gray-600 dark:text-gray-400">
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default ProductDetailsSection;

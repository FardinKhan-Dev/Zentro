import React from 'react';
import { motion } from 'framer-motion';
import { FaCheckCircle } from '@react-icons/all-files/fa/FaCheckCircle';
import { FaRecycle } from '@react-icons/all-files/fa/FaRecycle';
import { FaHeart } from '@react-icons/all-files/fa/FaHeart';

/**
 * ProductQualitySection Component
 * 
 * Showcases quality, freshness, and sustainability messaging
 * Trust-building section with badges and certifications
 */
const ProductQualitySection = ({ product }) => {
    const trustBadges = [
        { icon: <FaCheckCircle />, label: "Certified Organic" },
        { icon: <FaRecycle />, label: "100% Recyclable" },
        { icon: <FaHeart />, label: "Climate Positive" }
    ];

    return (
        <section
            className="relative py-20 md:py-32 px-6 md:px-12 overflow-hidden"
            style={{
                background: product.gradient
            }}
        >
            {/* Decorative overlay */}
            <div className="absolute inset-0 bg-black/10 dark:bg-black/30"></div>

            <div className="relative z-10 max-w-6xl mx-auto text-center text-white">
                {/* Title */}
                <motion.h2
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-4xl md:text-6xl font-black mb-6 drop-shadow-lg"
                >
                    {product.qualitySection.title}
                </motion.h2>

                {/* Description */}
                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="text-lg md:text-xl leading-relaxed max-w-4xl mx-auto mb-12 drop-shadow-md"
                >
                    {product.qualitySection.description}
                </motion.p>

                {/* Trust Badges */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="flex flex-wrap justify-center gap-6 md:gap-8"
                >
                    {trustBadges.map((badge, index) => (
                        <motion.div
                            key={index}
                            whileHover={{ scale: 1.1, transition: { duration: 0.2 } }}
                            className="flex flex-col items-center gap-3 bg-white/20 dark:bg-black/20 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-white/30 shadow-xl min-w-[140px]"
                        >
                            <div className="text-5xl md:text-6xl">{badge.icon}</div>
                            <p className="text-sm md:text-base font-bold tracking-wide">
                                {badge.label}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default ProductQualitySection;

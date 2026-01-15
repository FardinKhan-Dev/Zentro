import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

/**
 * ProductTextOverlays Component
 * 
 * Displays product name and price at the start, then fades out to reveal the product
 */
const ProductTextOverlays = ({ product, containerRef }) => {
    // Get scroll progress from the same container as ProductBottleScroll
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    // Fade out early (0-20% of scroll) to not block product visuals
    const introOpacity = useTransform(
        scrollYProgress,
        [0, 0.15, 0.25],
        [1, 0.5, 0]
    );

    return (
        <div className="fixed inset-0 pointer-events-none z-10 flex items-center justify-center">
            <motion.div
                style={{ opacity: introOpacity }}
                className="text-center px-6"
            >
                {/* Product Name */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="text-6xl md:text-8xl lg:text-9xl font-black uppercase tracking-tight mb-6"
                    style={{
                        fontFamily: "'Outfit', 'Inter', sans-serif",
                        background: `linear-gradient(135deg, ${product.themeColor} 0%, #7FC77D 100%)`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        textShadow: '0 4px 30px rgba(0,0,0,0.2)'
                    }}
                >
                    {product.name}
                </motion.h1>

                {/* Tagline */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="text-2xl md:text-4xl font-medium text-gray-800 dark:text-gray-200 mb-8"
                    style={{
                        fontFamily: "'Outfit', 'Inter', sans-serif",
                        textShadow: '0 2px 15px rgba(0,0,0,0.15)'
                    }}
                >
                    {product.tagline}
                </motion.p>

                {/* Scroll indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 1, repeat: Infinity, repeatType: 'reverse' }}
                    className="mt-12"
                >
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-2">Scroll to explore</p>
                    <svg className="w-6 h-6 mx-auto animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default ProductTextOverlays;

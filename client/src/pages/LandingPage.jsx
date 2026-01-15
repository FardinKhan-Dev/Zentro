import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import featuredProduct from '../data/featuredProduct';
import {
    ProductBottleScroll,
    ProductTextOverlays,
    ProductDetailsSection,
    ProductQualitySection,
    BuyNowSection
} from '../components/scrollytelling';

/**
 * LandingPage Component
 * 
 * Main scrollytelling orchestration page
 * Creates an immersive product showcase experience
 */
const LandingPage = () => {
    const scrollContainerRef = useRef(null);

    // Scroll to top on mount (useful if navigating from another route)
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="relative min-h-screen">
            {/* Gradient Background */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="fixed inset-0 -z-20"
                style={{
                    background: featuredProduct.gradient
                }}
            />

            {/* Main Scrollytelling Section */}
            <div className="relative" ref={scrollContainerRef}>
                {/* Canvas Animation */}
                <ProductBottleScroll
                    product={featuredProduct}
                    containerRef={scrollContainerRef}
                />

                {/* Text Overlays (positioned absolutely over canvas) */}
                <ProductTextOverlays
                    product={featuredProduct}
                    containerRef={scrollContainerRef}
                />
            </div>

            {/* Product Details Section */}
            <ProductDetailsSection product={featuredProduct} />

            {/* Quality/Sustainability Section */}
            <ProductQualitySection product={featuredProduct} />

            {/* Buy Now Section */}
            <BuyNowSection product={featuredProduct} />
        </div>
    );
};

export default LandingPage;

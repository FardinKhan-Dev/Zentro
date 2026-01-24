import React from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';

const ScrollToTop = () => {
    const [isVisible, setIsVisible] = React.useState(false);
    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, "change", (latest) => {
        setIsVisible(latest > 300);
    });

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    return (
        <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.8 }}
            transition={{ duration: 0.3 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-50 w-12 h-12 bg-green-700 text-gray-900 dark:text-gray-200 rounded-full shadow-lg hover:bg-[#9cdb8f] transition-all duration-300 hover:scale-110 flex items-center justify-center group"
            aria-label="Scroll to top"
            style={{ pointerEvents: isVisible ? 'auto' : 'none' }}
        >
            <svg className="w-6 h-6 transform group-hover:-translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
        </motion.button>
    );
};

export default ScrollToTop;
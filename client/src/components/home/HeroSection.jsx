import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../common/Button';

const HeroSection = () => {
    return (
        <section className="relative w-full h-screen xl:h-full flex items-center justify-center overflow-x-hidden">
            {/* Background Image */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat bg-fixed"
                style={{ backgroundImage: "url('/Hero-BG.webp')" }}
            >
                {/* Gradient Overlay for Readability */}
                <div className="absolute inset-0 bg-black/40 dark:bg-black/60 bg-linear-to-t from-black via-transparent to-black/30" />
            </div>

            {/* Content Container */}
            <div className="relative z-10 container mx-auto px-6 text-center text-white pb-8">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="max-w-4xl mx-auto space-y-4"
                >
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-4 py-2 mt-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-xl"
                    >
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-sm font-medium tracking-wide uppercase text-green-100">Sustainable Living</span>
                    </motion.div>

                    {/* Main Heading */}
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-black leading-tight tracking-tight drop-shadow-2xl">
                        <span className="block text-transparent bg-clip-text bg-linear-to-b from-white to-white/70">
                            PLANT A TREE
                        </span>
                        <span className="block text-transparent bg-clip-text bg-linear-to-r from-green-400 to-emerald-300">
                            GROW THE FUTURE
                        </span>
                    </h1>

                    {/* Subheading */}
                    <p className="max-w-xl mx-auto text-lg md:text-xl text-gray-200 font-light leading-relaxed drop-shadow-md">
                        Join the movement towards a greener planet. Every purchase contributes to reforestation projects aimed at restoring our Earth's lungs.
                    </p>

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <Link to="/products">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button size="large" className="bg-green-600 hover:bg-green-500 text-white border-none shadow-green-900/50 shadow-lg px-8 py-4 text-lg rounded-full">
                                    Shop Collection
                                </Button>
                            </motion.div>
                        </Link>
                        <Link to="/about">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Button variant="outline" size="large" className="border-white/50 text-white hover:bg-white/10 hover:border-white px-8 py-4 text-lg rounded-full backdrop-blur-sm">
                                    Our Mission
                                </Button>
                            </motion.div>
                        </Link>
                    </div>

                    {/* Statistics/Trust Badges */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8, duration: 1 }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-white/10 mt-8 max-w-3xl mx-auto"
                    >
                        {[
                            { label: "Trees Planted", value: "10k+" },
                            { label: "Happy Customers", value: "5k+" },
                            { label: "Products", value: "150+" },
                            { label: "Carbon Offset", value: "240t" }
                        ].map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-2xl font-bold text-white">{stat.value}</div>
                                <div className="text-xs text-gray-300 uppercase tracking-wider">{stat.label}</div>
                            </div>
                        ))}
                    </motion.div>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute bottom-36 xl:bottom-10 left-1/2 transform -translate-x-1/2 cursor-pointer opacity-70 hover:opacity-100"
            >
                <div className="w-[30px] h-[50px] rounded-full border-2 border-white flex justify-center p-2">
                    <div className="w-1 h-3 bg-white rounded-full" />
                </div>
            </motion.div>
        </section>
    );
};

export default HeroSection;

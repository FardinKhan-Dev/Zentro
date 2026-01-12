import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiHome, FiArrowLeft } from 'react-icons/fi';

const NotFoundPage = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 flex items-center justify-center p-4 overflow-hidden relative">
            {/* Background Decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute bg-[#2E7D32]/10 dark:bg-[#4ade80]/10 rounded-full"
                        initial={{
                            x: Math.random() * window.innerWidth,
                            y: Math.random() * window.innerHeight,
                            scale: Math.random() * 0.5 + 0.5,
                        }}
                        animate={{
                            y: [Math.random() * window.innerHeight, Math.random() * window.innerHeight],
                            x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
                        }}
                        transition={{
                            duration: Math.random() * 20 + 10,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                        style={{
                            width: Math.random() * 100 + 50,
                            height: Math.random() * 100 + 50,
                        }}
                    />
                ))}
            </div>

            <div className="text-center relative z-10 max-w-lg w-full">
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="relative"
                >
                    <motion.h1
                        animate={{ y: [0, -20, 0] }}
                        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                        className="text-[150px] md:text-[200px] font-black leading-none text-transparent bg-clip-text bg-linear-to-b from-[#2E7D32] to-[#9cdb8f] opacity-20 dark:opacity-30 select-none"
                    >
                        404
                    </motion.h1>

                    <motion.div
                        className="absolute inset-0 flex items-center justify-center"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        {/* Animated Illustration - Ghost */}
                        <motion.svg
                            width="200"
                            height="200"
                            viewBox="0 0 200 200"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            animate={{ y: [0, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                        >
                            <path
                                d="M100 20C60 20 30 50 30 90V160C30 170 40 180 50 170L65 155L80 170L100 150L120 170L135 155L150 170C160 180 170 170 170 160V90C170 50 140 20 100 20Z"
                                className="fill-white dark:fill-zinc-800 stroke-[#2E7D32] dark:stroke-[#4ade80] stroke-2"
                            />
                            {/* Eyes */}
                            <motion.circle cx="70" cy="80" r="8" className="fill-[#2E7D32] dark:fill-[#4ade80]"
                                animate={{ scaleY: [1, 0.1, 1] }}
                                transition={{ repeat: Infinity, duration: 3, repeatDelay: 4 }}
                            />
                            <motion.circle cx="130" cy="80" r="8" className="fill-[#2E7D32] dark:fill-[#4ade80]"
                                animate={{ scaleY: [1, 0.1, 1] }}
                                transition={{ repeat: Infinity, duration: 3, repeatDelay: 4 }}
                            />
                            {/* Mouth */}
                            <ellipse cx="100" cy="110" rx="10" ry="15" className="fill-[#2E7D32]/20 dark:fill-[#4ade80]/20" />
                        </motion.svg>
                    </motion.div>
                </motion.div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Ooops! Page Not Found</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="w-full sm:w-auto px-8 py-3 bg-[#2E7D32] text-white rounded-xl font-bold shadow-lg shadow-green-900/20 hover:bg-[#1b5e20] transition-colors flex items-center justify-center gap-2"
                            >
                                <FiHome /> Go Home
                            </motion.button>
                        </Link>
                        <button
                            onClick={() => window.history.back()}
                            className="w-full sm:w-auto px-8 py-3 bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-zinc-700 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <FiArrowLeft /> Go Back
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default NotFoundPage;

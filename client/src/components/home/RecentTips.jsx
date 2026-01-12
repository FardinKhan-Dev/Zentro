import React from 'react';
import { motion } from 'framer-motion';

const RecentTips = () => {
    const tips = [
        {
            icon: (
                <svg className="w-8 h-8 text-[#7FC77D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            ),
            title: 'Fast Shipping',
            description: 'Get your order delivered quickly with our express shipping options.',
        },
        {
            icon: (
                <svg className="w-8 h-8 text-[#7FC77D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            title: 'Quality Products',
            description: 'We ensure every product meets our high standards of quality.',
        },
        {
            icon: (
                <svg className="w-8 h-8 text-[#7FC77D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            title: 'Easy Returns',
            description: 'Not satisfied? Return within 30 days for a full refund.',
        },
    ];

    return (
        <section className="px-6 md:px-12 max-w-7xl mx-auto mt-20 mb-32">
            <motion.div
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative overflow-hidden rounded-3xl bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl shadow-2xl"
            >


                <div className="p-8 md:p-12">
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex flex-col gap-4 mb-8"
                    >
                        <div className='z-10 absolute top-0 right-0 w-[15%] sm:w-[40%] lg:w-[55%] xl:w-[65%] h-12 bg-[#bfc0bf] dark:bg-[#0a1a0f] rounded-bl-4xl 
                              before:absolute before:top-0 before:-left-7.5 before:w-8 before:h-8 before:bg-transparent before:rounded-tr-4xl before:shadow-[5px_-11px_0_#bfc0bf] dark:before:shadow-[5px_-11px_0_#0a1a0f]
                              after:absolute after:-bottom-5 after:right-0 after:w-5 after:h-5 after:bg-transparent after:rounded-tr-3xl after:shadow-[5px_-5px_0_#bfc0bf] dark:after:shadow-[5px_-5px_0_#0a1a0f]'>
                        </div>
                        <div className="flex items-center gap-2 mb-8 mt-2">
                            <h2 className="text-2xl md:text-4xl font-black uppercase tracking-wider bg-linear-to-r from-[#2E7D32] to-[#7FC77D] bg-clip-text text-transparent">Why Choose Us</h2>
                            <span className="text-4xl">✨</span>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            {tips.map((tip, index) => (
                                <div
                                    key={index}
                                    className="group bg-white/60 dark:bg-gray-800/20 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-200/50 dark:border-gray-700/50 overflow-hidden   backdrop-blur-xl shadow-2xl"
                                >
                                    <div className="flex gap-2 mb-2 transform group-hover:scale-110 transition-transform duration-300">
                                        {tip.icon}
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-200 mb-2">{tip.title}</h3>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{tip.description}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </section>
    );
};

export default RecentTips;

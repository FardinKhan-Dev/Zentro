import React from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiPackage, FiGlobe, FiAward, FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const AboutPage = () => {
    const stats = [
        { id: 1, label: 'Happy Customers', value: '50K+', icon: FiUsers },
        { id: 2, label: 'Products Sold', value: '150K+', icon: FiPackage },
        { id: 3, label: 'Countries Served', value: '25+', icon: FiGlobe },
        { id: 4, label: 'Awards Won', value: '12', icon: FiAward },
    ];

    const values = [
        {
            title: 'Quality First',
            description: 'We never compromise on the quality of our products. Every item is hand-picked and tested.',
            icon: '✨'
        },
        {
            title: 'Sustainability',
            description: 'We are committed to reducing our carbon footprint through eco-friendly packaging.',
            icon: '🌱'
        },
        {
            title: 'Customer Focus',
            description: 'Your satisfaction is our top priority. Our support team is here for you 24/7.',
            icon: '🤝'
        }
    ];

    return (
        <div className="min-h-screen pb-10">
            {/* Hero Section */}
            <div className="relative h-[400px] lg:h-[500px] flex items-center justify-center overflow-hidden mb-16 lg:mb-24">
                <div className="absolute inset-0 bg-linear-to-r from-green-900/90 to-black/60 z-10" />
                <img
                    src="https://images.unsplash.com/photo-1470058869958-2a77ade41c02?q=80&w=2070&auto=format&fit=crop"
                    alt="About Us Hero"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl lg:text-6xl font-black text-white mb-6 tracking-tight"
                    >
                        Redefining <span className="text-transparent bg-clip-text bg-linear-to-r from-[#9cdb8f] to-green-400">Modern Commerce</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg lg:text-xl text-gray-100 max-w-2xl mx-auto leading-relaxed"
                    >
                        We're on a mission to bring you the world's best products with an unmatched shopping experience.
                    </motion.p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Mission Section */}
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20 mb-24">
                    <div className="flex-1">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <div className="absolute -top-4 -left-4 w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full blur-2xl" />
                            <h2 className="relative text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                                Our Mission
                            </h2>
                            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                                At Zentro, we believe that shopping should be more than just a transaction—it should be an experience. Founded in 2023, we started with a simple idea: curb the chaos of online shopping by curating only the finest products.
                            </p>
                            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
                                Whether you're looking for the latest tech, stylish apparel, or home essentials, we've got you covered. Our team works tirelessly to source items that combine quality, functionality, and style.
                            </p>
                            <Link to="/products" className="inline-flex items-center gap-2 text-[#2E7D32] dark:text-[#4ade80] font-bold hover:gap-3 transition-all">
                                Explore Our Collection <FiArrowRight />
                            </Link>
                        </motion.div>
                    </div>
                    <div className="flex-1 relative">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="relative z-10 rounded-3xl overflow-hidden shadow-2xl"
                        >
                            <img
                                src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2664&auto=format&fit=crop"
                                alt="Our Office"
                                className="w-full h-auto"
                            />
                        </motion.div>
                        {/* Decorative elements */}
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-100 dark:bg-emerald-900/30 rounded-full blur-3xl -z-10" />
                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-green-100 dark:bg-green-900/30 rounded-full blur-3xl -z-10" />
                    </div>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="text-center p-6 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl border border-gray-100 dark:border-zinc-800"
                        >
                            <div className="w-12 h-12 mx-auto bg-white dark:bg-zinc-700 rounded-full flex items-center justify-center text-[#2E7D32] dark:text-[#4ade80] mb-4 shadow-sm">
                                <stat.icon size={24} />
                            </div>
                            <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-1">{stat.value}</h3>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Values Section */}
                <div className="text-center mb-20">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12">Why Choose Us?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {values.map((val, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="p-8 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl hover:shadow-xl dark:hover:shadow-zinc-800 transition-all duration-300 hover:-translate-y-1"
                            >
                                <div className="text-4xl mb-6">{val.icon}</div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{val.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{val.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* CTA Section */}
                <div className="relative rounded-3xl overflow-hidden bg-zinc-900 text-black dark:text-white p-12 lg:p-20 text-center mb-20">
                    <div className="absolute inset-0 opacity-20 text-black dark:text-white bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                    <div className="relative z-10">
                        <h2 className="text-3xl lg:text-4xl font-bold mb-6 dark:text-white">Ready to Experience Better Shopping?</h2>
                        <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto dark:text-white">
                            Join thousands of happy customers and discover products that spark joy.
                        </p>
                        <Link to="/products">
                            <button className="px-8 py-4 bg-[#2E7D32] text-white font-bold rounded-xl hover:bg-[#1b5e20] transition-all transform hover:scale-105 shadow-lg">
                                Start Shopping Now
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;

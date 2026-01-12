import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';

const PromoBanner = () => {
    return (
        <section className="py-16 bg-linear-to-r from-[#F1F8F0] to-[#E8F5E9]">
            <div className="container-custom">
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        {/* Left - Illustration/Image */}
                        <div className="relative h-full min-h-[300px] bg-linear-to-br from-[#7FC77D]/10 to-[#E8F5E9] flex items-center justify-center p-8">
                            <img
                                src="https://images.unsplash.com/photo-1556910052-c7d196b44e1c?w=500&h=500&fit=crop"
                                alt="Promotional"
                                className="rounded-2xl shadow-lg max-w-full h-auto"
                            />

                            {/* Decorative Elements */}
                            <div className="absolute top-8 right-8 w-20 h-20 bg-[#7FC77D]/20 rounded-full blur-2xl animate-pulse"></div>
                            <div className="absolute bottom-8 left-8 w-32 h-32 bg-[#E8F5E9] rounded-full blur-3xl"></div>
                        </div>

                        {/* Right - Content */}
                        <div className="p-8 md:p-12">
                            <div className="inline-block mb-4">
                                <span className="px-4 py-2 bg-[#7FC77D]/10 text-[#2E7D32] rounded-full text-sm font-semibold">
                                    🎉 Limited Time Offer
                                </span>
                            </div>

                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                Get 20% Off Your First Order
                            </h2>

                            <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                                Sign up for our newsletter and receive exclusive deals, tips, and updates.
                                Join thousands of happy customers who trust us for their needs.
                            </p>

                            <div className="space-y-4 mb-6">
                                <div className="flex items-center gap-3">
                                    <svg className="w-5 h-5 text-[#7FC77D] shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-gray-700">Free shipping on all orders</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <svg className="w-5 h-5 text-[#7FC77D] shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-gray-700">Exclusive member benefits</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <svg className="w-5 h-5 text-[#7FC77D] shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-gray-700">Early access to new products</span>
                                </div>
                            </div>

                            <Link to="/register">
                                <Button variant="primary" size="large" className="shadow-lg w-full sm:w-auto">
                                    Sign Up Now
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PromoBanner;

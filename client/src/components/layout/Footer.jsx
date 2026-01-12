import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const Footer = () => {
    const currentYear = format(new Date(), 'yyyy');

    const footerLinks = {
        shop: [
            { name: 'Products', path: '/products' },
            { name: 'New Arrivals', path: '/products?sort=newest' },
            { name: 'Best Sellers', path: '/products?sort=popular' },
            { name: 'Special Offers', path: '/products?sale=true' },
        ],
        company: [
            { name: 'About Us', path: '/about' },
            { name: 'Contact', path: '/contact' },
            { name: 'Stores', path: '/stores' },
            { name: 'Careers', path: '/careers' },
        ],
        support: [
            { name: 'Help Center', path: '/help' },
            { name: 'Shipping Info', path: '/shipping' },
            { name: 'Returns', path: '/returns' },
            { name: 'Privacy Policy', path: '/privacy' },
        ],
    };

    const socialLinks = [
        { name: 'Facebook', icon: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z' },
        { name: 'Instagram', icon: 'M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01M7.5 2h9A5.5 5.5 0 0122 7.5v9a5.5 5.5 0 01-5.5 5.5h-9A5.5 5.5 0 012 16.5v-9A5.5 5.5 0 017.5 2z' },
        { name: 'Twitter', icon: 'M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z' },
    ];

    return (
        <footer className="text-gray-800">
            <div className="px-4 md:px-8 pt-8 md:pt-12 pb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                    {/* Brand */}
                    <div className="lg:col-span-2">
                        <Link to="/" className="flex items-center space-x-2 mb-4">
                            <div className="w-10 h-10 bg-linear-to-br from-[#7FC77D] to-[#2E7D32] rounded-xl flex items-center justify-center">
                                <span className="text-white font-bold text-xl">Z</span>
                            </div>
                            <span className="text-2xl font-bold text-gray-900 dark:text-gray-200">Zentro</span>
                        </Link>
                        <p className="text-gray-700 dark:text-gray-400 mb-4 max-w-sm">
                            Your trusted partner for quality products. We bring you the best items to enhance your lifestyle.
                        </p>
                        <div className="flex space-x-4">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.name}
                                    href="#"
                                    className="w-10 h-10 text-gray-700 dark:text-gray-400 rounded-lg flex items-center justify-center hover:bg-[#7FC77D] dark:hover:bg-[#183e1a] transition-colors"
                                    aria-label={social.name}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={social.icon} />
                                    </svg>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Shop Links */}
                    <div>
                        <h3 className="text-gray-900 dark:text-gray-200 font-semibold mb-4">Shop</h3>
                        <ul className="space-y-3">
                            {footerLinks.shop.map((link) => (
                                <li key={link.name}>
                                    <Link to={link.path} className="text-gray-700 dark:text-gray-400 hover:text-[#7FC77D] transition-colors">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h3 className="text-gray-900 dark:text-gray-200 font-semibold mb-4">Company</h3>
                        <ul className="space-y-3">
                            {footerLinks.company.map((link) => (
                                <li key={link.name}>
                                    <Link to={link.path} className="text-gray-700 dark:text-gray-400 hover:text-[#7FC77D] transition-colors">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support Links */}
                    <div>
                        <h3 className="text-gray-900 dark:text-gray-200 font-semibold mb-4">Support</h3>
                        <ul className="space-y-3">
                            {footerLinks.support.map((link) => (
                                <li key={link.name}>
                                    <Link to={link.path} className="text-gray-700 dark:text-gray-400 hover:text-[#7FC77D] transition-colors">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="mt-8 pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-gray-700 dark:text-gray-400 text-sm">
                        © {currentYear} Zentro. All rights reserved.
                    </p>
                    <div className="flex space-x-6 text-sm">
                        <Link to="/terms" className="text-gray-700 dark:text-gray-400 hover:text-[#7FC77D] transition-colors">
                            Terms of Service
                        </Link>
                        <Link to="/privacy" className="text-gray-700 dark:text-gray-400 hover:text-[#7FC77D] transition-colors">
                            Privacy Policy
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

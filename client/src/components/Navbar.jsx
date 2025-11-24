import React from 'react';
import { Link } from 'react-router-dom';
import { CartIcon } from '../features/cart';

/**
 * Navbar Component with Tailwind CSS
 */
const Navbar = () => {
    return (
        <nav className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center">
                        <span className="text-2xl font-bold text-green-500">Zentro</span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/products" className="text-gray-700 hover:text-green-500 font-medium transition-colors">
                            Products
                        </Link>
                        <Link to="/stores" className="text-gray-700 hover:text-green-500 font-medium transition-colors">
                            Stores
                        </Link>
                        <Link to="/about" className="text-gray-700 hover:text-green-500 font-medium transition-colors">
                            About
                        </Link>
                        <Link to="/contact" className="text-gray-700 hover:text-green-500 font-medium transition-colors">
                            Contact
                        </Link>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center space-x-4">
                        {/* Cart Icon */}
                        <CartIcon />

                        {/* Auth Links */}
                        <Link to="/login" className="text-gray-700 hover:text-green-500 font-medium transition-colors">
                            Login
                        </Link>
                        <Link to="/register" className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                            Sign Up
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

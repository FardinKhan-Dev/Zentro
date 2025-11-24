import React from 'react';
import Navbar from './Navbar';
import { CartDrawer } from '../features/cart';

/**
 * Main Layout Component
 * Wraps all pages with navbar and cart drawer
 */
const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
            <CartDrawer />
        </div>
    );
};

export default Layout;

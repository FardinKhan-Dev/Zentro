import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { CartDrawer } from '../../components/cart';
import ScrollToTop from '../common/ScrollToTop';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col bg-[#e4f8e9] dark:bg-[#0a1a0f]">
            <Navbar />
            <main className="grow">{children}</main>
            <CartDrawer />
            <Footer />
            <ScrollToTop />
        </div>
    );
};

export default Layout;

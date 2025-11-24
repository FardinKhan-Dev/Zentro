import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Layout, StoreLocator } from './components';
import Register from './features/auth/Register';
import Login from './features/auth/Login';
import VerifyEmail from './features/auth/VerifyEmail';
import RequestReset from './features/auth/RequestReset';
import ResetPassword from './features/auth/ResetPassword';
import ChangePassword from './features/auth/ChangePassword';
import ProductList from './features/products/ProductList';
import ProductDetail from './features/products/ProductDetail';
import ProductForm from './features/products/ProductForm';
import { CheckoutPage, OrderConfirmation } from './features/checkout';
import { OrdersPage, OrderDetailPage } from './features/orders';

const Home = () => (
  <div className="text-center py-12">
    <h1 className="text-4xl font-bold text-gray-900 mb-4">Zentro - E-Commerce Platform</h1>
    <p className="text-lg text-gray-600 mb-2">Phase 1-5: Complete E-Commerce Platform with Maps! ✅</p>
    <p className="text-lg text-green-600 font-semibold mb-8">Full-Stack Commerce with Leaflet Maps 🗺️</p>
    <div className="space-x-4">
      <Link to="/products" className="inline-block bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
        Browse Products
      </Link>
      <Link to="/stores" className="inline-block border-2 border-green-500 text-green-500 hover:bg-green-50 px-6 py-3 rounded-lg font-medium transition-colors">
        Find a Store
      </Link>
    </div>
  </div>
);

const App = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />

        {/* Auth Routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/request-reset" element={<RequestReset />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/change-password" element={<ChangePassword />} />

        {/* Product Routes */}
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/products/:id/edit" element={<ProductForm />} />
        <Route path="/products/create" element={<ProductForm />} />

        {/* Checkout Routes */}
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/checkout/confirmation/:orderId" element={<OrderConfirmation />} />

        {/* Order Routes */}
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/orders/:orderId" element={<OrderDetailPage />} />

        {/* Store Locator */}
        <Route path="/stores" element={<StoreLocator />} />
      </Routes>
    </Layout>
  );
};

export default App;

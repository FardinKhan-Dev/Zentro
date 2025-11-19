import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Register from './features/auth/Register';
import Login from './features/auth/Login';
import VerifyEmail from './features/auth/VerifyEmail';
import RequestReset from './features/auth/RequestReset';
import ResetPassword from './features/auth/ResetPassword';
import ChangePassword from './features/auth/ChangePassword';
import ProductList from './features/products/ProductList';
import ProductDetail from './features/products/ProductDetail';
import ProductForm from './features/products/ProductForm';

const Home = () => (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    <h1>Zentro - E-Commerce Platform</h1>
    <p>Phase 1 & 2: Foundation & Authentication - Complete!</p>
    <p>Phase 3: Products - In Progress!</p>
    <p>
      <Link to="/products">Browse Products</Link> | <Link to="/register">Register</Link> | <Link to="/login">Login</Link>
    </p>
  </div>
);

const App = () => {
  return (
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
    </Routes>
  );
};

export default App;

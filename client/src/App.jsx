import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Register from './features/auth/Register';
import Login from './features/auth/Login';
import VerifyEmail from './features/auth/VerifyEmail';
import RequestReset from './features/auth/RequestReset';
import ResetPassword from './features/auth/ResetPassword';
import ChangePassword from './features/auth/ChangePassword';

const Home = () => (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    <h1>Zentro - E-Commerce Platform</h1>
    <p>Phase 1: Foundation & Infrastructure - Complete!</p>
    <p>Next: Phase 2 - Authentication System</p>
    <p>
      <Link to="/register">Register</Link> | <Link to="/login">Login</Link>
    </p>
  </div>
);

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/request-reset" element={<RequestReset />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/change-password" element={<ChangePassword />} />
    </Routes>
  );
};

export default App;

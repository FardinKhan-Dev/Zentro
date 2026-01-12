import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/layout';
import ScrollToTop from './components/common/ScrollToTop';
import RouteScrollToTop from './components/common/RouteScrollToTop';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import VerifyEmail from './components/auth/VerifyEmail';
import RequestReset from './components/auth/RequestReset';
import ResetPassword from './components/auth/ResetPassword';
import ChangePassword from './components/auth/ChangePassword';
import ProductList from './components/products/ProductList';
import ProductDetail from './components/products/ProductDetail';
import ProductForm from './components/admin/ProductForm';
import { CheckoutPage, OrderConfirmation, PaymentPage } from './components/checkout';
import { OrdersPage, OrderDetailPage } from './components/orders';
import StoreLocator from './components/map/StoreLocator';
import AboutPage from './pages/AboutPage';
import NotFoundPage from './pages/NotFoundPage';
import ProfilePage from './pages/ProfilePage';
import Home from './pages/Home';
import { AdminLayout, Dashboard, ProductManager, OrderManager, UserManager, Analytics, AdminSettings, AdminProfile } from './components/admin';
import AuthDrawer from './components/auth/AuthDrawer';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicRoute from './components/auth/PublicRoute';
import { useGetMeQuery } from './features/auth/authApi';
import { Toaster, toast } from 'react-hot-toast';

const App = () => {
  const { isLoading } = useGetMeQuery();

  /* 
    Handle Google Auth Callback
    The backend redirects to /?auth=success or /?auth=failed
  */
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authStatus = params.get('auth');
    if (authStatus === 'success') {
      toast.success('Successfully logged in with Google!');
      // Clear the query param
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (authStatus === 'failed') {
      toast.error('Google login failed. Please try again.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <RouteScrollToTop />
      <ScrollToTop />
      <AuthDrawer />
      <Routes>
        {/* Main Layout Routes */}
        <Route element={<Layout><Outlet /></Layout>}>
          <Route path="/" element={<Home />} />

          {/* Auth Routes */}
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          <Route path="/request-reset" element={
            <PublicRoute>
              <RequestReset />
            </PublicRoute>
          } />
          <Route path="/reset-password" element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          } />
          <Route path="/change-password" element={
            <ProtectedRoute>
              <ChangePassword />
            </ProtectedRoute>
          } />

          {/* Product Routes */}
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/products/:id/edit" element={
            <ProtectedRoute role="admin">
              <ProductForm />
            </ProtectedRoute>
          } />
          <Route path="/products/create" element={
            <ProtectedRoute role="admin">
              <ProductForm />
            </ProtectedRoute>
          } />

          {/* Checkout Routes */}
          <Route path="/checkout" element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          } />
          <Route path="/checkout/payment/:orderId" element={
            <ProtectedRoute>
              <PaymentPage />
            </ProtectedRoute>
          } />
          <Route path="/checkout/confirmation/:orderId" element={
            <ProtectedRoute>
              <OrderConfirmation />
            </ProtectedRoute>
          } />

          {/* Order Routes */}
          <Route path="/orders" element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          } />
          <Route path="/orders/:orderId" element={
            <ProtectedRoute>
              <OrderDetailPage />
            </ProtectedRoute>
          } />

          {/* Store Locator */}
          <Route path="/stores" element={<StoreLocator />} />

          {/* About Us */}
          <Route path="/about" element={<AboutPage />} />

          {/* User Profile */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />

          {/* 404 Catch-all */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Admin Routes - No Main Layout */}
        <Route path="/admin" element={
          <ProtectedRoute role="admin">
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<ProductManager />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/:id/edit" element={<ProductForm />} />
          <Route path="orders" element={<OrderManager />} />
          <Route path="users" element={<UserManager />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="settings/:id/edit" element={<AdminSettings />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>
      </Routes>
    </ThemeProvider>
  );
};

export default App;

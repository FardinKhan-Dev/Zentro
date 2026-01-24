import React, { Suspense, lazy } from 'react';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/layout';
import ScrollToTop from './components/common/ScrollToTop';
import RouteScrollToTop from './components/common/RouteScrollToTop';
import Loader from './components/common/Loader';

// Eagerly loaded components (Critical Path)
import Home from './pages/Home';
import AuthDrawer from './components/auth/AuthDrawer';
import AuthRedirect from './components/auth/AuthRedirect';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicRoute from './components/auth/PublicRoute';
import { useGetMeQuery } from './features/auth/authApi';
import { Toaster, toast } from 'react-hot-toast';

// Lazy Loaded Components (Code Split)
// Auth
const VerifyEmail = lazy(() => import('./components/auth/VerifyEmail'));
const RequestReset = lazy(() => import('./components/auth/RequestReset'));
const ResetPassword = lazy(() => import('./components/auth/ResetPassword'));
const ChangePassword = lazy(() => import('./components/auth/ChangePassword'));

// Products
const ProductList = lazy(() => import('./components/products/ProductList'));
const ProductDetail = lazy(() => import('./components/products/ProductDetail'));

// Admin (Heavy Bundle)
const ProductForm = lazy(() => import('./components/admin/ProductForm'));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const Dashboard = lazy(() => import('./components/admin/Dashboard'));
const ProductManager = lazy(() => import('./components/admin/ProductManager'));
const OrderManager = lazy(() => import('./components/admin/OrderManager'));
const UserManager = lazy(() => import('./components/admin/UserManager'));
const Analytics = lazy(() => import('./components/admin/Analytics'));
const AdminSettings = lazy(() => import('./components/admin/AdminSettings'));
const AdminProfile = lazy(() => import('./components/admin/AdminProfile'));

// Checkout (Stripe Dependency)
const CheckoutPage = lazy(() => import('./components/checkout/CheckoutPage'));
const OrderConfirmation = lazy(() => import('./components/checkout/OrderConfirmation'));
const PaymentPage = lazy(() => import('./components/checkout/PaymentPage'));

// Orders
const OrdersPage = lazy(() => import('./components/orders/OrdersPage'));
const OrderDetailPage = lazy(() => import('./components/orders/OrderDetailPage'));

// Heavy Features
const StoreLocator = lazy(() => import('./components/map/StoreLocator')); // Leaflet
const LandingPage = lazy(() => import('./pages/LandingPage')); // Framer Motion
const AboutPage = lazy(() => import('./pages/AboutPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

const App = () => {
  // Non-blocking auth check - query runs in background
  useGetMeQuery();

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



  return (
    <ThemeProvider>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <RouteScrollToTop />
      <ScrollToTop />
      <AuthDrawer />
      <Suspense fallback={<Loader fullScreen text="Loading Zentro..." />}>
        <Routes>
          {/* Main Layout Routes */}
          <Route element={<Layout><Outlet /></Layout>}>
            <Route path="/" element={<Home />} />

            {/* Auth Routes - Open AuthDrawer */}
            <Route path="/register" element={<AuthRedirect view="register" />} />
            <Route path="/login" element={<AuthRedirect view="login" />} />
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

            {/* Scrollytelling Experience */}
            <Route path="/experience" element={<LandingPage />} />

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
      </Suspense>
    </ThemeProvider>
  );
};

export default App;

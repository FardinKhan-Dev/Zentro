import express from 'express';
import passport from 'passport';
import {
  register,
  verifyEmail,
  login,
  logout,
  refreshAccessToken,
  requestPasswordReset,
  resetPassword,
  changePassword,
  googleAuthRedirect,
} from '../controllers/authController.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply rate limiting to all auth routes (5 attempts per 15 minutes)
router.use(authLimiter);

router.post('/register', register);
router.post('/verify-email', verifyEmail);
router.post('/login', login);
router.post('/logout', protect, logout);

// Change password (protected)
router.post('/change-password', protect, changePassword);

// Token refresh (no auth required)
router.post('/refresh', refreshAccessToken);

// Password reset
router.post('/forgot-password', requestPasswordReset);
router.post('/reset-password', resetPassword);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login', session: true }), googleAuthRedirect);

export default router;

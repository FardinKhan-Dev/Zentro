import express from 'express';
import passport from 'passport';
import {
  register,
  verifyEmail,
  login,
  verifyLoginOTP,
  logout,
  refreshAccessToken,
  requestPasswordReset,
  resetPassword,
  changePassword,
  googleAuthRedirect,
} from '../controllers/authController.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  requestResetSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from '../validations/authValidation.js';

const router = express.Router();

// Apply rate limiting to all auth routes
router.use(authLimiter);

router.post('/register', validateRequest(registerSchema), register);
router.get('/verify-email/:token', validateRequest(verifyEmailSchema), verifyEmail);
router.post('/login', validateRequest(loginSchema), login);
router.post('/verify-otp', verifyLoginOTP);
router.post('/logout', protect, logout);

// Change password (protected)
router.post('/change-password', protect, validateRequest(changePasswordSchema), changePassword);

// Token refresh (no auth required)
router.get('/refresh', refreshAccessToken);

// Password reset
router.post('/request-reset', validateRequest(requestResetSchema), requestPasswordReset);
router.post('/reset-password', validateRequest(resetPasswordSchema), resetPassword);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login', session: true }), googleAuthRedirect);

export default router;

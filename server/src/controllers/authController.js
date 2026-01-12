import User from '../models/User.js';
import crypto from 'crypto';
import { AppError, catchAsync } from '../utils/errorHandler.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  sendTokensWithCookies,
  clearAuthCookies,
  generateToken,
  hashToken,
} from '../utils/tokenService.js';
import {
  addVerificationEmailJob,
  addPasswordResetEmailJob,
  addWelcomeEmailJob,
} from '../services/queueService.js';
import { getRedisClient } from '../config/redis.js';
import { customResponse } from '../utils/response.js';
import { triggerN8nWebhook } from '../utils/n8n.js';
import { sendAdminNotification } from '../services/notificationService.js';
import PlatformSettings from '../models/PlatformSettings.js';
import { sendEmail } from '../services/emailService.js';
import dotenv from 'dotenv'

dotenv.config({ path: './.env' })

export const register = catchAsync(async (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!email || !password || !name) {
    throw new AppError('Name, email and password are required', 400);
  }

  if (password !== confirmPassword) {
    throw new AppError('Passwords do not match', 400);
  }

  const existing = await User.findOne({ email });
  if (existing) throw new AppError('Email already in use', 400);

  const user = await User.create({ name, email, password, isVerified: false });

  // Generate email verification token
  const verificationToken = user.generateEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  //SIGNUP TRACKING 
  const redis = getRedisClient();
  const today = new Date().toISOString().split('T')[0];
  if (redis) redis.hIncrBy(`analytics:users:signups:${today}`, 'count', 1).catch();

  // In test mode auto-verify the user to simplify login tests
  // if (process.env.NODE_ENV === 'test') {
  //   user.isVerified = true;
  //   user.emailVerificationToken = null;
  //   user.emailVerificationTokenExpire = null;
  //   await user.save({ validateBeforeSave: false });
  // }

  // Queue verification email (async - doesn't block registration)
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
  try {
    await addVerificationEmailJob(email, verificationUrl);
  } catch (err) {
    console.warn('Failed to queue verification email:', err.message);
    // Don't fail registration if queue fails
  }

  // Don't set cookies yet - user must verify email first

  // TRIGGER N8N WEBHOOK
  triggerN8nWebhook('user-registered', {
    id: user._id,
    name: user.name,
    email: user.email,
    date: new Date().toISOString()
  });

  // Send Admin Notification (Async)
  sendAdminNotification(
    'newSignup',
    'New User Registered 👤',
    `User ${user.name} (${user.email}) has joined.`,
    'info',
    user._id
  ).catch(err => console.error('Admin notif error:', err));

  return customResponse(res, {
    status: 201,
    success: true,
    message: 'Account created! Please check your email to verify your account.',
    data: { id: user._id, email: user.email, name: user.name },
  });
});

export const verifyEmail = catchAsync(async (req, res, next) => {
  const { token } = req.params;

  if (!token) throw new AppError('Verification token required', 400);

  const hashedToken = hashToken(token);
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationTokenExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError('Token is invalid or has expired.', 400);
  }

  user.isVerified = true
  user.emailVerificationToken = null
  user.emailVerificationTokenExpire = null
  await user.save({ validateBeforeSave: false })

  const redis = getRedisClient();
  const today = new Date().toISOString().split('T')[0];
  if (redis) redis.hIncrBy(`analytics:users:signups:${today}`, 'count', 1).catch();

  // Queue welcome email (async)
  try {
    await addWelcomeEmailJob(user.email, user.name);
  } catch (err) {
    console.warn('Failed to queue welcome email:', err.message);
  }

  // Set tokens after verification
  sendTokensWithCookies(res, user);

  return customResponse(res, {
    status: 200,
    success: true,
    message: 'Email verified successfully!',
    data: { id: user._id, email: user.email, name: user.name },
  });
});



export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Please provide email and password', 400);
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    throw new AppError('Incorrect email or password', 401);
  }

  if (!user.isVerified) {
    throw new AppError('Please verify your email before logging in', 403);
  }

  // Check Global 2FA Settings for Admins
  if (user.role === 'admin') {
    const settings = await PlatformSettings.getSettings();
    if (settings.security?.twoFactorAuth) {
      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

      user.loginOTP = hashedOTP;
      user.loginOTPExpire = Date.now() + 10 * 60 * 1000; // 10 mins
      await user.save({ validateBeforeSave: false });

      // Send OTP Email
      try {
        await sendEmail({
          email: user.email,
          subject: 'Your Zentro Admin Login Code',
          message: `Your login verification code is: ${otp}\nIt expires in 10 minutes.`,
        });
      } catch (err) {
        user.loginOTP = undefined;
        user.loginOTPExpire = undefined;
        await user.save({ validateBeforeSave: false });
        throw new AppError('There was an error sending the email. Try again later!', 500);
      }

      return customResponse(res, {
        status: 200,
        success: true,
        message: '2FA Code sent to email',
        data: { require2fa: true, email: user.email }
      });
    }
  }

  const redis = getRedisClient();
  const today = new Date().toISOString().split('T')[0];
  if (redis) redis.hIncrBy(`analytics:users:logins:${today}`, 'count', 1).catch();

  const { rememberMe } = req.body;
  sendTokensWithCookies(res, user, rememberMe);
  return customResponse(res, {
    status: 200,
    success: true,
    data: { id: user._id, email: user.email, name: user.name, role: user.role },
  });
});

export const verifyLoginOTP = catchAsync(async (req, res, next) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new AppError('Email and OTP are required', 400);
  }

  const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

  const user = await User.findOne({
    email,
    loginOTP: hashedOTP,
    loginOTPExpire: { $gt: Date.now() }
  });

  if (!user) {
    throw new AppError('Invalid or expired OTP', 400);
  }

  // Clear OTP
  user.loginOTP = undefined;
  user.loginOTPExpire = undefined;
  await user.save({ validateBeforeSave: false });

  // Update Analytics
  const redis = getRedisClient();
  const today = new Date().toISOString().split('T')[0];
  if (redis) redis.hIncrBy(`analytics:users:logins:${today}`, 'count', 1).catch();

  // Issue Tokens
  sendTokensWithCookies(res, user);
  return customResponse(res, {
    status: 200,
    success: true,
    message: 'Login successful',
    data: { id: user._id, email: user.email, name: user.name, role: user.role }
  });
});

export const logout = catchAsync(async (req, res, next) => {
  clearAuthCookies(res);

  // Also invalidate refresh tokens by incrementing version
  if (req.user) {
    const user = await User.findById(req.user.id);
    if (user) {
      user.invalidateTokens();
      await user.save();
    }
  }

  // Destroy session if present
  if (req.session) {
    req.session.destroy((err) => {
      if (err) console.warn('Session destroy error:', err);
    });
  }

  return customResponse(res, { status: 200, success: true, message: 'Logged out successfully' });
});

export const refreshAccessToken = catchAsync(async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    throw new AppError('Refresh token required', 401);
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id);

    if (!user) throw new AppError('User not found', 404);

    // Check if token version matches (to invalidate old tokens on logout)
    if (decoded.tokenVersion !== user.refreshTokenVersion) {
      throw new AppError('Refresh token has been invalidated', 401);
    }

    // Issue new access token
    const newAccessToken = signAccessToken(user._id, user.role);
    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return customResponse(res, { status: 200, success: true, message: 'Token refreshed' });
  } catch (err) {
    clearAuthCookies(res);
    throw new AppError('Invalid refresh token', 401);
  }
});

export const requestPasswordReset = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) throw new AppError('Email required', 400);

  const user = await User.findOne({ email });
  if (!user) {
    // Don't reveal if user exists (security best practice)
    return customResponse(res, {
      status: 200,
      success: true,
      message: 'If an account exists, a password reset link has been sent',
    });
  }

  // Generate reset token
  const resetToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // Queue password reset email (async)
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
  try {
    await addPasswordResetEmailJob(email, resetUrl);
  } catch (err) {
    // Clear tokens if email queue fails
    user.passwordResetToken = null;
    user.passwordResetTokenExpire = null;
    await user.save({ validateBeforeSave: false });
    throw new AppError('Failed to queue password reset email', 500);
  }

  return customResponse(res, { status: 200, success: true, message: 'Password reset link sent to email' });
});

export const resetPassword = catchAsync(async (req, res, next) => {
  const { token, password, confirmPassword } = req.body;

  if (!token || !password || !confirmPassword) {
    throw new AppError('Token and new password required', 400);
  }

  if (password !== confirmPassword) {
    throw new AppError('Passwords do not match', 400);
  }

  const hashedToken = hashToken(token);
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpire: { $gt: Date.now() },
  });

  if (!user) throw new AppError('Invalid or expired reset token', 400);

  user.password = password;
  user.passwordResetToken = null;
  user.passwordResetTokenExpire = null;
  user.invalidateTokens(); // Invalidate all old refresh tokens
  await user.save();

  // Set new tokens
  sendTokensWithCookies(res, user);

  return customResponse(res, {
    status: 200,
    success: true,
    message: 'Password reset successfully',
    data: { id: user._id, email: user.email, name: user.name },
  });
});

export const changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    throw new AppError('Current and new passwords are required', 400);
  }

  if (newPassword !== confirmPassword) {
    throw new AppError('New passwords do not match', 400);
  }

  const user = await User.findById(req.user.id).select('+password');
  if (!user) throw new AppError('User not found', 404);

  const valid = await user.correctPassword(currentPassword, user.password);
  if (!valid) throw new AppError('Current password is incorrect', 401);

  user.password = newPassword;
  user.invalidateTokens();
  await user.save();

  // Issue fresh tokens
  sendTokensWithCookies(res, user);

  return customResponse(res, {
    status: 200,
    success: true,
    message: 'Password changed successfully',
    data: { id: user._id, email: user.email, name: user.name },
  });
});

export const googleAuthRedirect = catchAsync(async (req, res, next) => {
  const user = req.user;
  if (!user) return next(new AppError('Authentication failed', 401));

  sendTokensWithCookies(res, user);

  // Redirect to client with success param
  const redirectUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  res.redirect(302, `${redirectUrl}?auth=success`);
});

export default {
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
};


import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'

dotenv.config({ path: './.env' })

// Generate and verify tokens (verification & password reset)
export const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

export const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

// JWT refresh token (longer expiry)
export const signRefreshToken = (userId, tokenVersion) => {
  return jwt.sign(
    { id: userId, tokenVersion },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
};

// JWT access token (shorter expiry)
export const signAccessToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
  );
};

// Verify refresh token and check version
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

// Send both access and refresh tokens
export const sendTokensWithCookies = (res, user, rememberMe = false) => {
  const accessToken = signAccessToken(user._id, user.role);
  const refreshToken = signRefreshToken(user._id, user.refreshTokenVersion);

  // If rememberMe is true, use long expiry. If false, use session cookie (no maxAge) or short expiry.
  // Here we'll use session cookies (no maxAge) for non-rememberMe, so they clear on browser close.

  const refreshAccessTokenMaxAge = rememberMe ? 7 * 24 * 60 * 60 * 1000 : undefined; // 7 days or session
  const refreshRefreshTokenMaxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : undefined; // 30 days or session

  // Set access token in httpOnly cookie (short-lived)
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    maxAge: refreshAccessTokenMaxAge,
    path: '/',
  });
  // Set refresh token in httpOnly cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    maxAge: refreshRefreshTokenMaxAge,
    path: '/',
  });

  return { accessToken, refreshToken };
};

export const clearAuthCookies = (res) => {
  res.cookie('accessToken', '', { httpOnly: true, maxAge: 0, path: '/' });
  res.cookie('refreshToken', '', { httpOnly: true, maxAge: 0, path: '/' });
};

export default {
  generateToken,
  hashToken,
  signRefreshToken,
  signAccessToken,
  verifyRefreshToken,
  sendTokensWithCookies,
  clearAuthCookies,
};

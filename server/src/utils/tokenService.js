import crypto from 'crypto';
import jwt from 'jsonwebtoken';

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
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' }
  );
};

// JWT access token (shorter expiry)
export const signAccessToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Verify refresh token and check version
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

// Send both access and refresh tokens
export const sendTokensWithCookies = (res, user) => {
  const accessToken = signAccessToken(user._id, user.role);
  const refreshToken = signRefreshToken(user._id, user.refreshTokenVersion);

  // Set access token in httpOnly cookie (short-lived)
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });

  // Set refresh token in httpOnly cookie (long-lived)
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
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

import jwt from 'jsonwebtoken';
import { AppError } from '../utils/errorHandler.js';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check for token in cookies (accessToken)
    if (!token && req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw new AppError('You are not logged in. Please log in first', 401);
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verify user still exists and token version matches
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    req.user = decoded;
    req.userDoc = user; // Attach full user document for convenience
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError('Invalid token', 401);
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError('Token expired. Please log in again', 401);
    }
    throw error;
  }
};

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new AppError('You do not have permission to perform this action', 403);
    }
    next();
  };
};

export const optional = (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token && req.cookies?.jwt) {
      token = req.cookies.jwt;
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    }
  } catch (error) {
    // Silently fail for optional auth
    req.user = null;
  }

  next();
};

// Alias for clarity in cart routes
export const optionalAuth = optional;

export default { protect, restrictTo, optional, optionalAuth };

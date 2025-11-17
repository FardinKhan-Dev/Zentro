import rateLimit from 'express-rate-limit';
import { getRedisClient } from '../config/redis.js';
import { AppError } from '../utils/errorHandler.js';

export const createRedisLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    maxRequests = 100,
    message = 'Too many requests from this IP, please try again later',
  } = options;

  return rateLimit({
    windowMs,
    max: maxRequests,
    message,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      throw new AppError(message, 429);
    },
    skip: (req) => {
      // Skip rate limiting in test environment
      return process.env.NODE_ENV === 'test';
    },
  });
};

// Specific limiters for different endpoints
export const authLimiter = createRedisLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 5, // 5 attempts per 15 minutes
  message: 'Too many login attempts, please try again later',
});

export const apiLimiter = createRedisLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 100,
  message: 'Too many requests from this IP',
});

export const uploadLimiter = createRedisLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 50,
  message: 'Too many uploads, try again later',
});

export default createRedisLimiter;

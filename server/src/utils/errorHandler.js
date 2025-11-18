export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const catchAsync = (fn) => (req, res, next) => {
  fn(req, res, next).catch(next);
};

export const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  // Log full error for non-production environments (helpful for tests)
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.error('Unhandled Error:', err);
  }

  // Wrong MongoDB ID Error
  if (err.name === 'CastError') {
    const message = `Resource not found: ${err.value}`;
    err = new AppError(message, 400);
  }

  // JWT Error
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    err = new AppError(message, 401);
  }

  // JWT Expire Error
  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    err = new AppError(message, 401);
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    const message = `${field} already exists`;
    err = new AppError(message, 400);
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
    err = new AppError(messages, 400);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

export const notFoundHandler = (req, res, next) => {
  const message = `Route ${req.originalUrl} not found`;
  const err = new AppError(message, 404);
  next(err);
};

export default AppError;

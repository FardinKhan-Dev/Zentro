import pinoHttp from 'pino-http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import mongoSanitize from 'express-mongo-sanitize';
import cookieParser from 'cookie-parser';
import sanitizeHtml from 'sanitize-html';
import { createServer } from 'http';
import { initializeSocketIO } from './src/websocket/socket.js';
import dotenv from 'dotenv';
import session from 'express-session';
import { RedisStore } from 'connect-redis';
import passport from 'passport';
import connectDB from './src/config/db.js';
import { initializeRedis, getRedisClient } from './src/config/redis.js';
import { initializeCloudinary } from './src/config/cloudinary.js';
import { initializeStripe } from './src/config/stripe.js';
import { initializeEmailService } from './src/services/emailService.js';
import {
  globalErrorHandler,
  notFoundHandler,
  catchAsync,
} from './src/utils/errorHandler.js';
import { apiLimiter } from './src/middleware/rateLimiter.js';
import authRoutes from './src/routes/authRoutes.js';
import productRoutes from './src/routes/productRoutes.js';
import cartRoutes from './src/routes/cartRoutes.js';
import orderRoutes from './src/routes/orderRoutes.js';
import paymentRoutes from './src/routes/paymentRoutes.js';
import aiRoutes from './src/routes/aiRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import settingsRoutes from './src/routes/settingsRoutes.js';
import notificationRoutes from './src/routes/notificationRoutes.js';
import reviewRoutes from './src/routes/reviewRoutes.js';
import healthRoutes from './src/routes/healthRoutes.js';
import './src/config/passport.js';
import logger from './src/utils/logger.js';

dotenv.config({ path: './.env' });

const app = express();
const httpServer = createServer(app);

// If running behind a proxy (e.g. nginx), trust first proxy so secure cookies work
app.set('trust proxy', 1);

let io;
let redisClient;
let subClient;

if (process.env.NODE_ENV !== 'test') {
  // Initialize external services
  await connectDB();

  // TEMPORARILY DISABLED: Redis initialization commented out due to Upstash limits
  // Uncomment when limits reset or upgraded to paid tier
  // redisClient = await initializeRedis();
  redisClient = null; // Force null for now
  console.log('⚠️  Redis temporarily disabled - app running without cache');

  initializeCloudinary();
  initializeStripe();
  initializeEmailService();

  // Setup session store (Redis-backed if available, memory fallback)
  if (redisClient) {
    const sessionStore = new RedisStore({ client: redisClient });
    app.use(
      session({
        store: sessionStore,
        name: process.env.SESSION_NAME || 'sid',
        secret: process.env.SESSION_SECRET || 'dev_session_secret',
        resave: false,
        saveUninitialized: true,
        cookie: {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
          maxAge: parseInt(process.env.SESSION_MAX_AGE || String(24 * 60 * 60 * 1000), 10),
        },
      })
    );
    logger.info('✓ Session store configured with Redis');
  } else {
    // Fallback to memory store (not suitable for production with multiple instances)
    logger.warn('⚠️  Session store using memory (not suitable for multi-instance production)');
    app.use(
      session({
        name: process.env.SESSION_NAME || 'sid',
        secret: process.env.SESSION_SECRET || 'dev_session_secret',
        resave: false,
        saveUninitialized: true,
        cookie: {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
          maxAge: parseInt(process.env.SESSION_MAX_AGE || String(24 * 60 * 60 * 1000), 10),
        },
      })
    );
  }

  // Initialize passport (for Google OAuth sessions)
  app.use(passport.initialize());
  app.use(passport.session());

  // Socket.IO initialized via centralized module (async)
  io = await initializeSocketIO(httpServer);
} else {
  logger.info('Test mode: skipping external services, sessions, and Socket.IO initialization');
}

// Middleware
app.use(helmet());
// Add Cross-Origin policies for security (Best Practices)
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(helmet.crossOriginOpenerPolicy({ policy: "same-origin-allow-popups" }));

// Request logging with Pino
app.use(pinoHttp({
  logger,
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      host: req.headers.host,
      remoteAddress: req.remoteAddress,
      remotePort: req.remotePort,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },
}));

// Content Security Policy: restrict resources to trusted origins
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", process.env.CLIENT_URL || 'http://localhost:5173'],
      connectSrc: [
        "'self'",
        process.env.CLIENT_URL || 'http://localhost:5173',
        process.env.API_URL || 'http://localhost:5000',
        "https://zentro-cyan.vercel.app",
        "https://zentro-e8ga.onrender.com"
      ],
      imgSrc: [
        "'self'",
        'data:',
        "https://res.cloudinary.com",
        "https://images.unsplash.com",
        "https://i.pinimg.com",
        (process.env.CLOUDINARY_CLOUD_NAME ? `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}` : "'self'")
      ],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", 'data:', "https://fonts.gstatic.com"],
    },
  })
);

// Regular JSON body parser for all other routes
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ limit: '10kb', extended: true }));
app.use(cookieParser());
app.use(apiLimiter);

// Sanitize incoming string fields to mitigate XSS (replaces deprecated xss-clean)
const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (typeof val === 'string') {
      obj[key] = sanitizeHtml(val, {
        allowedTags: [],
        allowedAttributes: {},
      }).trim();
    } else if (typeof val === 'object') {
      sanitizeObject(val);
    }
  }
  return obj;
};

app.use((req, res, next) => {
  try {
    // Only sanitize request body (req.query/req.params may be getter-backed in some Express versions)
    if (req.body && typeof req.body === 'object') sanitizeObject(req.body);
  } catch (err) {
    // If sanitization fails, continue — global error handler will catch if needed
    logger.error('Sanitization error:', err);
  }
  next();
});
// Prevent HTTP Parameter Pollution
app.use(hpp());
// Prevent NoSQL injection by sanitizing data
// Skip express-mongo-sanitize in test mode because it mutates req.query/req.params in ways
// that may be incompatible with some test request objects (supertest/express versions)
if (process.env.NODE_ENV !== 'test') {
  try {
    app.use((req, res, next) => {
      const body = mongoSanitize.sanitize(req.body);
      const params = mongoSanitize.sanitize(req.params);
      req.body = body;
      req.params = params;
      next();
    });
  } catch (error) {
    logger.error('MongoSanitize error:', error);
  }
} else {
  logger.info('Test mode: skipping express-mongo-sanitize middleware');
}
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:5173',
    'https://zentro-cyan.vercel.app',
    'https://zentro-e8ga.onrender.com'
  ],
  credentials: true,
}));

// IMPORTANT: Stripe webhook needs raw body BEFORE express.json()
// This must come before the JSON body parser
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }),
  (req, res, next) => {
    // Import the webhook handler dynamically to avoid circular dependencies
    import('./src/controllers/paymentController.js')
      .then(module => module.handleWebhook(req, res))
      .catch(err => {
        logger.error('Webhook handler error:', err);
        res.status(500).send('Internal server error');
      });
  }
);



// Health check endpoint
app.get('/health', (req, res) => {
  try {
    const response = {
      status: 'success',
      message: 'API Service is running',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
    logger.info({ response }, 'Health check response');
    res.json(response);
  } catch (error) {
    logger.error('Health check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API Routes (placeholder)
app.get('/api', (req, res) => {
  res.json({ message: 'Zentro API Server', version: '1.0.0' });
});

// Auth routes
app.use('/api/auth', authRoutes);
// Product routes
app.use('/api/products', productRoutes);
// Cart routes
app.use('/api/cart', cartRoutes);
// Order routes
app.use('/api/orders', orderRoutes);
// Payment routes (excluding webhook which is handled above)
app.use('/api/payments', paymentRoutes);
// AI routes
app.use('/api/ai', aiRoutes);
// Admin routes
// Admin routes
app.use('/api/admin', adminRoutes);
// User routes
app.use('/api/users', userRoutes);
// Notification routes
app.use('/api/notifications', notificationRoutes);
// Settings routes
app.use('/api/settings', settingsRoutes);
// Review routes
app.use('/api/reviews', reviewRoutes);
// Health check routes
app.use('/api/health', healthRoutes);

// Socket.IO connection handling (only if initialized)


// Error handling
app.use(notFoundHandler);
app.use(globalErrorHandler);

// Start server only when not testing
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;
  httpServer.listen(PORT, () => {
    logger.info(`✓ API Server running on port ${PORT}`);
  });

  // Schedule Stock Release Job (Run every minute)
  // Releases stock for pending card orders older than 5 minutes
  // Solves the "lost sale" problem by making stock available to other users quickly
  import('./src/services/inventoryService.js').then(({ releaseExpiredReservations }) => {
    logger.info('✓ Stock Release Job scheduled (5 min timeout, checks every 60s)');
    setInterval(async () => {
      try {
        const result = await releaseExpiredReservations(5); // 5 minutes timeout
        if (result.releasedCount > 0) {
          logger.info(`♻ Released stock for ${result.releasedCount} expired pending orders`);
        }
      } catch (error) {
        logger.error('Stock Release Job failed:', error);
      }
    }, 60 * 1000); // Check every minute
  });

  // Schedule Courier Sync Job (Run every 5 minutes)
  // Automatically updates status/payment for shipped orders based on courier data
  import('./src/services/cronService.js').then(({ startCourierSyncJob }) => {
    startCourierSyncJob();
  });
}

// Graceful shutdown
const gracefulShutdown = async () => {
  logger.info('\n✓ Shutting down gracefully...');
  httpServer.close(async () => {
    try {
      if (redisClient) await redisClient.quit();
      if (subClient) await subClient.quit();
      logger.info('✓ All connections closed');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown:', error);
      process.exit(1);
    }
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

export { app, io, httpServer };

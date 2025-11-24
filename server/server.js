import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import mongoSanitize from 'express-mongo-sanitize';
import cookieParser from 'cookie-parser';
import sanitizeHtml from 'sanitize-html';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import 'dotenv/config';

import session from 'express-session';
import * as connectRedis from 'connect-redis';
import passport from 'passport';

import connectDB from './src/config/db.js';
import { initializeRedis, getRedisClient } from './src/config/redis.js';
import { initializeCloudinary } from './src/config/cloudinary.js';
import { initializeStripe } from './src/config/stripe.js';
import { initializeEmailService } from './src/utils/emailService.js';
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
import './src/config/passport.js';

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
  redisClient = await initializeRedis();
  initializeCloudinary();
  initializeStripe();
  initializeEmailService();
  // Setup session store (Redis)
  const RedisStoreFactory = (connectRedis && connectRedis.default) ? connectRedis.default : connectRedis;
  const RedisStore = RedisStoreFactory(session);
  const sessionStore = new RedisStore({ client: redisClient });

  app.use(
    session({
      store: sessionStore,
      name: process.env.SESSION_NAME || 'sid',
      secret: process.env.SESSION_SECRET || 'dev_session_secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
        maxAge: parseInt(process.env.SESSION_MAX_AGE || String(24 * 60 * 60 * 1000), 10),
      },
    })
  );

  // Initialize passport (for Google OAuth sessions)
  app.use(passport.initialize());
  app.use(passport.session());

  // Socket.IO with Redis Adapter
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      credentials: true,
    },
  });

  const pubClient = redisClient;
  subClient = redisClient.duplicate();
  await subClient.connect();

  io.adapter(createAdapter(pubClient, subClient));
} else {
  console.log('Test mode: skipping external services, sessions, and Socket.IO initialization');
}

// Middleware
app.use(helmet());
// Content Security Policy: restrict resources to trusted origins
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", process.env.CLIENT_URL || 'http://localhost:3000'],
      connectSrc: [
        "'self'",
        process.env.CLIENT_URL || 'http://localhost:3000',
        process.env.API_URL || 'http://localhost:5000',
      ],
      imgSrc: ["'self'", 'data:', (process.env.CLOUDINARY_CLOUD_NAME ? `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}` : "'self'")],
      styleSrc: ["'self'", "'unsafe-inline'"],
      fontSrc: ["'self'", 'data:'],
    },
  })
);
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
    console.error('Sanitization error:', err);
  }
  next();
});
// Prevent HTTP Parameter Pollution
app.use(hpp());
// Prevent NoSQL injection by sanitizing data
// Skip express-mongo-sanitize in test mode because it mutates req.query/req.params in ways
// that may be incompatible with some test request objects (supertest/express versions)
if (process.env.NODE_ENV !== 'test') {
  app.use(mongoSanitize());
} else {
  console.log('Test mode: skipping express-mongo-sanitize middleware');
}
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
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
        console.error('Webhook handler error:', err);
        res.status(500).send('Internal server error');
      });
  }
);

// Regular JSON body parser for all other routes
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ limit: '10kb', extended: true }));
app.use(cookieParser());
app.use(apiLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'API Service is running' });
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

// Socket.IO connection handling (only if initialized)
if (io) {
  io.on('connection', (socket) => {
    console.log(`✓ Client connected: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`✗ Client disconnected: ${socket.id}`);
    });
  });
}

// Error handling
app.use(notFoundHandler);
app.use(globalErrorHandler);

// Start server only when not testing
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;
  httpServer.listen(PORT, () => {
    console.log(`✓ API Server running on port ${PORT}`);
  });
}

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('\n✓ Shutting down gracefully...');
  httpServer.close(async () => {
    try {
      if (redisClient) await redisClient.quit();
      if (subClient) await subClient.quit();
      console.log('✓ All connections closed');
      process.exit(0);
    } catch (error) {
      console.error('Error during shutdown:', error);
      process.exit(1);
    }
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

export { app, io, httpServer };

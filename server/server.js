import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import mongoSanitize from 'express-mongo-sanitize';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import 'dotenv/config';

import connectDB from './src/config/db.js';
import { initializeRedis, getRedisClient } from './src/config/redis.js';
import { initializeCloudinary } from './src/config/cloudinary.js';
import { initializeStripe } from './src/config/stripe.js';
import {
  globalErrorHandler,
  notFoundHandler,
  catchAsync,
} from './src/utils/errorHandler.js';
import { apiLimiter } from './src/middleware/rateLimiter.js';

const app = express();
const httpServer = createServer(app);

// If running behind a proxy (e.g. nginx), trust first proxy so secure cookies work
app.set('trust proxy', 1);

// Initialize external services
await connectDB();
const redisClient = await initializeRedis();
initializeCloudinary();
initializeStripe();

// Socket.IO with Redis Adapter
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  },
});

const pubClient = redisClient;
const subClient = redisClient.duplicate();
await subClient.connect();

io.adapter(createAdapter(pubClient, subClient));

// Middleware
app.use(helmet());
// Prevent HTTP Parameter Pollution
app.use(hpp());
// Prevent NoSQL injection by sanitizing data
app.use(mongoSanitize());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
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

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`✓ Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`✗ Client disconnected: ${socket.id}`);
  });
});

// Error handling
app.use(notFoundHandler);
app.use(globalErrorHandler);

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`✓ API Server running on port ${PORT}`);
});

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('\n✓ Shutting down gracefully...');
  httpServer.close(async () => {
    try {
      await redisClient.quit();
      await subClient.quit();
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

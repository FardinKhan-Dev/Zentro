import { Server as SocketIOServer } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { getRedisClient, isRedisAvailable } from '../config/redis.js';
import registerInventoryHandlers from './events/inventoryHandlers.js';
import dotenv from 'dotenv'

dotenv.config({ path: './.env' })

let io;

export const initializeSocketIO = async (httpServer) => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  // Try to use Redis adapter for multi-instance support
  const redisClient = getRedisClient();

  if (redisClient && isRedisAvailable()) {
    try {
      console.log('🔄 Setting up Socket.IO with Redis adapter (multi-instance mode)...');

      const pubClient = redisClient;
      const subClient = redisClient.duplicate();

      // Connect the duplicated client
      await subClient.connect();

      io.adapter(createAdapter(pubClient, subClient));
      console.log('✅ Socket.IO configured with Redis adapter');
    } catch (err) {
      console.warn('⚠️  Failed to setup Redis adapter:', err.message);
      console.warn('⚠️  Socket.IO running in single-instance mode (no Redis)');
    }
  } else {
    console.warn('⚠️  Redis unavailable - Socket.IO running in single-instance mode');
    console.warn('⚠️  Real-time features will work, but only within this server instance');
  }

  io.on('connection', (socket) => {
    console.log(`✓ Client connected: ${socket.id}`);

    // Join user-specific room for private notifications
    socket.on('join:user', (userId) => {
      if (userId) {
        socket.join(`user:${userId}`);
        console.log(`👤 Socket ${socket.id} joined room: user:${userId}`);
      }
    });

    // Register event handlers
    registerInventoryHandlers(io, socket);

    socket.on('disconnect', () => {
      console.log(`✗ Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized!');
  }
  return io;
};

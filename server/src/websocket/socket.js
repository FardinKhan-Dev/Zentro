import { Server as SocketIOServer } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { getRedisClient } from '../config/redis.js';
import registerInventoryHandlers from './events/inventoryHandlers.js';
import dotenv from 'dotenv'

dotenv.config({ path: './.env' })

let io;

export const initializeSocketIO = (httpServer) => {
  const redisClient = getRedisClient();
  if (!redisClient) {
    console.error('Redis client not initialized. Socket.IO cannot start.');
    return null;
  }

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  const pubClient = redisClient;
  const subClient = redisClient.duplicate();

  // We must connect the duplicated client before using it.
  // The original redisClient is already connected from initializeRedis.
  subClient.connect().then(() => {
    io.adapter(createAdapter(pubClient, subClient));
  }).catch(err => {
    console.error('Failed to connect subClient to Redis:', err);
  });


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

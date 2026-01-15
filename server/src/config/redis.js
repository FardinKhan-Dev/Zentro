import { createClient } from 'redis';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });


let redisClient = null;

export const initializeRedis = async () => {
  if (redisClient) return redisClient;

  redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > 10) return new Error('Redis reconnect failed');
        return Math.min(retries * 100, 2000);
      },
    },
  });

  redisClient.on('error', (err) => console.error('Redis Error:', err));
  redisClient.on('connect', () => console.log('Redis connecting...'));
  redisClient.on('ready', () => console.log('Redis ready'));
  redisClient.on('end', () => console.log('Redis disconnected'));

  try {
    await redisClient.connect();
    console.log('✓ Redis connected successfully');
    return redisClient;
  } catch (err) {
    console.warn('⚠️  Redis connection failed:', err.message);
    console.warn('⚠️  App will continue WITHOUT Redis caching');
    redisClient = null;
    return null;
  }
};

export const getRedisClient = () => {
  if (!redisClient) {
    throw new Error('Redis client not initialized. Call initializeRedis first.');
  }
  return redisClient;
};

export const disconnectRedis = async () => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    console.log('Redis disconnected');
  }
};
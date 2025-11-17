import { createClient } from 'redis';

let redisClient = null;

export const initializeRedis = async () => {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || process.env.REDIS_DEV_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.error('Redis reconnection failed after 10 attempts');
            return new Error('Redis max retries exceeded');
          }
          return retries * 100;
        },
      },
    });

    redisClient.on('error', (err) => console.error('Redis Client Error:', err));
    redisClient.on('connect', () => console.log('✓ Redis connected'));
    redisClient.on('ready', () => console.log('✓ Redis ready'));

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.error(`✗ Redis connection error: ${error.message}`);
    process.exit(1);
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
    await redisClient.disconnect();
    console.log('✓ Redis disconnected');
  }
};

export default redisClient;

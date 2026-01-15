import { createClient } from 'redis';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

let redisClient = null;
let isRedisEnabled = false;
let reconnectAttempts = 0;
let healthCheckInterval = null;

/**
 * Initialize Redis connection with graceful failure handling
 * App will continue working without Redis if connection fails
 */
export const initializeRedis = async () => {
  // CRITICAL: Check for DISABLE_REDIS FIRST, before anything else
  if (process.env.DISABLE_REDIS === 'true' || process.env.DISABLE_REDIS === '1') {
    console.log('❌ Redis DISABLED via DISABLE_REDIS environment variable');
    console.log('   App will run without caching (slower but stable)');
    isRedisEnabled = false;
    redisClient = null;
    return null;
  }

  if (redisClient) return redisClient;

  // Check if REDIS_URL is provided
  if (!process.env.REDIS_URL) {
    console.warn('⚠️  No REDIS_URL found - running without Redis');
    isRedisEnabled = false;
    return null;
  }

  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.log('❌ Redis reconnection failed after 10 attempts');
            return new Error('Too many retries');
          }
          return Math.min(retries * 50, 500);
        },
      },
    });

    // Event handlers
    redisClient.on('error', (err) => {
      console.error('Redis Error:', err.message);

      // Detect Upstash limit exceeded or max requests
      if (err.message.includes('LIMIT_EXCEEDED') ||
        err.message.includes('capacity') ||
        err.message.includes('quota') ||
        err.message.includes('max requests limit exceeded') ||
        err.message.includes('max_requests_limit')) {
        console.warn('⚠️  Upstash limit/quota exceeded - switching to no-cache mode');
        console.warn('⚠️  App will continue without Redis caching');
        console.warn('⚠️  Limits reset monthly - auto-recovery will reconnect');

        // Disable Redis immediately to prevent further operations
        isRedisEnabled = false;

        // Force disconnect to prevent more errors
        setTimeout(() => {
          if (redisClient) {
            redisClient.quit().catch(() => {
              // Ignore quit errors, just set to null
            }).finally(() => {
              redisClient = null;
            });
          }
        }, 100);

        return; // Don't propagate error
      }

      // For other errors, just log and disable temporarily
      console.warn('⚠️  Redis error occurred, disabling temporarily');
      isRedisEnabled = false;
    });

    redisClient.on('connect', () => {
      console.log('🔄 Redis connecting...');
    });

    redisClient.on('ready', () => {
      console.log('✅ Redis ready and available');
      isRedisEnabled = true;
      reconnectAttempts = 0;
    });

    redisClient.on('end', () => {
      console.log('❌ Redis connection ended');
      isRedisEnabled = false;
    });

    redisClient.on('reconnecting', () => {
      console.log(`🔄 Redis reconnecting (attempt ${reconnectAttempts})...`);
    });

    // Attempt connection
    await redisClient.connect();
    console.log('✓ Redis connected successfully');
    isRedisEnabled = true;

    // Start health check for auto-recovery
    startHealthCheck();

    return redisClient;
  } catch (err) {
    console.warn('⚠️  Redis connection failed:', err.message);
    console.warn('⚠️  App will continue WITHOUT Redis caching');
    console.warn('⚠️  Will retry connection every 60 seconds...');

    redisClient = null;
    isRedisEnabled = false;

    // Start health check to retry connection
    startHealthCheck();

    return null;
  }
};

/**
 * Get Redis client (returns null if unavailable - NO EXCEPTIONS)
 * @returns {Object|null} Redis client or null
 */
export const getRedisClient = () => {
  if (!redisClient || !isRedisEnabled) {
    return null;
  }
  return redisClient;
};

/**
 * Check if Redis is currently available
 * @returns {boolean}
 */
export const isRedisAvailable = () => {
  return redisClient !== null && isRedisEnabled && redisClient.isReady;
};

/**
 * Periodic health check for auto-recovery
 * Attempts to reconnect every 60 seconds if Redis is down
 */
const startHealthCheck = () => {
  // Clear existing interval
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
  }

  healthCheckInterval = setInterval(async () => {
    // If Redis is down, try to reconnect
    if (!redisClient || !isRedisEnabled) {
      console.log('🔍 Health check: Redis unavailable, attempting reconnection...');

      try {
        // Clean up old client
        if (redisClient) {
          try {
            await redisClient.quit();
          } catch (err) {
            // Ignore cleanup errors
          }
          redisClient = null;
        }

        // Try to reconnect
        await initializeRedis();

        if (isRedisAvailable()) {
          console.log('✅ Health check: Redis reconnected successfully!');
        }
      } catch (err) {
        console.log('⚠️  Health check: Reconnection failed, will retry in 60s');
      }
    } else {
      // Ping to verify connection is still alive
      try {
        await redisClient.ping();
      } catch (err) {
        console.warn('⚠️  Health check: Redis ping failed');
        isRedisEnabled = false;
      }
    }
  }, 60000); // Check every 60 seconds
};

/**
 * Gracefully disconnect Redis
 */
export const disconnectRedis = async () => {
  // Clear health check
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
    healthCheckInterval = null;
  }

  if (redisClient) {
    try {
      await redisClient.quit();
      console.log('✓ Redis disconnected gracefully');
    } catch (err) {
      console.warn('Redis disconnect error:', err.message);
    }

    redisClient = null;
    isRedisEnabled = false;
  }
};

/**
 * Get Redis status for monitoring
 * @returns {Object} Status object
 */
export const getRedisStatus = () => {
  return {
    connected: isRedisAvailable(),
    enabled: isRedisEnabled,
    client: redisClient ? 'initialized' : 'null',
    reconnectAttempts,
  };
};
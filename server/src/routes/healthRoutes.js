import express from 'express';
import logger from '../utils/logger.js';

const router = express.Router();

// Health check endpoint (comprehensive for monitoring)
router.get('/', async (req, res) => {
    try {
        // Check MongoDB connection
        const mongoConnected = await checkMongoConnection();

        // Check Redis connection  
        const redisConnected = await checkRedisConnection();

        const response = {
            status: 'ok',
            timestamp: new Date().toISOString(),
            services: {
                api: 'running',
                worker: redisConnected ? 'running' : 'unavailable',
                database: mongoConnected ? 'connected' : 'disconnected',
                redis: redisConnected ? 'connected' : 'disconnected',
            },
            uptime: Math.round(process.uptime()),
            memory: {
                used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
                unit: 'MB',
            },
        };

        // If any service is unhealthy, return 503
        const isHealthy = mongoConnected && redisConnected;
        res.status(isHealthy ? 200 : 503).json(response);
    } catch (error) {
        logger.error('Health check error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Health check failed',
            timestamp: new Date().toISOString(),
        });
    }
});

// Helper: Check MongoDB connection
async function checkMongoConnection() {
    try {
        const mongoose = await import('mongoose');
        return mongoose.default.connection.readyState === 1; // 1 = connected
    } catch (error) {
        logger.error('MongoDB health check failed:', error);
        return false;
    }
}

// Helper: Check Redis connection
async function checkRedisConnection() {
    try {
        // Import getRedisClient dynamically to avoid circular dependency
        const { getRedisClient } = await import('../config/redis.js');
        const redisClient = getRedisClient();

        if (!redisClient) return false;
        await redisClient.ping();
        return true;
    } catch (error) {
        logger.error('Redis health check failed:', error);
        return false;
    }
}

export default router;

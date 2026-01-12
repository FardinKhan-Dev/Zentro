import { Redis } from 'ioredis';
import dotenv from 'dotenv';

dotenv.config({ path: "./.env" });

// Use REDIS_URL (same as redis.js) for consistency
// Supports both URL format (production) and host/port (local development)
const connection = new Redis(process.env.REDIS_URL || {
    host: process.env.IOREDIS_HOST || '127.0.0.1',
    port: process.env.IOREDIS_PORT || 6379,
    maxRetriesPerRequest: null,
});

connection.on('connect', () => {
    console.log('IORedis (BullMQ) successfully connected!');
});

connection.on('error', (error) => {
    console.log(`IORedis connection error: ${error.message}`);
});

export { connection };

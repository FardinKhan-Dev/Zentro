import { Redis } from 'ioredis';
import dotenv from 'dotenv';

dotenv.config({ path: "./.env" });

// BullMQ requires maxRetriesPerRequest: null
// When using REDIS_URL (like Upstash), we need to pass options as second parameter
let connection;

if (process.env.REDIS_URL) {
    // Production: Use URL with options
    connection = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: null,
    });
} else {
    // Development: Use host/port with options
    connection = new Redis({
        host: process.env.IOREDIS_HOST || '127.0.0.1',
        port: process.env.IOREDIS_PORT || 6379,
        maxRetriesPerRequest: null,
    });
}

connection.on('connect', () => {
    console.log('IORedis (BullMQ) successfully connected!');
});

connection.on('error', (error) => {
    console.log(`IORedis connection error: ${error.message}`);
});

export { connection };

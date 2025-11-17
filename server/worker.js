import 'dotenv/config';
import connectDB from './src/config/db.js';
import { initializeRedis } from './src/config/redis.js';
import { initializeCloudinary } from './src/config/cloudinary.js';
import { initializeStripe } from './src/config/stripe.js';

// Initialize services
await connectDB();
await initializeRedis();
initializeCloudinary();
initializeStripe();

console.log('✓ Worker service initialized');
console.log('✓ Listening for jobs in Redis queues...');

// Import workers after initialization
// These will be added in Phase 4

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('\n✓ Shutting down worker...');
  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

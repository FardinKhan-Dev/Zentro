import 'dotenv/config';
import connectDB from './src/config/db.js';
import { initializeRedis } from './src/config/redis.js';
import { initializeCloudinary } from './src/config/cloudinary.js';
import { initializeStripe } from './src/config/stripe.js';
import { initializeEmailService } from './src/utils/emailService.js';

// Initialize services
await connectDB();
await initializeRedis();
initializeCloudinary();
initializeStripe();
initializeEmailService();

console.log('✓ Worker service initialized');
console.log('✓ Listening for jobs in Redis queues...');

// Import and initialize workers
import emailWorker from './src/jobs/workers/emailWorker.js';
import analyticsWorker from './src/jobs/workers/analyticsWorker.js';

console.log('✓ All workers are now active');

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('\n✓ Shutting down workers gracefully...');

  try {
    // Close workers
    await emailWorker.close();
    await analyticsWorker.close();

    console.log('✓ Workers closed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error during worker shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);


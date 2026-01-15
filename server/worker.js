import connectDB from './src/config/db.js';
import { initializeRedis } from './src/config/redis.js';
import { initializeCloudinary } from './src/config/cloudinary.js';
import { initializeStripe } from './src/config/stripe.js';
import { initializeEmailService } from './src/services/emailService.js';
import pino from 'pino';

// Initialize logger with WORKER prefix
const logger = pino({
  name: 'WORKER',
  level: process.env.LOG_LEVEL || 'info',
});

logger.info('Starting Zentro Worker Process...');

// 1. Initialize everything FIRST
await connectDB();

// TEMPORARILY DISABLED: Redis and all workers that depend on it
// Uncomment when Upstash limits reset or upgrade to paid tier
// await initializeRedis();
console.log('⚠️  Redis temporarily disabled in worker process');

initializeCloudinary();
initializeStripe();
initializeEmailService();

logger.info('Worker services initialized (Redis disabled)');

// WORKERS DISABLED: All Bull queue workers require Redis
// Uncomment when Redis is re-enabled
logger.warn('⚠️  All background workers disabled - no queue processing');
logger.warn('   Email, SMS, Analytics, and AI workers are offline');

// const { startEmailWorker } = await import('./src/jobs/workers/emailWorker.js');
// const { startAnalyticsWorker } = await import('./src/jobs/workers/analyticsWorker.js');
// const { startSMSWorker } = await import('./src/jobs/workers/smsWorker.js');
// const { startAIWorker } = await import('./src/jobs/workers/aiWorker.js');

// const emailWorker = startEmailWorker();
// const analyticsWorker = startAnalyticsWorker();
// const smsWorker = startSMSWorker();
// const aiWorker = startAIWorker();

// logger.info('All workers are now active');
// logger.info('  - Email Worker');
// logger.info('  - Analytics Worker');
// logger.info('  - SMS Worker');
// logger.info('  - AI Worker (Gemini-powered)');

// Graceful shutdown
const gracefulShutdown = async () => {
  logger.info('Shutting down worker process...');

  // Workers are disabled, nothing to close
  // await Promise.allSettled([
  //   emailWorker?.close(),
  //   analyticsWorker?.close(),
  //   smsWorker?.close(),
  //   aiWorker?.close(),
  // ].filter(Boolean));

  logger.info('Worker process shutdown complete');
  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
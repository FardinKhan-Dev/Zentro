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
await initializeRedis();
initializeCloudinary();
initializeStripe();
initializeEmailService();

logger.info('Worker services initialized');
logger.info('Starting workers...');

// 2. NOW dynamically import workers (or use factory functions)
const { startEmailWorker } = await import('./src/jobs/workers/emailWorker.js');
const { startAnalyticsWorker } = await import('./src/jobs/workers/analyticsWorker.js');
const { startSMSWorker } = await import('./src/jobs/workers/smsWorker.js');
const { startAIWorker } = await import('./src/jobs/workers/aiWorker.js');

// Start them
const emailWorker = startEmailWorker();
const analyticsWorker = startAnalyticsWorker();
const smsWorker = startSMSWorker();
const aiWorker = startAIWorker();

logger.info('All workers are now active');
logger.info('  - Email Worker');
logger.info('  - Analytics Worker');
logger.info('  - SMS Worker');
logger.info('  - AI Worker (Gemini-powered)');

// Graceful shutdown
const gracefulShutdown = async () => {
  logger.info('Shutting down workers gracefully...');

  await Promise.allSettled([
    emailWorker?.close(),
    analyticsWorker?.close(),
    smsWorker?.close(),
    aiWorker?.close(),
  ].filter(Boolean));

  logger.info('Workers closed');
  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
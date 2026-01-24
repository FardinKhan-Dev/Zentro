import { Queue } from 'bullmq';
import { connection } from '../../config/ioredis.js';

let emailQueue;

/**
 * Get or create the email queue (lazy initialization)
 * This prevents Redis connection errors in test environment
 */
export const getEmailQueue = () => {
  // Don't create queue if Redis is disabled
  if (process.env.DISABLE_REDIS === 'true' || process.env.DISABLE_REDIS === '1') {
    return null;
  }

  if (!emailQueue) {
    emailQueue = new Queue('email', {
      connection,
      defaultJobOptions: {
        attempts: 3, // Retry up to 3 times
        backoff: {
          type: 'exponential',
          delay: 2000, // Start with 2 seconds, then 4, then 8
        },
        removeOnComplete: {
          age: 24 * 3600, // Keep completed jobs for 24 hours
          count: 1000, // Keep last 1000 completed jobs
        },
        removeOnFail: {
          age: 7 * 24 * 3600, // Keep failed jobs for 7 days
        },
      },
    });
    console.log('✓ Email queue initialized');
  }
  return emailQueue;
};

export default getEmailQueue;


import { Queue } from 'bullmq';
import { getRedisClient } from '../../config/redis.js';

let analyticsQueue;

/**
 * Get or create the analytics queue (lazy initialization)
 * This is a placeholder for Phase 6 implementation
 */
export const getAnalyticsQueue = () => {
    if (!analyticsQueue) {
        analyticsQueue = new Queue('analytics', {
            connection: getRedisClient(),
            defaultJobOptions: {
                attempts: 2,
                backoff: {
                    type: 'exponential',
                    delay: 5000,
                },
                removeOnComplete: {
                    age: 24 * 3600,
                    count: 500,
                },
                removeOnFail: {
                    age: 7 * 24 * 3600,
                },
            },
        });
        console.log('✓ Analytics queue initialized');
    }
    return analyticsQueue;
};

export default getAnalyticsQueue;

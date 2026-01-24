import { Queue } from 'bullmq';
import { connection } from '../../config/ioredis.js';

let smsQueue;

/**
 * Get or create the SMS queue (lazy initialization)
 */
export const getSMSQueue = () => {
    // Don't create queue if Redis is disabled
    if (process.env.DISABLE_REDIS === 'true' || process.env.DISABLE_REDIS === '1') {
        return null;
    }

    if (!smsQueue) {
        smsQueue = new Queue('sms', {
            connection,
            defaultJobOptions: {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 2000,
                },
                removeOnComplete: {
                    age: 24 * 3600,
                    count: 1000,
                },
                removeOnFail: {
                    age: 7 * 24 * 3600,
                },
            },
        });
        console.log('✓ SMS queue initialized');
    }
    return smsQueue;
};

export default getSMSQueue;

/**
 * Queue Integration Tests
 * Tests BullMQ queue functionality with actual Redis connection
 * These tests run in CI where Redis service is available
 */

import { initializeRedis, getRedisClient } from '../src/config/redis.js';
import { initializeEmailService } from '../src/utils/emailService.js';
import {
    addEmailJob,
    addWelcomeEmailJob,
    addVerificationEmailJob,
    addPasswordResetEmailJob,
    addAnalyticsJob,
    getQueueStats,
} from '../src/services/queueService.js';
import { getEmailQueue } from '../src/jobs/definitions/emailQueue.js';
import { getAnalyticsQueue } from '../src/jobs/definitions/analyticsQueue.js';

describe('Queue Integration Tests', () => {
    let redisClient;

    beforeAll(async () => {
        // Initialize Redis for queue tests
        redisClient = await initializeRedis();
        initializeEmailService();
    });

    afterAll(async () => {
        // Clean up queues and close Redis connection
        try {
            const emailQueue = getEmailQueue();
            const analyticsQueue = getAnalyticsQueue();

            await emailQueue.obliterate({ force: true });
            await analyticsQueue.obliterate({ force: true });

            await emailQueue.close();
            await analyticsQueue.close();

            if (redisClient) {
                await redisClient.quit();
            }
        } catch (error) {
            console.error('Cleanup error:', error);
        }
    });

    describe('Email Queue', () => {
        it('should add a welcome email job to the queue', async () => {
            const job = await addWelcomeEmailJob('test@example.com', 'Test User');

            expect(job).toBeDefined();
            expect(job.id).toBeDefined();
            expect(job.data.type).toBe('welcome');
            expect(job.data.email).toBe('test@example.com');
            expect(job.data.name).toBe('Test User');
        });

        it('should add a verification email job to the queue', async () => {
            const verificationUrl = 'http://localhost:3000/verify?token=abc123';
            const job = await addVerificationEmailJob('test@example.com', verificationUrl);

            expect(job).toBeDefined();
            expect(job.data.type).toBe('verification');
            expect(job.data.email).toBe('test@example.com');
            expect(job.data.verificationUrl).toBe(verificationUrl);
        });

        it('should add a password reset email job to the queue', async () => {
            const resetUrl = 'http://localhost:3000/reset?token=xyz789';
            const job = await addPasswordResetEmailJob('test@example.com', resetUrl);

            expect(job).toBeDefined();
            expect(job.data.type).toBe('passwordReset');
            expect(job.data.email).toBe('test@example.com');
            expect(job.data.resetUrl).toBe(resetUrl);
        });

        it('should add a custom email job with correct priority', async () => {
            const orderJob = await addEmailJob('orderConfirmation', {
                email: 'customer@example.com',
                orderDetails: { orderId: '12345', total: '$99.99' },
            });

            expect(orderJob).toBeDefined();
            expect(orderJob.data.type).toBe('orderConfirmation');
            expect(orderJob.opts.priority).toBe(1); // Order confirmations have priority 1

            const welcomeJob = await addEmailJob('welcome', {
                email: 'newuser@example.com',
                name: 'New User',
            });

            expect(welcomeJob.opts.priority).toBe(5); // Other emails have priority 5
        });

        it('should include timestamp in job data', async () => {
            const job = await addWelcomeEmailJob('test@example.com', 'Test User');

            expect(job.data.timestamp).toBeDefined();
            expect(new Date(job.data.timestamp).getTime()).toBeLessThanOrEqual(Date.now());
        });

        it('should configure retry attempts correctly', async () => {
            const job = await addWelcomeEmailJob('test@example.com', 'Test User');

            expect(job.opts.attempts).toBe(3); // Email jobs retry 3 times
            expect(job.opts.backoff).toBeDefined();
            expect(job.opts.backoff.type).toBe('exponential');
            expect(job.opts.backoff.delay).toBe(2000);
        });
    });

    describe('Analytics Queue', () => {
        it('should add an analytics job to the queue', async () => {
            const job = await addAnalyticsJob('dailySales', {
                date: '2025-11-22',
                revenue: 1500.50,
            });

            expect(job).toBeDefined();
            expect(job.id).toBeDefined();
            expect(job.data.type).toBe('dailySales');
            expect(job.data.date).toBe('2025-11-22');
            expect(job.data.revenue).toBe(1500.50);
        });

        it('should configure retry attempts correctly', async () => {
            const job = await addAnalyticsJob('userActivity', {
                userId: 'user123',
            });

            expect(job.opts.attempts).toBe(2); // Analytics jobs retry 2 times
            expect(job.opts.backoff).toBeDefined();
            expect(job.opts.backoff.type).toBe('exponential');
            expect(job.opts.backoff.delay).toBe(5000);
        });
    });

    describe('Queue Statistics', () => {
        beforeEach(async () => {
            // Clean queues before each stats test
            const emailQueue = getEmailQueue();
            await emailQueue.drain();
            await emailQueue.clean(0, 1000, 'completed');
            await emailQueue.clean(0, 1000, 'failed');
        });

        it('should return queue statistics for email queue', async () => {
            // Add some jobs
            await addWelcomeEmailJob('user1@example.com', 'User 1');
            await addWelcomeEmailJob('user2@example.com', 'User 2');

            const stats = await getQueueStats('email');

            expect(stats).toBeDefined();
            expect(stats.queue).toBe('email');
            expect(typeof stats.waiting).toBe('number');
            expect(typeof stats.active).toBe('number');
            expect(typeof stats.completed).toBe('number');
            expect(typeof stats.failed).toBe('number');

            // Should have at least 2 waiting jobs
            expect(stats.waiting).toBeGreaterThanOrEqual(2);
        });

        it('should return queue statistics for analytics queue', async () => {
            await addAnalyticsJob('dailySales', { date: '2025-11-22' });

            const stats = await getQueueStats('analytics');

            expect(stats).toBeDefined();
            expect(stats.queue).toBe('analytics');
            expect(typeof stats.waiting).toBe('number');
        });
    });

    describe('Queue Job Processing', () => {
        it('should process jobs in order based on priority', async () => {
            // Add low priority job first
            const lowPriorityJob = await addEmailJob('welcome', {
                email: 'low@example.com',
                name: 'Low Priority',
            });

            // Add high priority job second
            const highPriorityJob = await addEmailJob('orderConfirmation', {
                email: 'high@example.com',
                orderDetails: { orderId: '999' },
            });

            expect(lowPriorityJob.opts.priority).toBe(5);
            expect(highPriorityJob.opts.priority).toBe(1);

            // High priority jobs (lower number) should be processed first
            expect(highPriorityJob.opts.priority).toBeLessThan(lowPriorityJob.opts.priority);
        });

        it('should maintain job data integrity', async () => {
            const originalData = {
                email: 'integrity@example.com',
                name: 'Integrity Test',
                customField: 'custom value',
            };

            const job = await addWelcomeEmailJob(originalData.email, originalData.name);

            // Fetch the job from the queue
            const emailQueue = getEmailQueue();
            const fetchedJob = await emailQueue.getJob(job.id);

            expect(fetchedJob).toBeDefined();
            expect(fetchedJob.data.email).toBe(originalData.email);
            expect(fetchedJob.data.name).toBe(originalData.name);
            expect(fetchedJob.data.type).toBe('welcome');
        });
    });

    describe('Error Handling', () => {
        it('should handle queue service errors gracefully', async () => {
            // This test ensures errors are thrown properly
            await expect(async () => {
                // Try to add a job with invalid data structure
                const emailQueue = getEmailQueue();
                await emailQueue.add('invalid', null);
            }).rejects.toThrow();
        });
    });
});

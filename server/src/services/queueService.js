import { getEmailQueue } from '../jobs/definitions/emailQueue.js';
import { getAnalyticsQueue } from '../jobs/definitions/analyticsQueue.js';
export {
    addDescriptionGenerationJob,
    addTagsGenerationJob,
    addFAQGenerationJob,
    addBulkEnhancementJob,
} from '../jobs/definitions/aiQueue.js';

/**
 * Queue Service - Helper functions to add jobs to queues
 * This decouples controllers from direct queue interaction
 */

// ==================== EMAIL JOBS ====================

/**
 * Add an email job to the queue
 * @param {string} type - Type of email: 'welcome', 'verification', 'passwordReset', 'orderConfirmation'
 * @param {object} data - Email data (email, name, url, orderDetails, etc.)
 * @returns {Promise<Job>} The created job
 */
export const addEmailJob = async (type, data) => {
    try {
        // Skip if Redis is disabled
        if (process.env.DISABLE_REDIS === 'true' || process.env.DISABLE_REDIS === '1') {
            console.log(`⚠️  Email job skipped (Redis disabled): ${type}`);
            return null;
        }

        const emailQueue = getEmailQueue();
        const job = await emailQueue.add(
            type,
            {
                type,
                ...data,
                timestamp: new Date().toISOString(),
            },
            {
                priority: type === 'orderConfirmation' ? 1 : 5, // Order confirmations get higher priority
            }
        );

        console.log(`✓ Email job added: ${type} (Job ID: ${job.id})`);
        return job;
    } catch (error) {
        console.error(`✗ Failed to add email job (${type}):`, error.message);
        // Don't throw - return null to prevent blocking
        return null;
    }
};

/**
 * Add a welcome email job
 */
export const addWelcomeEmailJob = async (email, name) => {
    return addEmailJob('welcome', { email, name });
};

/**
 * Add a verification email job
 */
export const addVerificationEmailJob = async (email, verificationUrl) => {
    return addEmailJob('verification', { email, verificationUrl });
};

/**
 * Add a password reset email job
 */
export const addPasswordResetEmailJob = async (email, resetUrl) => {
    return addEmailJob('passwordReset', { email, resetUrl });
};

/**
 * Add an order confirmation email job
 */
export const addOrderConfirmationEmailJob = async (email, orderDetails) => {
    return addEmailJob('orderConfirmation', { email, orderDetails });
};

/**
 * Add a shipping notification email job
 */
export const addShippingNotificationEmailJob = async (email, orderDetails, trackingNumber) => {
    return addEmailJob('shippingNotification', { email, orderDetails, trackingNumber });
};

/**
 * Add an order cancellation email job
 */
export const addOrderCancellationEmailJob = async (email, orderDetails, reason) => {
    return addEmailJob('orderCancellation', { email, orderDetails, reason });
};

// ==================== ANALYTICS JOBS ====================

/**
 * Add an analytics job to the queue (Placeholder for Phase 6)
 * @param {string} type - Type of analytics: 'dailySales', 'userActivity', 'productViews'
 * @param {object} data - Analytics data
 * @returns {Promise<Job>} The created job
 */
export const addAnalyticsJob = async (type, data) => {
    try {
        // Skip if Redis is disabled
        if (process.env.DISABLE_REDIS === 'true' || process.env.DISABLE_REDIS === '1') {
            console.log(`⚠️  Analytics job skipped (Redis disabled): ${type}`);
            return null;
        }

        const analyticsQueue = getAnalyticsQueue();
        const job = await analyticsQueue.add(type, {
            type,
            ...data,
            timestamp: new Date().toISOString(),
        });

        console.log(`✓ Analytics job added: ${type} (Job ID: ${job.id})`);
        return job;
    } catch (error) {
        console.error(`✗ Failed to add analytics job (${type}):`, error.message);
        return null;
    }
};

// ==================== SMS JOBS ====================

import { getSMSQueue } from '../jobs/definitions/smsQueue.js';

/**
 * Add an SMS job to the queue
 * @param {string} phoneNumber - Recipient phone number
 * @param {string} message - Message content
 * @returns {Promise<Job>} The created job
 */
export const addSMSJob = async (phoneNumber, message) => {
    try {
        // Skip if Redis is disabled
        if (process.env.DISABLE_REDIS === 'true' || process.env.DISABLE_REDIS === '1') {
            console.log(`⚠️  SMS job skipped (Redis disabled) for ${phoneNumber}`);
            return null;
        }

        const smsQueue = getSMSQueue();
        const job = await smsQueue.add('sms', {
            phoneNumber,
            message,
            timestamp: new Date().toISOString(),
        });

        console.log(`✓ SMS job added for ${phoneNumber} (Job ID: ${job.id})`);
        return job;
    } catch (error) {
        console.error(`✗ Failed to add SMS job:`, error.message);
        return null;
    }
};

// ==================== QUEUE STATUS ====================

/**
 * Get queue statistics (useful for monitoring)
 */
export const getQueueStats = async (queueName = 'email') => {
    const queue = queueName === 'email' ? getEmailQueue() : getAnalyticsQueue();

    const [waiting, active, completed, failed] = await Promise.all([
        queue.getWaitingCount(),
        queue.getActiveCount(),
        queue.getCompletedCount(),
        queue.getFailedCount(),
    ]);

    return {
        queue: queueName,
        waiting,
        active,
        completed,
        failed,
    };
};

export default {
    addEmailJob,
    addWelcomeEmailJob,
    addVerificationEmailJob,
    addPasswordResetEmailJob,
    addOrderConfirmationEmailJob,
    addAnalyticsJob,
    addSMSJob,
    getQueueStats,
};

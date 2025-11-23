import { Worker } from 'bullmq';
import { getRedisClient } from '../../config/redis.js';
import {
    sendWelcomeEmail,
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendEmail,
} from '../../utils/emailService.js';

/**
 * Email Worker - Processes email jobs from the queue
 * This runs in the worker container, separate from the API
 */

const processEmailJob = async (job) => {
    const { type, email, name, verificationUrl, resetUrl, orderDetails } = job.data;

    console.log(`📧 Processing email job: ${type} for ${email} (Job ID: ${job.id})`);

    try {
        switch (type) {
            case 'welcome':
                await sendWelcomeEmail(email, name);
                break;

            case 'verification':
                await sendVerificationEmail(email, verificationUrl);
                break;

            case 'passwordReset':
                await sendPasswordResetEmail(email, resetUrl);
                break;

            case 'orderConfirmation':
                // Placeholder for Phase 5 - Order confirmation email
                await sendEmail({
                    email,
                    subject: 'Order Confirmation - Zentro',
                    html: `
            <h2>Order Confirmed</h2>
            <p>Thank you for your order!</p>
            <p>Order ID: ${orderDetails?.orderId || 'N/A'}</p>
            <p>Total: ${orderDetails?.total || 'N/A'}</p>
          `,
                });
                break;

            default:
                throw new Error(`Unknown email type: ${type}`);
        }

        console.log(`✓ Email sent successfully: ${type} to ${email}`);
        return { success: true, type, email };
    } catch (error) {
        console.error(`✗ Email job failed (${type}):`, error.message);
        throw error; // BullMQ will retry based on job options
    }
};

// Create the email worker
export const emailWorker = new Worker('email', processEmailJob, {
    connection: getRedisClient(),
    concurrency: 5, // Process up to 5 email jobs concurrently
    limiter: {
        max: 10, // Max 10 jobs
        duration: 1000, // Per 1 second (rate limiting to avoid spam detection)
    },
});

// Worker event handlers
emailWorker.on('completed', (job, result) => {
    console.log(`✓ Email job completed: ${job.id} (${result.type})`);
});

emailWorker.on('failed', (job, error) => {
    console.error(`✗ Email job failed: ${job?.id} - ${error.message}`);
});

emailWorker.on('error', (error) => {
    console.error('✗ Email worker error:', error.message);
});

console.log('✓ Email worker initialized and listening...');

export default emailWorker;

import { Worker } from 'bullmq';
import { connection } from '../../config/ioredis.js';
import {
    sendWelcomeEmail,
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendOrderConfirmationEmail,
    sendShippingNotificationEmail,
    sendOrderCancellationEmail,
} from '../../services/emailService.js';

/**
 * Email Worker - Processes email jobs from the queue
 */

const processEmailJob = async (job) => {
    const { type, email, name, verificationUrl, resetUrl, orderDetails, trackingNumber, reason } = job.data;

    console.log(`Processing email job: ${type} for ${email} (Job ID: ${job.id})`);

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
                await sendOrderConfirmationEmail(email, orderDetails);
                break;
            case 'shippingNotification':
                await sendShippingNotificationEmail(email, orderDetails, trackingNumber);
                break;
            case 'orderCancellation':
                await sendOrderCancellationEmail(email, orderDetails, reason);
                break;
            default:
                throw new Error(`Unknown email type: ${type}`);
        }

        console.log(`Email sent: ${type} → ${email}`);
        return { success: true, type, email };
    } catch (error) {
        console.error(`Email job failed (${type}):`, error.message);
        throw error;
    }
};

// DO NOT create Worker here!
// Instead, export a factory function
let workerInstance = null;

export const startEmailWorker = () => {
    if (workerInstance) {
        console.log('Email worker already running');
        return workerInstance;
    }

    workerInstance = new Worker('email', processEmailJob, {
        connection, // ← NOW SAFE: using shared ioredis connection
        concurrency: 2, // Reduced for free tier (512MB RAM)
        limiter: {
            max: 5, // Max 5 emails
            duration: 1000, // Per second (reduced to prevent overwhelming free tier)
        },
    });

    workerInstance.on('completed', (job) => {
        console.log(`Email job completed: ${job.id}`);
    });

    workerInstance.on('failed', (job, err) => {
        console.error(`Email job failed: ${job?.id} - ${err.message}`);
    });

    workerInstance.on('error', (err) => {
        console.error('Email worker error:', err.message);
    });

    console.log('Email worker started and listening...');
    return workerInstance;
};

// Optional: allow closing
export const closeEmailWorker = async () => {
    if (workerInstance) {
        await workerInstance.close();
        workerInstance = null;
        console.log('Email worker closed');
    }
};
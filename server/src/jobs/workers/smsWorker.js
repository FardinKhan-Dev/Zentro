import { Worker } from 'bullmq';
import { connection } from '../../config/ioredis.js';
import { sendSMS } from '../../services/smsService.js';

/**
 * SMS Worker - Processes SMS jobs from the queue
 */

const processSMSJob = async (job) => {
    const { phoneNumber, message } = job.data;

    console.log(`Processing SMS job for ${phoneNumber} (Job ID: ${job.id})`);

    try {
        const success = await sendSMS(phoneNumber, message);

        if (!success) {
            throw new Error('Failed to send SMS via provider');
        }

        console.log(`SMS sent to ${phoneNumber}`);
        return { success: true, phoneNumber };
    } catch (error) {
        console.error(`SMS job failed:`, error.message);
        throw error;
    }
};

let workerInstance = null;

export const startSMSWorker = () => {
    if (workerInstance) {
        console.log('SMS worker already running');
        return workerInstance;
    }

    workerInstance = new Worker('sms', processSMSJob, {
        connection,
        concurrency: 5,
        limiter: {
            max: 1, // Rate limit: 1 SMS per second
            duration: 1000,
        },
    });

    workerInstance.on('completed', (job) => {
        console.log(`SMS job completed: ${job.id}`);
    });

    workerInstance.on('failed', (job, err) => {
        console.error(`SMS job failed: ${job?.id} - ${err.message}`);
    });

    workerInstance.on('error', (err) => {
        console.error('SMS worker error:', err.message);
    });

    console.log('SMS worker started and listening...');
    return workerInstance;
};

export const closeSMSWorker = async () => {
    if (workerInstance) {
        await workerInstance.close();
        workerInstance = null;
        console.log('SMS worker closed');
    }
};

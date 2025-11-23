import 'dotenv/config';
import { initializeRedis } from '../src/config/redis.js';
import { initializeEmailService } from '../src/utils/emailService.js';
import {
    addWelcomeEmailJob,
    addVerificationEmailJob,
    addPasswordResetEmailJob,
    getQueueStats,
} from '../src/services/queueService.js';

/**
 * Test script to verify queue functionality
 * This script adds test jobs to the queue and checks queue status
 */

const runQueueTest = async () => {
    console.log('🧪 Starting queue test...\n');

    try {
        // Initialize services
        console.log('Initializing services...');
        await initializeRedis();
        initializeEmailService();
        console.log('✓ Services initialized\n');

        // Test 1: Add welcome email job
        console.log('Test 1: Adding welcome email job...');
        await addWelcomeEmailJob('test@example.com', 'Test User');
        console.log('✓ Welcome email job added\n');

        // Test 2: Add verification email job
        console.log('Test 2: Adding verification email job...');
        await addVerificationEmailJob(
            'test@example.com',
            'http://localhost:3000/verify-email?token=test-token'
        );
        console.log('✓ Verification email job added\n');

        // Test 3: Add password reset email job
        console.log('Test 3: Adding password reset email job...');
        await addPasswordResetEmailJob(
            'test@example.com',
            'http://localhost:3000/reset-password?token=test-token'
        );
        console.log('✓ Password reset email job added\n');

        // Wait a moment for jobs to be picked up
        console.log('Waiting 2 seconds for worker to process jobs...');
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Check queue stats
        console.log('Checking queue statistics...');
        const stats = await getQueueStats('email');
        console.log('\n📊 Email Queue Stats:');
        console.log(`   Waiting: ${stats.waiting}`);
        console.log(`   Active: ${stats.active}`);
        console.log(`   Completed: ${stats.completed}`);
        console.log(`   Failed: ${stats.failed}`);

        console.log('\n✓ Queue test completed successfully!');
        console.log('\n💡 If worker is running, check worker logs to see job processing.');

        process.exit(0);
    } catch (error) {
        console.error('\n✗ Queue test failed:', error.message);
        console.error(error);
        process.exit(1);
    }
};

runQueueTest();

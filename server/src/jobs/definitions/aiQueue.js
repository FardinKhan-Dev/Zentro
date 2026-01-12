import { Queue } from 'bullmq';
import { connection } from '../../config/ioredis.js';

let aiQueue;

/**
 * Get or create AI Queue
 * Handles AI-related background jobs (description generation, content enhancement)
 */
export const getAIQueue = () => {
    if (aiQueue) return aiQueue;

    aiQueue = new Queue('ai', {
        connection,
        defaultJobOptions: {
            attempts: 2, // AI calls can be expensive, limit retries
            backoff: {
                type: 'exponential',
                delay: 2000,
            },
            removeOnComplete: {
                age: 24 * 3600, // Keep completed jobs for 24 hours
                count: 100,
            },
            removeOnFail: {
                age: 7 * 24 * 3600, // Keep failed jobs for 7 days for debugging
            },
        },
    });

    console.log('✓ AI Queue initialized');
    return aiQueue;
};

/**
 * Add product description generation job
 * @param {Object} data - { productId, productData }
 * @param {Object} options - Job options (priority, delay, etc.)
 */
export const addDescriptionGenerationJob = async (data, options = {}) => {
    const queue = getAIQueue();
    if (!queue) {
        throw new Error('AI queue not available');
    }

    return await queue.add(
        'generate-description',
        {
            ...data,
            timestamp: new Date().toISOString(),
        },
        {
            priority: options.priority || 3, // Medium priority
            ...options,
        }
    );
};

/**
 * Add product tags generation job
 * @param {Object} data - { productId, productData }
 */
export const addTagsGenerationJob = async (data, options = {}) => {
    const queue = getAIQueue();
    if (!queue) {
        throw new Error('AI queue not available');
    }

    return await queue.add(
        'generate-tags',
        {
            ...data,
            timestamp: new Date().toISOString(),
        },
        {
            priority: options.priority || 4, // Lower priority
            ...options,
        }
    );
};

/**
 * Add FAQ generation job
 * @param {Object} data - { productId, productData }
 */
export const addFAQGenerationJob = async (data, options = {}) => {
    const queue = getAIQueue();
    if (!queue) {
        throw new Error('AI queue not available');
    }

    return await queue.add(
        'generate-faq',
        {
            ...data,
            timestamp: new Date().toISOString(),
        },
        {
            priority: options.priority || 4,
            ...options,
        }
    );
};

/**
 * Add bulk AI enhancement job
 * Generates description, tags, and FAQ for a product
 * @param {Object} data - { productId, productData }
 */
export const addBulkEnhancementJob = async (data, options = {}) => {
    const queue = getAIQueue();
    if (!queue) {
        throw new Error('AI queue not available');
    }

    return await queue.add(
        'bulk-enhancement',
        {
            ...data,
            timestamp: new Date().toISOString(),
        },
        {
            priority: options.priority || 2, // Higher priority for bulk
            ...options,
        }
    );
};

export default {
    getAIQueue,
    addDescriptionGenerationJob,
    addTagsGenerationJob,
    addFAQGenerationJob,
    addBulkEnhancementJob,
};

import { Worker } from 'bullmq';
import { connection } from '../../config/ioredis.js';
import Product from '../../models/Product.js';
import {
    generateProductDescription,
    generateProductTags,
    generateProductFAQ,
    isAIAvailable,
} from '../../services/aiService.js';

/**
 * AI Worker - Processes AI-related background jobs
 * Handles product description generation, tagging, FAQ creation
 */

let aiWorker;

export const startAIWorker = () => {
    if (aiWorker) {
        console.log('AI worker already running');
        return aiWorker;
    }

    if (!isAIAvailable()) {
        console.warn('⚠️  AI service not available. AI worker will not start.');
        return null;
    }

    aiWorker = new Worker(
        'ai',
        async (job) => {
            console.log(`Processing AI job: ${job.name} (ID: ${job.id})`);

            try {
                switch (job.name) {
                    case 'generate-description':
                        return await handleDescriptionGeneration(job.data);

                    case 'generate-tags':
                        return await handleTagsGeneration(job.data);

                    case 'generate-faq':
                        return await handleFAQGeneration(job.data);

                    case 'bulk-enhancement':
                        return await handleBulkEnhancement(job.data);

                    default:
                        throw new Error(`Unknown AI job type: ${job.name}`);
                }
            } catch (error) {
                console.error(`AI job ${job.name} failed:`, error);
                throw error;
            }
        },
        {
            connection,
            concurrency: 1, // Only 1 AI job at a time (memory intensive, free tier)
            limiter: {
                max: 5, // Max 5 jobs
                duration: 60000, // Per minute (respect both API and free tier limits)
            },
        }
    );

    // Event handlers
    aiWorker.on('completed', (job) => {
        console.log(`✓ AI job ${job.id} completed successfully`);
    });

    aiWorker.on('failed', (job, err) => {
        console.error(`✗ AI job ${job?.id} failed:`, err.message);
    });

    aiWorker.on('error', (err) => {
        console.error('AI Worker error:', err);
    });

    console.log('✓ AI Worker started (Gemini-powered)');
    return aiWorker;
};

/**
 * Handle product description generation
 */
const handleDescriptionGeneration = async (data) => {
    const { productId, productData } = data;

    try {
        // Generate description using Gemini
        const generatedDescription = await generateProductDescription(productData);

        // Update product in database
        const product = await Product.findByIdAndUpdate(
            productId,
            {
                description: generatedDescription,
                aiGenerated: true,
                lastAIUpdate: new Date(),
            },
            { new: true }
        );

        if (!product) {
            throw new Error(`Product ${productId} not found`);
        }

        return {
            success: true,
            productId,
            descriptionLength: generatedDescription.length,
            message: 'Description generated successfully',
        };
    } catch (error) {
        console.error('Description generation failed:', error);
        throw error;
    }
};

/**
 * Handle product tags generation
 */
const handleTagsGeneration = async (data) => {
    const { productId, productData } = data;

    try {
        const tags = await generateProductTags(productData);

        const product = await Product.findByIdAndUpdate(
            productId,
            {
                tags: tags,
                lastAIUpdate: new Date(),
            },
            { new: true }
        );

        if (!product) {
            throw new Error(`Product ${productId} not found`);
        }

        return {
            success: true,
            productId,
            tagsCount: tags.length,
            tags,
        };
    } catch (error) {
        console.error('Tags generation failed:', error);
        throw error;
    }
};

/**
 * Handle FAQ generation
 */
const handleFAQGeneration = async (data) => {
    const { productId, productData } = data;

    try {
        const faqs = await generateProductFAQ(productData);

        const product = await Product.findByIdAndUpdate(
            productId,
            {
                faqs: faqs,
                lastAIUpdate: new Date(),
            },
            { new: true }
        );

        if (!product) {
            throw new Error(`Product ${productId} not found`);
        }

        return {
            success: true,
            productId,
            faqCount: faqs.length,
        };
    } catch (error) {
        console.error('FAQ generation failed:', error);
        throw error;
    }
};

/**
 * Handle bulk enhancement (description + tags + FAQ)
 */
const handleBulkEnhancement = async (data) => {
    const { productId, productData } = data;

    try {
        // Generate all AI content
        const [description, tags, faqs] = await Promise.all([
            generateProductDescription(productData),
            generateProductTags(productData),
            generateProductFAQ(productData),
        ]);

        // Update product with all AI-generated content
        const product = await Product.findByIdAndUpdate(
            productId,
            {
                description,
                tags,
                faqs,
                aiGenerated: true,
                lastAIUpdate: new Date(),
            },
            { new: true }
        );

        if (!product) {
            throw new Error(`Product ${productId} not found`);
        }

        return {
            success: true,
            productId,
            enhanced: {
                description: true,
                tags: tags.length,
                faqs: faqs.length,
            },
        };
    } catch (error) {
        console.error('Bulk enhancement failed:', error);
        throw error;
    }
};

/**
 * Stop AI worker
 */
export const stopAIWorker = async () => {
    if (aiWorker) {
        await aiWorker.close();
        aiWorker = null;
        console.log('AI Worker stopped');
    }
};

export default {
    startAIWorker,
    stopAIWorker,
};

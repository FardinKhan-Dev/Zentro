import { catchAsync as CatchAsync } from '../utils/errorHandler.js';
import { AppError } from '../utils/errorHandler.js';
import Product from '../models/Product.js';
import {
    addDescriptionGenerationJob,
    addTagsGenerationJob,
    addFAQGenerationJob,
    addBulkEnhancementJob,
} from '../services/queueService.js';
import { isAIAvailable } from '../services/aiService.js';

/**
 * AI Controller - Handles AI-powered product enhancement
 */

/**
 * Generate product description using AI
 * POST /api/ai/products/:productId/description
 */
export const generateDescription = CatchAsync(async (req, res, next) => {
    const { productId } = req.params;

    if (!isAIAvailable()) {
        return next(new AppError('AI service is not available. Please configure GEMINI_API_KEY.', 503));
    }

    // Find product
    const product = await Product.findById(productId);
    if (!product) {
        return next(new AppError('Product not found', 404));
    }

    // Prepare product data for AI
    const productData = {
        name: product.name,
        category: product.category?.name || 'General',
        brand: product.brand,
        features: product.features || [],
        specifications: product.specifications,
    };

    // Add job to queue
    const job = await addDescriptionGenerationJob({
        productId: product._id,
        productData,
    });

    res.status(202).json({
        status: 'success',
        message: 'Description generation started. This may take a few moments.',
        data: {
            jobId: job.id,
            productId: product._id,
            estimatedTime: '10-30 seconds',
        },
    });
});

/**
 * Generate product tags using AI
 * POST /api/ai/products/:productId/tags
 */
export const generateTags = CatchAsync(async (req, res, next) => {
    const { productId } = req.params;

    if (!isAIAvailable()) {
        return next(new AppError('AI service is not available', 503));
    }

    const product = await Product.findById(productId);
    if (!product) {
        return next(new AppError('Product not found', 404));
    }

    const productData = {
        name: product.name,
        category: product.category?.name,
        description: product.description,
    };

    const job = await addTagsGenerationJob({
        productId: product._id,
        productData,
    });

    res.status(202).json({
        status: 'success',
        message: 'Tags generation started',
        data: {
            jobId: job.id,
            productId: product._id,
        },
    });
});

/**
 * Generate product FAQ using AI
 * POST /api/ai/products/:productId/faq
 */
export const generateFAQ = CatchAsync(async (req, res, next) => {
    const { productId } = req.params;

    if (!isAIAvailable()) {
        return next(new AppError('AI service is not available', 503));
    }

    const product = await Product.findById(productId).populate('category');
    if (!product) {
        return next(new AppError('Product not found', 404));
    }

    const productData = {
        name: product.name,
        category: product.category?.name,
        description: product.description,
        specifications: product.specifications,
    };

    const job = await addFAQGenerationJob({
        productId: product._id,
        productData,
    });

    res.status(202).json({
        status: 'success',
        message: 'FAQ generation started',
        data: {
            jobId: job.id,
            productId: product._id,
        },
    });
});

/**
 * Bulk AI enhancement (description + tags + FAQ)
 * POST /api/ai/products/:productId/enhance
 */
export const bulkEnhance = CatchAsync(async (req, res, next) => {
    const { productId } = req.params;

    if (!isAIAvailable()) {
        return next(new AppError('AI service is not available', 503));
    }

    const product = await Product.findById(productId).populate('category');
    if (!product) {
        return next(new AppError('Product not found', 404));
    }

    const productData = {
        name: product.name,
        category: product.category?.name || 'General',
        brand: product.brand,
        features: product.features || [],
        description: product.description,
        specifications: product.specifications,
    };

    const job = await addBulkEnhancementJob({
        productId: product._id,
        productData,
    });

    res.status(202).json({
        status: 'success',
        message: 'AI enhancement started. Product will be updated with description, tags, and FAQ.',
        data: {
            jobId: job.id,
            productId: product._id,
            estimatedTime: '30-60 seconds',
        },
    });
});

/**
 * Check AI service status
 * GET /api/ai/status
 */
export const getAIStatus = CatchAsync(async (req, res) => {
    const available = isAIAvailable();

    res.status(200).json({
        status: 'success',
        data: {
            aiAvailable: available,
            provider: 'Google Gemini',
            model: 'gemini-pro',
            features: available ? [
                'Product Description Generation',
                'Product Tags/Keywords',
                'FAQ Generation',
                'Bulk Enhancement',
            ] : [],
        },
    });
});

export default {
    generateDescription,
    generateTags,
    generateFAQ,
    bulkEnhance,
    getAIStatus,
};

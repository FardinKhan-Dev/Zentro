import express from 'express';
import {
    generateDescription,
    generateTags,
    generateFAQ,
    bulkEnhance,
    getAIStatus,
} from '../controllers/aiController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * AI Routes - For AI-powered product enhancement
 * All routes protected and restricted to admin users
 */

// Check AI service status (public for debugging)
router.get('/status', getAIStatus);

// Protect all routes below (admin only)
router.use(protect);
router.use(restrictTo('admin'));

// Product AI enhancement routes
router.post('/products/:productId/description', generateDescription);
router.post('/products/:productId/tags', generateTags);
router.post('/products/:productId/faq', generateFAQ);
router.post('/products/:productId/enhance', bulkEnhance);

export default router;

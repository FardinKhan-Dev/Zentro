import express from 'express';
import {
    createReview,
    getReviews,
    deleteReview,
    checkReviewEligibility,
} from '../controllers/reviewController.js';
import { uploadMultiple } from '../middleware/uploadMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { createReviewSchema, deleteReviewSchema } from '../validations/reviewValidation.js';

const router = express.Router();

router.route('/')
    .post(protect, uploadMultiple, validateRequest(createReviewSchema), createReview);

router.route('/check-eligibility/:productId')
    .get(protect, checkReviewEligibility);

router.route('/:productId')
    .get(getReviews);

router.route('/:id')
    .delete(protect, validateRequest(deleteReviewSchema), deleteReview);

export default router;

import { AppError, catchAsync } from '../utils/errorHandler.js';
import { customResponse } from '../utils/response.js';
import { uploadBufferToCloudinary } from '../utils/uploadUtils.js';
import Order from '../models/Order.js';

/**
 * calculateAverageRating
 * Helper function to recalculate the average rating of a product
 * and update the Product document.
 */
const calculateAverageRating = async (productId) => {
    const stats = await Review.aggregate([
        { $match: { product: productId } },
        {
            $group: {
                _id: '$product',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' },
            },
        },
    ]);

    if (stats.length > 0) {
        await Product.findByIdAndUpdate(productId, {
            numReviews: stats[0].nRating,
            averageRating: stats[0].avgRating,
        });
    } else {
        await Product.findByIdAndUpdate(productId, {
            numReviews: 0,
            averageRating: 0,
        });
    }
};

/**
 * @desc    Check if user is eligible to review
 * @route   GET /api/reviews/check-eligibility/:productId
 * @access  Private
 */
export const checkReviewEligibility = catchAsync(async (req, res, next) => {
    const { productId } = req.params;

    // 1. Check if user already reviewed
    const existingReview = await Review.findOne({
        user: req.user.id,
        product: productId,
    });

    if (existingReview) {
        return customResponse(res, {
            status: 200,
            success: true,
            data: { isEligible: false, message: 'You have already reviewed this product.' },
        });
    }

    // 2. Check for delivered order
    const hasPurchased = await Order.exists({
        user: req.user.id,
        'items.product': productId,
        orderStatus: 'delivered',
    });

    if (!hasPurchased) {
        return customResponse(res, {
            status: 200,
            success: true,
            data: { isEligible: false, message: 'You must purchase this product to review it.' },
        });
    }

    return customResponse(res, {
        status: 200,
        success: true,
        data: { isEligible: true },
    });
});

/**
 * @desc    Create a new review
 * @route   POST /api/reviews
 * @access  Private
 */
export const createReview = catchAsync(async (req, res, next) => {
    const { productId, rating, comment } = req.body;

    // Security Check: Verify eligibility again
    const existingReview = await Review.findOne({
        user: req.user.id,
        product: productId,
    });

    if (existingReview) {
        throw new AppError('Product already reviewed', 400);
    }

    const hasPurchased = await Order.exists({
        user: req.user.id,
        'items.product': productId,
        orderStatus: 'delivered',
    });

    if (!hasPurchased) {
        throw new AppError('You must purchase this product to review it.', 403);
    }

    // Handle Image Uploads
    let images = [];
    if (req.files && req.files.length > 0) {
        const uploadPromises = req.files.map(file =>
            uploadBufferToCloudinary(file.buffer, 'reviews')
        );
        images = await Promise.all(uploadPromises);
    }

    const review = await Review.create({
        user: req.user.id,
        product: productId,
        rating: Number(rating),
        comment,
        images,
    });

    await calculateAverageRating(productId);

    return customResponse(res, {
        status: 201,
        success: true,
        message: 'Review added',
        data: review,
    });
});

/**
 * @desc    Get reviews for a product
 * @route   GET /api/reviews/:productId
 * @access  Public
 */
export const getReviews = catchAsync(async (req, res, next) => {
    const reviews = await Review.find({ product: req.params.productId })
        .populate('user', 'name avatar')
        .sort({ createdAt: -1 });

    return customResponse(res, {
        status: 200,
        success: true,
        data: reviews,
    });
});

/**
 * @desc    Delete a review
 * @route   DELETE /api/reviews/:id
 * @access  Private (Owner or Admin)
 */
export const deleteReview = catchAsync(async (req, res, next) => {
    const review = await Review.findById(req.params.id);

    if (!review) {
        throw new AppError('Review not found', 404);
    }

    // Check if user is owner or admin
    if (
        review.user.toString() !== req.user.id.toString() &&
        req.user.role !== 'admin'
    ) {
        throw new AppError('Not authorized to delete this review', 403);
    }

    await review.deleteOne();
    await calculateAverageRating(review.product);

    return customResponse(res, {
        status: 200,
        success: true,
        message: 'Review removed',
    });
});

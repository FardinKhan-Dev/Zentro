import { z } from 'zod';

export const createReviewSchema = z.object({
    body: z.object({
        productId: z.string({
            required_error: 'Product ID is required',
        }),
        rating: z.number({
            required_error: 'Rating is required',
        })
            .min(1, 'Rating must be at least 1')
            .max(5, 'Rating must be at most 5'),
        comment: z.string({
            required_error: 'Comment is required',
        })
            .min(5, 'Review must be at least 5 characters')
            .max(500, 'Review cannot exceed 500 characters'),
    }),
});

export const deleteReviewSchema = z.object({
    params: z.object({
        id: z.string({
            required_error: 'Review ID is required',
        }),
    }),
});

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CiStar } from 'react-icons/ci';
import { toast } from 'react-hot-toast';
import { FiCamera, FiX } from 'react-icons/fi';
import Button from '../common/Button';
import { useCreateReviewMutation, useCheckReviewEligibilityQuery } from '../../features/reviews/reviewApi';

const reviewSchema = z.object({
    rating: z.number().min(1, 'Rating is required'),
    comment: z
        .string()
        .min(5, 'Review must be at least 5 characters')
        .max(500, 'Review cannot exceed 500 characters'),
});

const ReviewForm = ({ productId, onReviewSubmitted }) => {
    const [hoveredStar, setHoveredStar] = useState(0);
    const [images, setImages] = useState([]);
    const [previews, setPreviews] = useState([]);

    const [createReview, { isLoading }] = useCreateReviewMutation();
    const { data: eligibility, isLoading: checkingEligibility } = useCheckReviewEligibilityQuery(productId);

    const isEligible = eligibility?.isEligible;
    const eligibilityMessage = eligibility?.message;

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(reviewSchema),
        defaultValues: {
            rating: 0,
            comment: '',
        },
    });

    const rating = watch('rating');

    const onSubmit = async (data) => {
        if (!isEligible) {
            toast.error(eligibilityMessage || "You are not eligible to review this product.");
            return;
        }

        try {
            const formData = new FormData();
            formData.append('rating', data.rating);
            formData.append('comment', data.comment);

            images.forEach(image => {
                formData.append('images', image);
            });

            await createReview({ body: formData, productId }).unwrap();
            toast.success('Review submitted successfully!');
            reset();
            setImages([]);
            setPreviews([]);
            if (onReviewSubmitted) onReviewSubmitted();
        } catch (error) {
            toast.error(
                error?.data?.message || 'Failed to submit review'
            );
        }
    };

    if (checkingEligibility) {
        return <div className="p-6 text-center text-gray-500">Checking eligibility...</div>;
    }

    if (!isEligible) {
        return (
            <div className="bg-gray-50 dark:bg-zinc-900/50 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Write a Review
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {eligibilityMessage || "You must purchase and receive this product to write a review."}
                </p>
            </div>
        );
    }

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + images.length > 5) {
            toast.error('Maximum 5 images allowed');
            return;
        }

        setImages(prev => [...prev, ...files]);

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews(prev => [...prev, ...newPreviews]);
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-gray-50 dark:bg-zinc-900/50 p-6 rounded-xl border border-gray-200 dark:border-zinc-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Write a Review
            </h3>

            {/* Star Rating Input */}
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Rating
                </label>
                <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setValue('rating', star, { shouldValidate: true })}
                            onMouseEnter={() => setHoveredStar(star)}
                            onMouseLeave={() => setHoveredStar(0)}
                            className="p-1 focus:outline-none transition-transform hover:scale-110"
                        >
                            <CiStar
                                className={`w-6 h-6 ${star <= (hoveredStar || rating)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300 dark:text-gray-600'
                                    }`}
                            />
                        </button>
                    ))}
                </div>
                {errors.rating && (
                    <p className="text-sm text-red-500">{errors.rating.message}</p>
                )}
            </div>

            {/* Comment Input */}
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Review
                </label>
                <textarea
                    {...register('comment')}
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all resize-none"
                    placeholder="Share your thoughts about this product..."
                />
                {errors.comment && (
                    <p className="text-sm text-red-500">{errors.comment.message}</p>
                )}
            </div>

            {/* Image Upload */}
            <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Add Photos (Optional)
                </label>
                <div className="flex flex-wrap gap-3">
                    {previews.map((src, index) => (
                        <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 dark:border-zinc-700 group">
                            <img src={src} alt="Preview" className="w-full h-full object-cover" />
                            <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <FiX className="w-3 h-3" />
                            </button>
                        </div>
                    ))}

                    {images.length < 5 && (
                        <label className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 dark:border-zinc-700 flex flex-col items-center justify-center cursor-pointer hover:border-green-500 text-gray-400 hover:text-green-500 transition-colors">
                            <FiCamera className="w-6 h-6" />
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageChange}
                                className="hidden"
                            />
                        </label>
                    )}
                </div>
            </div>

            <div className="flex justify-end">
                <Button
                    type="submit"
                    disabled={isLoading}
                    loading={isLoading}
                    className="bg-green-600 hover:bg-green-700 text-white px-6"
                >
                    Submit Review
                </Button>
            </div>
        </form>
    );
};

export default ReviewForm;

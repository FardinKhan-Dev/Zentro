import React, { useState } from 'react';
import { CiStar, CiTrash } from "react-icons/ci";
import { format } from 'date-fns';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';
import { useDeleteReviewMutation } from '../../features/reviews/reviewApi';

const ReviewList = ({ reviews = [] }) => {
    if (!reviews || reviews.length === 0) {
        return (
            <div className="text-center py-9 bg-white dark:bg-zinc-900 rounded-xl border border-dashed border-gray-200 dark:border-zinc-800">
                <p className="text-gray-500 dark:text-gray-400">
                    No reviews yet. Be the first to review this product!
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {reviews.map((review) => (
                <ReviewItem
                    key={review._id}
                    review={review}
                />
            ))}
        </div>
    );
};

const ReviewItem = ({ review }) => {
    const { user } = useAuth();
    const [deleteReview, { isLoading: isDeleting }] = useDeleteReviewMutation();

    // Check if current user is the author OR an admin
    const canDelete = user && (user._id === review.user?._id || user.role === 'admin');

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this review?")) return;

        try {
            await deleteReview(review._id).unwrap();
            toast.success('Review deleted');
        } catch (error) {
            toast.error(error?.data?.message || 'Failed to delete review');
        }
    };

    return (
        <div className="flex gap-4 p-6 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl shadow-sm transition-all hover:shadow-md">
            {/* Avatar */}
            <div className="shrink-0">
                {review.user?.avatar?.url ? (
                    <img
                        src={review.user.avatar.url}
                        alt={review.user.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-100 dark:border-zinc-800"
                    />
                ) : (
                    <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-700 dark:text-green-400 font-bold text-lg border-2 border-transparent">
                        {review.user?.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-start justify-between">
                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                            {review.user?.name || 'Deleted User'}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                    <CiStar
                                        key={i}
                                        className={`w-4 h-4 ${i < review.rating
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-gray-300 dark:text-gray-600'
                                            }`}
                                    />
                                ))}
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                • {format(new Date(review.createdAt), 'MMM d, yyyy')}
                            </span>
                        </div>
                    </div>

                    {canDelete && (
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                            title="Delete Review"
                        >
                            <CiTrash className="w-4 h-4" />
                        </button>
                    )}
                </div>

                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                    {review.comment}
                </p>

                {/* Review Images */}
                {review.images && review.images.length > 0 && (
                    <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                        {review.images.map((img, index) => (
                            <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-100 dark:border-zinc-800 shrink-0 cursor-pointer group">
                                <img
                                    src={img.url}
                                    alt={`Review ${index + 1}`}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                    onClick={() => window.open(img.url, '_blank')}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewList;

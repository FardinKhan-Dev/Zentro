import React from 'react';
import { FaStar } from 'react-icons/fa';

const RatingStars = ({ rating = 0, maxRating = 5, size = 'medium', showNumber = false, count }) => {
    const sizes = {
        small: 'w-3 h-3',
        medium: 'w-4 h-4',
        large: 'w-5 h-5',
    };

    const textSizes = {
        small: 'text-xs',
        medium: 'text-sm',
        large: 'text-base',
    };

    return (
        <div className="flex items-center gap-1">
            <div className="flex items-center gap-0.5">
                {[...Array(maxRating)].map((_, i) => (
                    <FaStar
                        key={i}
                        className={`${sizes[size]} ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    />
                ))}
            </div>
            {showNumber && (
                <span className={`${textSizes[size]} text-gray-600 ml-1`}>
                    {rating.toFixed(1)}
                    {count && <span className="text-gray-400"> ({count})</span>}
                </span>
            )}
        </div>
    );
};

export default RatingStars;
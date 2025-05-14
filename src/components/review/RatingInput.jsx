'use client';

import React, { useState } from 'react';
import { FiStar } from 'react-icons/fi';

const RatingInput = ({ initialValue = 0, onChange, readOnly = false, size = 'md' }) => {
    const [rating, setRating] = useState(initialValue);
    const [hoverRating, setHoverRating] = useState(0);

    // Xử lý kích thước của sao
    const getStarSize = () => {
        switch (size) {
            case 'sm': return 'w-4 h-4';
            case 'lg': return 'w-8 h-8';
            case 'md':
            default: return 'w-6 h-6';
        }
    };

    const handleMouseEnter = (index) => {
        if (readOnly) return;
        setHoverRating(index);
    };

    const handleMouseLeave = () => {
        if (readOnly) return;
        setHoverRating(0);
    };

    const handleClick = (index) => {
        if (readOnly) return;

        // Nếu click vào sao đã chọn -> bỏ chọn (trở về 0)
        const newRating = rating === index ? 0 : index;
        setRating(newRating);
        if (onChange) onChange(newRating);
    };

    return (
        <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((index) => {
                const isActive = (hoverRating || rating) >= index;

                return (
                    <button
                        key={index}
                        type="button"
                        className={`focus:outline-none transition-colors duration-200 ${getStarSize()} ${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
                            }`}
                        onMouseEnter={() => handleMouseEnter(index)}
                        onMouseLeave={handleMouseLeave}
                        onClick={() => handleClick(index)}
                        aria-label={`Rate ${index} stars`}
                        disabled={readOnly}
                    >
                        <FiStar
                            className={`${getStarSize()} transition-colors duration-200 ${isActive
                                    ? 'text-yellow-400 dark:text-yellow-300 fill-yellow-400 dark:fill-yellow-300'
                                    : 'text-gray-300 dark:text-gray-600'
                                } ${readOnly ? '' : 'hover:text-yellow-500 dark:hover:text-yellow-400 group-hover:scale-110'}`}
                            strokeWidth={1.5}
                        />
                    </button>
                );
            })}
        </div>
    );
};

export default RatingInput; 
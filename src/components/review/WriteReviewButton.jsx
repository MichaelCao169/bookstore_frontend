// src/components/review/WriteReviewButton.jsx
'use client';

import React from 'react';
import { FiStar } from 'react-icons/fi';

const WriteReviewButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white rounded-md transition-colors duration-200 font-medium text-sm"
    >
      <FiStar className="mr-1.5" />
      Viết đánh giá
    </button>
  );
};

export default WriteReviewButton;
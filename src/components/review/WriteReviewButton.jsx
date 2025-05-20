'use client';

import React from 'react';
import { FiStar } from 'react-icons/fi';

const WriteReviewButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center px-5 py-2.5 bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white rounded-md transition-colors duration-200 font-medium text-sm shadow-sm hover:shadow"
    >
      <FiStar className="mr-2" />
      Viết đánh giá
    </button>
  );
};

export default WriteReviewButton;
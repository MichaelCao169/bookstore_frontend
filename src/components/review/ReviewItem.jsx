'use client';

import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import RatingInput from './RatingInput';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import Image from 'next/image';
import { useAuthStore } from '@/store/authStore';

const ReviewItem = ({ review, onEdit, onDelete }) => {
  const { user } = useAuthStore();
  const isOwnReview = user?.id === review.userId;

  // Format date
  const formattedDate = review.createdAt
    ? formatDistanceToNow(new Date(review.createdAt), {
      addSuffix: true,
      locale: vi,
    })
    : '';

  return (
    <div className="flex flex-col border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm">
      {/* Header với thông tin người dùng và ngày */}
      <div className="flex items-center mb-3">
        <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-gray-700 flex items-center justify-center text-orange-500 dark:text-orange-300 mr-3 overflow-hidden">
          {review.userAvatar ? (
            <Image
              src={review.userAvatar}
              alt={review.userName || 'Người dùng'}
              width={40}
              height={40}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-lg font-semibold">
              {(review.userName?.charAt(0) || '?').toUpperCase()}
            </span>
          )}
        </div>

        <div className="flex-1">
          <h4 className="font-medium text-gray-900 dark:text-gray-100">
            {review.userName || 'Người dùng ẩn danh'}
          </h4>
          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-0.5">
            {formattedDate}
            {review.isPurchased && (
              <span className="ml-2 px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded text-xs">
                Đã mua hàng
              </span>
            )}
          </div>
        </div>

        {/* Các nút thao tác (chỉ hiển thị với review của người đang đăng nhập) */}
        {isOwnReview && (
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(review)}
              className="p-1.5 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Chỉnh sửa đánh giá"
            >
              <FiEdit2 size={16} />
            </button>
            <button
              onClick={() => onDelete(review.reviewId)}
              className="p-1.5 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Xóa đánh giá"
            >
              <FiTrash2 size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Rating stars */}
      <div className="mb-2">
        <RatingInput initialValue={review.rating} readOnly={true} size="sm" />
      </div>

      {/* Nội dung đánh giá */}
      {review.comment && (
        <div className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-line">
          {review.comment}
        </div>
      )}
    </div>
  );
};

export default ReviewItem;
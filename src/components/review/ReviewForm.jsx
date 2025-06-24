'use client';

import React, { useState, useEffect } from 'react';
import { FiAlertTriangle, FiCheck, FiSend, FiX, FiLoader } from 'react-icons/fi';
import RatingInput from './RatingInput';
import axiosInstance from '@/lib/axiosInstance';
import { toast } from 'react-toastify';
import { useAuthStore } from '@/store/authStore';
import BrandSpinner from '@/components/ui/BrandSpinner';

const ReviewForm = ({
    productId,
    existingReview = null,
    onSuccess,
    onCancel,
    checkIfUserPurchased = false
}) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasPurchased, setHasPurchased] = useState(true);
    const [isCheckingPurchase, setIsCheckingPurchase] = useState(false);
    const [errors, setErrors] = useState({});

    // Nếu đang edit review, sử dụng dữ liệu từ review hiện có
    const isEditMode = Boolean(existingReview);

    // Lấy user hiện tại từ auth store
    const { user } = useAuthStore();

    useEffect(() => {
        if (existingReview) {
            setRating(existingReview.rating || 0);
            setComment(existingReview.comment || '');
        }

        // Kiểm tra người dùng đã mua sản phẩm chưa
        const verifyPurchase = async () => {
            if (!checkIfUserPurchased) return;

            try {
                setIsCheckingPurchase(true);
                const response = await axiosInstance.get(`/products/${productId}/verify-purchase`);
                setHasPurchased(response.data.hasPurchased);
            } catch (error) {
                console.error("Error verifying purchase:", error);
                setHasPurchased(false);
            } finally {
                setIsCheckingPurchase(false);
            }
        };

        if (checkIfUserPurchased && productId) {
            verifyPurchase();
        }
    }, [existingReview, productId, checkIfUserPurchased]);

    const validateForm = () => {
        const newErrors = {};

        if (!rating) {
            newErrors.rating = 'Vui lòng chọn số sao đánh giá';
        }

        if (comment && comment.length > 1000) {
            newErrors.comment = 'Nội dung đánh giá không được vượt quá 1000 ký tự';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRatingChange = (value) => {
        setRating(value);
        if (errors.rating) {
            setErrors(prev => ({ ...prev, rating: null }));
        }
    };

    const handleCommentChange = (e) => {
        setComment(e.target.value);
        if (errors.comment) {
            setErrors(prev => ({ ...prev, comment: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const reviewData = {
                rating,
                comment: comment.trim() || null,
            };

            let response;

            if (isEditMode) {
                // Cập nhật đánh giá
                response = await axiosInstance.put(
                    `/products/${productId}/reviews/${existingReview.reviewId}`,
                    reviewData
                );
                toast.success('Đánh giá đã được cập nhật thành công!');
            } else {
                // Tạo đánh giá mới
                response = await axiosInstance.post(
                    `/products/${productId}/reviews`,
                    reviewData
                );
                toast.success('Cảm ơn bạn đã đánh giá sản phẩm!');
            }

            // Reset form nếu đang tạo mới
            if (!isEditMode) {
                setRating(0);
                setComment('');
            }

            // Gọi callback thành công
            if (onSuccess) {
                onSuccess(response.data);
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            const errorMessage = error.response?.data?.message ||
                'Đã xảy ra lỗi khi gửi đánh giá. Vui lòng thử lại sau.';
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    }; if (isCheckingPurchase) {
        return (
            <div className="p-4 flex justify-center">
                <BrandSpinner
                    size="text-xl"
                    text="Đang kiểm tra..."
                    textSize="text-sm"
                    textColor="text-gray-600 dark:text-gray-300"
                />
            </div>
        );
    }

    if (checkIfUserPurchased && !hasPurchased) {
        return (
            <div className="p-4 border border-yellow-200 dark:border-yellow-900 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-lg flex items-center">
                <FiAlertTriangle className="flex-shrink-0 mr-2" />
                <p>Bạn cần mua và nhận sản phẩm này trước khi đánh giá.</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                {isEditMode ? 'Chỉnh sửa đánh giá' : 'Viết đánh giá'}
            </h3>

            {/* Rating input */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Số sao đánh giá <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center">
                    <RatingInput
                        initialValue={rating}
                        onChange={handleRatingChange}
                    />
                    <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">
                        {rating > 0 ? `${rating} sao` : 'Chọn đánh giá'}
                    </span>
                </div>
                {errors.rating && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.rating}</p>
                )}
            </div>

            {/* Comment textarea */}
            <div className="mb-4">
                <label htmlFor="review-comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nội dung đánh giá
                </label>
                <textarea
                    id="review-comment"
                    value={comment}
                    onChange={handleCommentChange}
                    rows={4}
                    placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex justify-between">
                    <span>Tối đa 1000 ký tự</span>
                    <span>{comment.length}/1000</span>
                </p>
                {errors.comment && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.comment}</p>
                )}
            </div>

            {/* Action buttons */}
            <div className="flex justify-end space-x-3">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 dark:focus:ring-offset-gray-800 flex items-center"
                        disabled={isSubmitting}
                    >
                        <FiX className="mr-1.5" /> Hủy
                    </button>
                )}
                <button
                    type="submit"
                    className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white flex items-center ${isSubmitting
                        ? 'bg-orange-400 dark:bg-orange-600 cursor-not-allowed'
                        : 'bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 dark:focus:ring-offset-gray-800'
                        }`}
                    disabled={isSubmitting}
                >                    {isSubmitting ? (
                    <>
                        <BrandSpinner size="sm" className="mr-1.5" />
                        Đang gửi...
                    </>
                ) : isEditMode ? (
                    <>
                        <FiCheck className="mr-1.5" />
                        Cập nhật
                    </>
                ) : (
                    <>
                        <FiSend className="mr-1.5" />
                        Gửi đánh giá
                    </>
                )}
                </button>
            </div>
        </form>
    );
};

export default ReviewForm; 
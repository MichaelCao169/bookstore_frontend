'use client';

import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '@/lib/axiosInstance';
import ReviewItem from './ReviewItem';
import WriteReviewButton from './WriteReviewButton';
import ReviewForm from './ReviewForm';
import Pagination from '@/components/ui/Pagination';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { FiLoader, FiAlertCircle, FiMessageSquare } from 'react-icons/fi';
import { BsChatLeft } from "react-icons/bs";
import { useAuthStore } from '@/store/authStore';
import { toast } from 'react-toastify';
import BrandSpinner from '@/components/ui/BrandSpinner';

// Component hiển thị khi đang tải dữ liệu
const LoadingState = () => (
  <div className="flex justify-center items-center py-8">
    <BrandSpinner size="sm" className="mr-2" />
    <span className="text-gray-600 dark:text-gray-300">Đang tải đánh giá...</span>
  </div>
);

// Component hiển thị khi không có đánh giá
const EmptyReviews = () => (
  <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
    <FiMessageSquare className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-3" />
    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">Chưa có đánh giá</h3>
    <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
      Hãy là người đầu tiên đánh giá sản phẩm này và chia sẻ trải nghiệm của bạn với những khách hàng khác.
    </p>
  </div>
);

// Component hiển thị khi có lỗi
const ErrorState = ({ message, onRetry }) => (
  <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
    <FiAlertCircle className="mx-auto h-12 w-12 text-red-500 mb-3" />
    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">Không thể tải đánh giá</h3>
    <p className="text-gray-500 dark:text-gray-400 mb-4">{message}</p>
    <button
      onClick={onRetry}
      className="px-4 py-2 bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white rounded-md transition-colors duration-200"
    >
      Thử lại
    </button>
  </div>
);

const ReviewList = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 5;

  const { isAuthenticated, user } = useAuthStore();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Lấy trang hiện tại từ URL query params
  useEffect(() => {
    const pageQuery = searchParams.get('reviewPage'); // Dùng param khác 'page' để tránh xung đột
    const page = parseInt(pageQuery, 10);
    if (!isNaN(page) && page > 0) {
      setCurrentPage(page);
    } else {
      setCurrentPage(1); // Mặc định trang 1
    }
  }, [searchParams]);

  // Lấy danh sách đánh giá
  const fetchReviews = useCallback(async (page = 1) => {
    if (!productId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get(`/products/${productId}/reviews`, {
        params: {
          page: page - 1, // Backend sử dụng 0-based page index 
          size: pageSize,
          sort: 'createdAt,desc' // Sort theo thời gian mới nhất
        }
      });

      const { content, totalElements, totalPages: totPages, number } = response.data;

      // Thêm thông tin đã mua hàng vào mỗi review
      const reviewsWithPurchaseInfo = content.map(review => ({
        ...review,
        isPurchased: true, // Giả sử tất cả đánh giá đều từ khách hàng đã mua hàng
      }));

      setReviews(reviewsWithPurchaseInfo);
      setTotalReviews(totalElements);
      setTotalPages(totPages);
      setCurrentPage(number + 1); // Convert lại về 1-based index

      // Tính rating trung bình
      if (content && content.length > 0) {
        const totalRating = content.reduce((sum, review) => sum + review.rating, 0);
        setAverageRating((totalRating / content.length).toFixed(1));
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError(err.response?.data?.message || 'Không thể tải đánh giá. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  // Fetch reviews khi component mount hoặc productId thay đổi
  useEffect(() => {
    fetchReviews(1); // Lấy trang đầu tiên
  }, [fetchReviews]);

  // Xử lý đánh giá mới được tạo hoặc cập nhật
  const handleReviewSubmitted = useCallback((newReview) => {
    setShowReviewForm(false);
    setEditingReview(null);
    // Refresh review list sau khi đã thêm/cập nhật review
    fetchReviews(1);
  }, [fetchReviews]);

  // Xử lý chỉnh sửa đánh giá
  const handleEditReview = (review) => {
    setEditingReview(review);
    setShowReviewForm(true);
  };

  // Xử lý xóa đánh giá
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) return;

    try {
      await axiosInstance.delete(`/products/${productId}/reviews/${reviewId}`);
      toast.success('Đã xóa đánh giá thành công');
      fetchReviews(1); // Refresh list sau khi xóa
    } catch (err) {
      console.error('Error deleting review:', err);
      toast.error(err.response?.data?.message || 'Không thể xóa đánh giá. Vui lòng thử lại sau.');
    }
  };

  // Xử lý thay đổi trang
  const handlePageChange = (newPage) => {
    fetchReviews(newPage);
  };

  // Kiểm tra xem người dùng hiện tại đã đánh giá sản phẩm này chưa
  const hasUserReviewed = reviews.some(review => review.userId === user?.id);

  // Render dựa trên state
  if (isLoading && !reviews.length) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => fetchReviews(currentPage)} />;
  }

  return (
    <div className="space-y-6 mt-2">
      {/* Tiêu đề và thống kê */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
            <BsChatLeft className="mr-2 text-orange-500 dark:text-orange-400" />
            Đánh giá từ khách hàng
            <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full text-sm">
              {totalReviews}
            </span>
          </h2>
          {/* <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
            <FiMessageSquare className="mr-2" /> Đánh giá từ khách hàng
            
          </h2> */}
          {totalReviews > 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Đánh giá trung bình: {averageRating} / 5
            </p>
          )}
        </div>

        {/* Nút viết đánh giá - chỉ hiển thị nếu user đã login và chưa đánh giá */}
        {isAuthenticated && !hasUserReviewed && !showReviewForm && (
          <div className="mt-4 md:mt-0 md:ml-4">
            <WriteReviewButton onClick={() => setShowReviewForm(true)} />
          </div>
        )}
      </div>

      {/* Form đánh giá (hiển thị khi click vào nút viết đánh giá) */}
      {showReviewForm && (
        <div className="mb-6">
          <ReviewForm
            productId={productId}
            existingReview={editingReview}
            onSuccess={handleReviewSubmitted}
            onCancel={() => {
              setShowReviewForm(false);
              setEditingReview(null);
            }}
            checkIfUserPurchased={true}
          />
        </div>
      )}

      {/* Danh sách đánh giá */}
      {reviews.length === 0 && !isLoading ? (
        <EmptyReviews />
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewItem
              key={review.reviewId}
              review={review}
              onEdit={handleEditReview}
              onDelete={handleDeleteReview}
            />
          ))}

          {/* Phân trang */}
          {totalPages > 1 && (
            <div className="pt-4 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewList;
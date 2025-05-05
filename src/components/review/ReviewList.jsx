// src/components/review/ReviewList.jsx
'use client'; // Cần client component để fetch data và xử lý state

import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '@/lib/axiosInstance'; // Import axios instance
import ReviewItem from './ReviewItem';
import Pagination from '@/components/ui/Pagination'; // Import pagination
import { usePathname, useSearchParams, useRouter } from 'next/navigation'; // Import hooks

const ReviewList = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalElements: 0,
    size: 5, // Số lượng review mỗi trang
  });

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Lấy trang hiện tại từ URL query params
  useEffect(() => {
    const pageQuery = searchParams.get('reviewPage'); // Dùng param khác 'page' để tránh xung đột
    const page = parseInt(pageQuery, 10);
    if (!isNaN(page) && page > 0) {
      setPagination(prev => ({ ...prev, currentPage: page }));
    } else {
      setPagination(prev => ({ ...prev, currentPage: 1 })); // Mặc định trang 1
    }
  }, [searchParams]);


  // Hàm fetch reviews
  const fetchReviews = useCallback(async (pageToFetch) => {
    if (!productId) return;
    setIsLoading(true);
    setError(null);
    console.log(`Fetching reviews for product ${productId}, page ${pageToFetch}`);

    try {
      const params = {
        page: pageToFetch - 1, // API dùng 0-based index
        size: pagination.size,
        sort: 'createdAt,desc', // Sắp xếp mới nhất trước
      };
      const response = await axiosInstance.get(`/products/${productId}/reviews`, { params });
      setReviews(response.data.content || []);
      setPagination(prev => ({
        ...prev,
        totalPages: response.data.totalPages || 0,
        totalElements: response.data.totalElements || 0,
        currentPage: pageToFetch // Cập nhật lại trang hiện tại sau khi fetch
      }));
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Could not load reviews.';
      // Không nên set lỗi 404 ở đây vì sản phẩm có thể tồn tại nhưng chưa có review
      if (err.response?.status !== 404) {
        setError(errorMessage);
      } else {
        setReviews([]); // Xóa reviews nếu sản phẩm 404 (dù không nên xảy ra nếu product detail đã load)
        setPagination(prev => ({ ...prev, totalPages: 0, totalElements: 0 }));
      }
    } finally {
      setIsLoading(false);
    }
  }, [productId, pagination.size]); // Dependencies

  // useEffect để fetch data khi trang hoặc productId thay đổi
  useEffect(() => {
    fetchReviews(pagination.currentPage);
  }, [pagination.currentPage, fetchReviews]); // Chạy lại khi trang thay đổi


  // Hàm xử lý khi chuyển trang trong Pagination component
  // Cần cập nhật URL để Server Component ở trang cha có thể nhận biết
  const handlePageChange = (newPage) => {
    console.log(`ReviewList: Changing to page ${newPage}`);
    // Chỉ cần cập nhật state currentPage của component này
    // useEffect ở trên sẽ tự động fetch lại dữ liệu
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };


  // --- Render Logic ---
  if (isLoading) {
    return <div className="text-center py-5">Loading reviews...</div>;
  }

  if (error) {
    return <div className="text-center py-5 text-red-600">Error: {error}</div>;
  }

  if (reviews.length === 0) {
    return <div className="text-center py-5 text-gray-500 dark:text-dark-text-secondary">Be the first to review this product!</div>;
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <ReviewItem key={review.reviewId} review={review} />
      ))}

      {/* Phân trang cho reviews */}
      {pagination.totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          {/* Truyền hàm xử lý riêng cho pagination review */}
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange} // Truyền hàm xử lý riêng
          />
        </div>
      )}
    </div>
  );
};

// Sửa lại component Pagination để nhận onPageChange (hoặc tạo PaginationReview riêng)
const PaginationReview = ({ currentPage, totalPages, onPageChange }) => {
  // ... (logic tạo pageNumbers tương tự Pagination cũ) ...
  const pageNumbers = [];
  const maxPagesToShow = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
  if (endPage - startPage + 1 < maxPagesToShow) { startPage = Math.max(1, endPage - maxPagesToShow + 1); }
  for (let i = startPage; i <= endPage; i++) { pageNumbers.push(i); }


  return (
    <nav aria-label="Review page navigation">
      <ul className="inline-flex items-center -space-x-px">
        {/* Nút Previous */}
        <li>
          <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} /* ... styling ... */ >Previous</button>
        </li>
        {/* ... (Các nút số trang, dùng button onClick) ... */}
        {pageNumbers.map((pageNumber) => (
          <li key={pageNumber}>
            <button onClick={() => onPageChange(pageNumber)} className={`px-3 py-1 border ... ${currentPage === pageNumber ? 'bg-orange-100 ...' : '...'}`}>
              {pageNumber}
            </button>
          </li>
        ))}
        {/* Nút Next */}
        <li>
          <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} /* ... styling ... */>Next</button>
        </li>
      </ul>
    </nav>
  );
};


export default ReviewList;
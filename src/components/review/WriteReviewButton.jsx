// src/components/review/WriteReviewButton.jsx
'use client';

import React from 'react';
import { FiEdit } from 'react-icons/fi';
// import { useAuth } from '@/contexts/AuthContext'; // Ví dụ
// import { useRouter } from 'next/navigation'; // Ví dụ

const WriteReviewButton = ({ productId }) => {
  // TODO: Lấy trạng thái đăng nhập và có thể cả thông tin user/lịch sử mua hàng
  // const { isAuthenticated, user } = useAuth();
  // const router = useRouter();
  // const hasPurchased = checkIfUserPurchasedProduct(user?.id, productId); // Cần logic này phía client hoặc API riêng

  const handleClick = () => {
    // TODO: Kiểm tra đăng nhập
    // if (!isAuthenticated) {
    //   router.push('/login'); // Chuyển đến trang đăng nhập
    //   return;
    // }

    // TODO: Kiểm tra xem đã mua hàng chưa (nếu logic check purchase ở client)
    // if (!hasPurchased) {
    //   alert("You need to purchase this item to write a review.");
    //   return;
    // }

    // TODO: Hiển thị form viết review (Modal hoặc trang riêng)
    alert(`TODO: Show write review form for product ${productId}`);
  };

  // TODO: Có thể ẩn nút này hoàn toàn nếu user chưa đăng nhập hoặc chưa mua hàng
  // if (!isAuthenticated /* || !hasPurchased */) {
  //   return null;
  // }

  return (
    <button
      onClick={handleClick}
      className='bg-white dark:bg-dark-surface border border-orange-500 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/30 px-4 py-2 rounded text-sm font-medium flex items-center gap-2'
    >
      <FiEdit size={16}/> Write a review
    </button>
  );
};

export default WriteReviewButton;
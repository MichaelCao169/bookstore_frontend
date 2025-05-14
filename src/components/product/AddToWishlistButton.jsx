// src/components/product/AddToWishlistButton.jsx
'use client';

import React, { useState } from 'react';
import { FiHeart, FiLoader } from 'react-icons/fi'; // Thêm FiLoader
import axiosInstance from '@/lib/axiosInstance';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useWishlistStore } from '@/store/wishlistStore';
const AddToWishlistButton = ({ productId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const router = useRouter();
  const incrementWishlistCount = useWishlistStore((state) => state.incrementItemCount);
  const handleAddToWishlist = async () => {
    if (!isAuthenticated) {
      toast.warn('Vui lòng đăng nhập để thêm sản phẩm vào danh sách yêu thích.');
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }

    setIsLoading(true);

    try {
      // Gọi API POST đến endpoint mới
      const response = await axiosInstance.post(`/wishlist/products/${productId}`);

      console.log('Add to wishlist response:', response.data);
      toast.success('Đã thêm sản phẩm vào danh sách yêu thích!');
      incrementWishlistCount();

    } catch (error) {
      // console.error('Failed to add to wishlist:', error.response?.data || error.message);
      // Xử lý lỗi trùng lặp
      if (error.response?.status === 409) { // 409 Conflict
        toast.info('Sản phẩm đã có trong danh sách yêu thích của bạn.');
      } else {
        const errorMessage = error.response?.data?.message || error.response?.data || 'Không thể thêm sản phẩm vào danh sách yêu thích.';
        toast.error(`Lỗi: ${errorMessage}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleAddToWishlist}
      disabled={isLoading} // Disable khi đang loading
      className="w-full sm:w-auto px-4 py-3 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-wait"
      title="Thêm vào danh sách yêu thích"
      aria-label="Thêm vào danh sách yêu thích"
    >
      {isLoading ? (
        <FiLoader className="animate-spin" size={18} />
      ) : (
        <FiHeart size={18} />
      )}
      <span className="hidden sm:inline">
        {isLoading ? 'Đang thêm...' : 'Thêm vào danh sách yêu thích'}
      </span>
    </button>
  );
};

export default AddToWishlistButton;
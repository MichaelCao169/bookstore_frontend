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
      toast.warn('Please login to add items to your wishlist.');
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }

    setIsLoading(true);

    try {
      // Gọi API POST đến endpoint mới
      const response = await axiosInstance.post(`/wishlist/products/${productId}`);

      console.log('Add to wishlist response:', response.data); 
      toast.success('Product added to wishlist!');
      incrementWishlistCount();

    } catch (error) {
      // console.error('Failed to add to wishlist:', error.response?.data || error.message);
       // Xử lý lỗi trùng lặp
       if (error.response?.status === 409) { // 409 Conflict
           toast.info('Product is already in your wishlist.');
       } else {
            const errorMessage = error.response?.data?.message || error.response?.data || 'Could not add product to wishlist.';
            toast.error(`Error: ${errorMessage}`);
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
      title="Add to Wishlist"
      aria-label="Add to Wishlist"
    >
      {isLoading ? (
          <FiLoader className="animate-spin" size={18}/>
      ) : (
          <FiHeart size={18} /> 
      )}
      <span className="hidden sm:inline">
          {isLoading ? 'Adding...' : 'Add to Wishlist'}
      </span>
    </button>
  );
};

export default AddToWishlistButton;
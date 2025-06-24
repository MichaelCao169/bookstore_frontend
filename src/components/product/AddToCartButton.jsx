// src/components/product/AddToCartButton.jsx
'use client';

import React, { useState } from 'react'; // Thêm useState cho loading button
import { FiShoppingCart, FiLoader } from 'react-icons/fi'; // Thêm icon loading
import axiosInstance from '@/lib/axiosInstance'; // Import axios
import { useAuthStore } from '@/store/authStore'; // Import để kiểm tra auth
import { useRouter } from 'next/navigation'; // Import để redirect
import { toast } from 'react-toastify'; // Import toast
import { useCartStore } from '@/store/cartStore';
import BrandSpinner from '@/components/ui/BrandSpinner';

const AddToCartButton = ({ productId, quantity, isInStock, className }) => {
  const [isLoading, setIsLoading] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated); // Lấy trạng thái đăng nhập
  const router = useRouter();
  const fetchCartCount = useCartStore((state) => state.fetchCartCount);

  const handleAddToCart = async () => {
    console.log('AddToCartButton: Attempting to add to cart...', { productId, isAuthenticated, isInStock });

    // 1. Kiểm tra đăng nhập
    if (!isAuthenticated) {
      console.log('AddToCartButton: User not authenticated');
      toast.warn('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.');
      // Redirect đến trang login, nhớ kèm theo URL hiện tại để quay lại
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }

    // 2. Kiểm tra tồn kho (mặc dù nút đã disable, kiểm tra lại cho chắc)
    if (!isInStock || (quantity !== undefined && quantity <= 0)) {
      console.log('AddToCartButton: Product out of stock');
      toast.error('Sản phẩm này đã hết hàng.');
      return;
    }

    setIsLoading(true); // Bắt đầu loading
    console.log('AddToCartButton: Starting API call...');

    try {
      const response = await axiosInstance.post('/cart/items', {
        productId: productId,
        quantity: quantity || 1,
      });

      console.log('AddToCartButton: API success', response.data);
      toast.success('Đã thêm sản phẩm vào giỏ hàng!');

      // Refresh cart count
      await fetchCartCount();
    } catch (error) {
      console.error('AddToCartButton: API error', error.response?.data || error);

      if (error.response?.status === 409) {
        toast.info('Sản phẩm đã có trong giỏ hàng. Vui lòng mở giỏ hàng để điều chỉnh số lượng.');
      } else {
        const errorMessage = error.response?.data?.message || error.response?.data || 'Không thể thêm sản phẩm vào giỏ hàng.';
        toast.error(`Lỗi: ${errorMessage}`);
      }
    } finally {
      setIsLoading(false); // Kết thúc loading
    }
  };

  const isDisabled = !isInStock || (quantity !== undefined && quantity <= 0);

  return (
    <button
      onClick={handleAddToCart}
      disabled={isDisabled || isLoading} // Disable cả khi đang loading
      className={`
        flex items-center justify-center px-4 py-2 rounded-md font-medium transition-all duration-200 text-sm
        ${isDisabled || isLoading
          ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
          : 'bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white shadow-md hover:shadow-lg transform hover:scale-105'
        }
        ${className}
      `}
    >
      {isLoading ? (
        <>
          <BrandSpinner size="sm" className="mr-2" /> {/* Icon loading */}
          <span>Đang thêm...</span>
        </>
      ) : (
        <>
          <FiShoppingCart className="mr-2" />
          <span>{isDisabled ? 'Hết hàng' : 'Thêm vào giỏ'}</span>
        </>
      )}
    </button>
  );
};

export default AddToCartButton;
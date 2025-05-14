// src/components/product/AddToCartButton.jsx
'use client';

import React, { useState } from 'react'; // Thêm useState cho loading button
import { FiShoppingCart, FiLoader } from 'react-icons/fi'; // Thêm icon loading
import axiosInstance from '@/lib/axiosInstance'; // Import axios
import { useAuthStore } from '@/store/authStore'; // Import để kiểm tra auth
import { useRouter } from 'next/navigation'; // Import để redirect
import { toast } from 'react-toastify'; // Import toast
import { useCartStore } from '@/store/cartStore';
const AddToCartButton = ({ productId, stockQuantity }) => {
  const [isLoading, setIsLoading] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated); // Lấy trạng thái đăng nhập
  const router = useRouter();
  const fetchCartCount = useCartStore((state) => state.fetchCartCount);
  const handleAddToCart = async () => {
    // 1. Kiểm tra đăng nhập
    if (!isAuthenticated) {
      toast.warn('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.');
      // Redirect đến trang login, nhớ kèm theo URL hiện tại để quay lại
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }

    // 2. Kiểm tra tồn kho (mặc dù nút đã disable, kiểm tra lại cho chắc)
    if (stockQuantity <= 0) {
      toast.error('Sản phẩm này đã hết hàng.');
      return;
    }

    setIsLoading(true); // Bắt đầu loading

    try {
      // 3. Gọi API thêm vào giỏ hàng
      const response = await axiosInstance.post('/cart/items', {
        productId: productId,
        quantity: 1, // Mặc định thêm 1 sản phẩm mỗi lần click
      });

      toast.success('Đã thêm sản phẩm vào giỏ hàng!');
      // *** GỌI FETCH CART COUNT ĐỂ CẬP NHẬT STATE ***
      if (fetchCartCount) await fetchCartCount();

    } catch (error) {
      console.error('Failed to add to cart:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || error.response?.data || 'Không thể thêm sản phẩm vào giỏ hàng.';
      toast.error(`Lỗi: ${errorMessage}`); // Thông báo lỗi
    } finally {
      setIsLoading(false); // Kết thúc loading
    }
  };

  const isDisabled = stockQuantity <= 0;

  return (
    <button
      disabled={isDisabled || isLoading} // Disable cả khi đang loading
      onClick={handleAddToCart}
      className={`w-full sm:w-auto flex-grow px-6 py-3 rounded font-semibold text-white transition-colors duration-200 flex items-center justify-center ${isDisabled
        ? 'bg-gray-400 cursor-not-allowed'
        : isLoading
          ? 'bg-orange-400 cursor-wait' // Màu nhạt hơn khi loading
          : 'bg-orange-500 hover:bg-orange-600'
        }`}
      aria-label={isDisabled ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
    >
      {isLoading ? (
        <FiLoader className="animate-spin mr-2" size={18} /> // Icon loading
      ) : (
        <FiShoppingCart className="inline mr-2" size={18} />
      )}
      {isDisabled ? 'Hết hàng' : isLoading ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
    </button>
  );
};

export default AddToCartButton;
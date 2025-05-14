// src/app/(main)/cart/page.jsx
'use client'; // Bắt buộc vì cần state và fetch dữ liệu client-side

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiTrash2, FiShoppingCart, FiLoader, FiAlertCircle, FiArrowLeft, FiImage, FiMinus, FiPlus, FiChevronRight } from 'react-icons/fi'; // Icons
import axiosInstance from '@/lib/axiosInstance'; // Axios instance
import { useAuthStore } from '@/store/authStore'; // Kiểm tra auth nếu cần (dù route đã được bảo vệ)
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify'; // Để hiển thị thông báo
import { useCartStore } from '@/store/cartStore';

const placeholderImage = '/sample_books.jpg';

// Component để hiển thị loading hoặc lỗi
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-16">
    <div className="text-center">
      <FiLoader className="animate-spin text-orange-500 text-4xl mx-auto mb-4" />
      <p className="text-gray-600 dark:text-gray-300">Đang tải giỏ hàng...</p>
    </div>
  </div>
);

const ErrorMessage = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <FiAlertCircle size={48} className="mb-4 text-red-500" />
    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Đã xảy ra lỗi</h2>
    <p className="text-gray-600 dark:text-gray-400 mb-4">{message}</p>
    <button
      onClick={() => window.location.reload()} // Đơn giản là tải lại trang
      className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors shadow-sm"
    >
      Thử lại
    </button>
  </div>
);

// Component hiển thị giỏ hàng trống
const EmptyCart = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center max-w-2xl mx-auto my-8 border border-gray-200 dark:border-gray-700">
    <div className="bg-orange-50 dark:bg-gray-700 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
      <FiShoppingCart size={48} className="text-orange-500 dark:text-orange-400" />
    </div>
    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">Giỏ hàng của bạn đang trống</h2>
    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
      Hãy thêm sản phẩm vào giỏ hàng để tiếp tục quá trình mua sắm của bạn.
    </p>
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
      <Link href="/products" className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors flex items-center w-full sm:w-auto justify-center">
        <FiArrowLeft className="mr-2" /> Tiếp tục mua sắm
      </Link>
      <Link href="/" className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors flex items-center w-full sm:w-auto justify-center">
        Về trang chủ
      </Link>
    </div>
  </div>
);

// Component hiển thị mỗi sản phẩm trong giỏ hàng
const CartItem = ({ item, onUpdateQuantity, onRemoveItem, updatingItemId, removingItemId }) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= item.productStockQuantity) {
      onUpdateQuantity(item.cartItemId, newQuantity, item.quantity);
    }
  };

  return (
    <div className={`flex flex-col sm:flex-row items-center bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-300 ${updatingItemId === item.cartItemId || removingItemId === item.cartItemId ? 'opacity-60' : 'hover:shadow-md'
      }`}>
      {/* Ảnh sản phẩm */}
      <div className="w-28 h-36 flex-shrink-0 mb-4 sm:mb-0 sm:mr-6 relative bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden">
        {imageError || !item.productImageUrl ? (
          <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
            <FiImage size={36} />
          </div>
        ) : (
          <Image
            src={item.productImageUrl}
            alt={item.productTitle || 'Bìa sách'}
            fill
            style={{ objectFit: 'contain' }}
            sizes="(max-width: 640px) 100px, 120px"
            priority={false}
            onError={handleImageError}
          />
        )}
      </div>

      {/* Thông tin sản phẩm */}
      <div className="flex-grow text-center sm:text-left mb-4 sm:mb-0">
        <Link href={`/products/${item.productId}`} className="font-semibold text-lg text-gray-800 dark:text-gray-200 hover:text-orange-600 dark:hover:text-orange-400 line-clamp-2 transition-colors">
          {item.productTitle}
        </Link>

        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {item.productAuthor ? `Tác giả: ${item.productAuthor}` : 'Tác giả: Chưa cập nhật'}
        </p>

        <p className="text-md font-medium text-orange-600 dark:text-orange-400 mt-2">
          {item.productPrice?.toLocaleString('vi-VN')} ₫
        </p>

        {item.productStockQuantity < 5 && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
            Chỉ còn {item.productStockQuantity} sản phẩm
          </p>
        )}
      </div>

      {/* Điều chỉnh số lượng */}
      <div className="flex items-center space-x-2 mb-4 sm:mb-0 sm:mx-6">
        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
          <button
            onClick={() => handleQuantityChange(item.quantity - 1)}
            disabled={updatingItemId === item.cartItemId || item.quantity <= 1}
            className="p-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Giảm số lượng"
          >
            <FiMinus size={16} />
          </button>

          <input
            type="number"
            min="1"
            max={item.productStockQuantity}
            value={item.quantity}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              if (!isNaN(value) && value >= 1 && value <= item.productStockQuantity) {
                onUpdateQuantity(item.cartItemId, value, item.quantity);
              }
            }}
            disabled={updatingItemId === item.cartItemId || removingItemId === item.cartItemId}
            className="w-12 text-center py-1 border-x border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none"
            aria-label="Số lượng"
          />

          <button
            onClick={() => handleQuantityChange(item.quantity + 1)}
            disabled={updatingItemId === item.cartItemId || item.quantity >= item.productStockQuantity}
            className="p-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Tăng số lượng"
          >
            <FiPlus size={16} />
          </button>
        </div>

        {/* Hiển thị spinner khi đang cập nhật */}
        {updatingItemId === item.cartItemId && (
          <FiLoader className="animate-spin text-orange-500 ml-2" />
        )}
      </div>

      {/* Thành tiền và nút xóa */}
      <div className="flex flex-col items-center sm:items-end">
        <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
          {(item.subtotal || (item.quantity * item.productPrice))?.toLocaleString('vi-VN')} ₫
        </p>
        <button
          onClick={() => onRemoveItem(item.cartItemId, item.productTitle)}
          disabled={updatingItemId === item.cartItemId || removingItemId !== null}
          className="text-red-500 hover:text-red-700 dark:hover:text-red-400 text-sm flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed p-1"
          title="Xóa sản phẩm"
        >
          {removingItemId === item.cartItemId ? (
            <FiLoader className="animate-spin w-4 h-4 mr-1" />
          ) : (
            <FiTrash2 className="mr-1" />
          )}
          {removingItemId === item.cartItemId ? 'Đang xóa...' : 'Xóa'}
        </button>
      </div>
    </div>
  );
};

const CartPage = () => {
  const [cartData, setCartData] = useState(null); // Lưu CartDTO từ API
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [removingItemId, setRemovingItemId] = useState(null);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAuthLoading = useAuthStore((state) => state.isLoading);
  const logoutAction = useAuthStore((state) => state.logout);
  const router = useRouter();

  // *** LẤY ACTIONS TỪ CART STORE ***
  const setCartCount = useCartStore(state => state.setInitialCount);
  const fetchCartCount = useCartStore(state => state.fetchCartCount);
  const clearCartCount = useCartStore(state => state.clearCartCount);
  const decrementItemCount = useCartStore(state => state.decrementItemCount);
  // Hàm fetch dữ liệu giỏ hàng và cập nhật count
  const fetchCart = useCallback(async () => {
    console.log('Fetching cart data...');
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/cart');
      const fetchedCart = response.data || { items: [], itemCount: 0 };
      setCartData(fetchedCart);
      // *** CẬP NHẬT COUNT TRONG STORE SAU KHI FETCH ***
      setCartCount(fetchedCart.items?.length ?? 0); // Cập nhật số loại sản phẩm

      if (fetchedCart.items?.length === 0) {
        console.log("Cart is empty after fetch.");
        // Không cần redirect ở đây, để phần render xử lý
      }
    } catch (err) {
      console.error('Failed to fetch cart:', err);
      // Kiểm tra lỗi 401 (có thể xảy ra nếu token hết hạn ngay lúc fetch)
      if (err.response?.status === 401) {
        toast.error("Phiên đăng nhập hết hạn.");
        logoutAction();
        clearCartCount(); // Xóa count khi logout
        router.push('/login?redirect=/cart');
      } else {
        setError(err.response?.data?.message || err.message || 'Không thể tải giỏ hàng.');
        clearCartCount(); // Xóa count nếu không tải được giỏ hàng
      }
      setCartData(null);
    } finally {
      setIsLoading(false);
    }
  }, [router, logoutAction, setCartCount, clearCartCount]);

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      fetchCart();
    } else if (!isAuthLoading && !isAuthenticated) {
      router.replace('/login?redirect=/cart');
    }
  }, [isAuthenticated, isAuthLoading, fetchCart, router]);

  const handleUpdateQuantity = useCallback(async (cartItemId, newQuantity, currentQuantity) => {
    // Không làm gì nếu số lượng không đổi hoặc đang cập nhật item khác
    if (newQuantity === currentQuantity || updatingItemId !== null) {
      return;
    }
    // Kiểm tra số lượng hợp lệ (dù input đã có min/max)
    if (isNaN(newQuantity) || newQuantity < 1) {
      toast.error("Số lượng không hợp lệ.");
      // Có thể reset input về giá trị cũ (currentQuantity)
      return;
    }

    setUpdatingItemId(cartItemId);
    try {
      await axiosInstance.put(`/cart/items/${cartItemId}`, { quantity: newQuantity });
      toast.success("Cập nhật số lượng thành công!");
      // Fetch lại cart để đảm bảo đồng bộ (bao gồm cả việc cập nhật count)
      await fetchCart();
    } catch (error) {
      console.error(`Failed to update quantity for item ${cartItemId}:`, error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || error.response?.data || 'Không thể cập nhật số lượng.';
      toast.error(`Lỗi: ${errorMessage}`);
      // Nếu lỗi, có thể cần fetch lại cart để đồng bộ lại số lượng đúng từ server
      fetchCart(); // Fetch lại để hiển thị số lượng đúng trước khi lỗi
    } finally {
      setUpdatingItemId(null); // Kết thúc trạng thái cập nhật cho item này
    }
  }, [fetchCart, updatingItemId]); // Thêm updatingItemId vào dependencies của useCallback

  // --- Implement handleRemoveItem ---
  const handleRemoveItem = useCallback(async (cartItemId, productTitle) => {
    // Xác nhận trước khi xóa (tùy chọn)
    if (!window.confirm(`Bạn có chắc muốn xóa "${productTitle}" khỏi giỏ hàng?`)) {
      return;
    }

    setRemovingItemId(cartItemId);

    try {
      // Gọi API DELETE
      await axiosInstance.delete(`/cart/items/${cartItemId}`);
      toast.success(`Đã xóa "${productTitle}" khỏi giỏ hàng.`);
      // Fetch lại dữ liệu giỏ hàng
      await fetchCart();
    } catch (error) {
      console.error(`Failed to remove item ${cartItemId}:`, error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || error.response?.data || 'Không thể xóa sản phẩm.';
      toast.error(`Lỗi: ${errorMessage}`);
      fetchCart();
    } finally {
      setRemovingItemId(null);
    }
  }, [fetchCart, removingItemId]);

  // Hàm xóa toàn bộ giỏ hàng
  const handleClearCart = useCallback(async () => {
    if (!window.confirm("Bạn có chắc muốn xóa tất cả sản phẩm khỏi giỏ hàng?")) {
      return;
    }
    // Có thể dùng state loading riêng nếu muốn nút bấm có spinner
    // setIsLoadingClear(true);
    try {
      await axiosInstance.delete('/cart'); // Gọi API xóa cart backend
      toast.success("Đã xóa toàn bộ giỏ hàng.");

      // *** SỬA LẠI CÁCH RESET STATE cartData ***
      // Sử dụng số 0 thông thường cho totalPrice và totalItems
      setCartData({ items: [], itemCount: 0, totalPrice: 0, totalItems: 0 });

      clearCartCount(); // Reset count trong store
    } catch (error) {
      console.error("Failed to clear cart:", error.response?.data || error.message);
      toast.error("Lỗi: Không thể xóa giỏ hàng.");
      // Nếu xóa thất bại, nên fetch lại để lấy trạng thái đúng
      fetchCart(); // Gọi fetch lại nếu xóa lỗi
    } finally {
      // setIsLoadingClear(false);
    }
  }, [clearCartCount, fetchCart]);

  // --- Render Logic ---

  // Ưu tiên kiểm tra loading của auth store trước
  if (isAuthLoading) {
    return <LoadingSpinner />;
  }

  // Nếu không loading auth nhưng chưa đăng nhập, useEffect đã redirect, có thể return null hoặc loading
  if (!isAuthenticated) {
    return <div className="text-center py-10">Redirecting to login...</div>; // Hoặc null
  }

  // Nếu đã đăng nhập, kiểm tra loading của fetch cart
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Hiển thị lỗi fetch cart
  if (error) {
    return <ErrorMessage message={error} />;
  }

  // Xử lý trường hợp không có cart data
  if (!cartData) {
    return <div className="text-center py-10">Could not load cart information.</div>;
  }

  // Hiển thị khi giỏ hàng trống
  if (!cartData.items || cartData.items.length === 0) {
    return <EmptyCart />;
  }

  // Hiển thị giỏ hàng khi có sản phẩm
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-4 sm:mb-0">
            <FiShoppingCart className="text-orange-500 mr-3" size={24} />
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Giỏ hàng của bạn</h1>
            <span className="ml-3 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-2.5 py-0.5 rounded-full text-sm font-medium">
              {cartData.totalItems} sản phẩm
            </span>
          </div>

          <div className="flex items-center">
            <Link
              href="/products"
              className="text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 text-sm flex items-center mr-4 transition-colors"
            >
              <FiArrowLeft className="mr-1" /> Tiếp tục mua sắm
            </Link>

            <button
              onClick={handleClearCart}
              className="text-red-500 hover:text-red-700 dark:hover:text-red-400 text-sm flex items-center transition-colors"
              disabled={isLoading}
            >
              <FiTrash2 className="mr-1" /> Xóa tất cả
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Danh sách sản phẩm trong giỏ hàng */}
          <div className="lg:col-span-2 space-y-4">
            {cartData.items.map((item) => (
              <CartItem
                key={item.cartItemId}
                item={item}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
                updatingItemId={updatingItemId}
                removingItemId={removingItemId}
              />
            ))}
          </div>

          {/* Tóm tắt giỏ hàng */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 sticky top-24">
              <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200">
                Tóm tắt đơn hàng
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span>Tạm tính ({cartData.totalItems} sản phẩm)</span>
                  <span>{cartData.totalPrice?.toLocaleString('vi-VN')} ₫</span>
                </div>

                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span>Phí vận chuyển</span>
                  <span className="text-green-600 dark:text-green-400">Miễn phí</span>
                </div>

                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span>Thuế (10%)</span>
                  <span>{(cartData.totalPrice * 0.1)?.toLocaleString('vi-VN')} ₫</span>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex justify-between font-bold text-lg text-gray-800 dark:text-gray-200 mb-6">
                  <span>Tổng cộng</span>
                  <span>{(cartData.totalPrice * 1.1)?.toLocaleString('vi-VN')} ₫</span>
                </div>

                <Link
                  href="/checkout"
                  className="block w-full text-center bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-md font-semibold transition-colors shadow-sm flex items-center justify-center"
                >
                  Tiến hành thanh toán <FiChevronRight className="ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
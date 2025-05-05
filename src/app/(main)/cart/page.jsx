// src/app/(main)/cart/page.jsx
'use client'; // Bắt buộc vì cần state và fetch dữ liệu client-side

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiTrash2, FiShoppingCart, FiLoader, FiAlertCircle } from 'react-icons/fi'; // Icons
import axiosInstance from '@/lib/axiosInstance'; // Axios instance
import { useAuthStore } from '@/store/authStore'; // Kiểm tra auth nếu cần (dù route đã được bảo vệ)
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify'; // Để hiển thị thông báo
import { useCartStore } from '@/store/cartStore';
// Component để hiển thị loading hoặc lỗi
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-10">
    <FiLoader className="animate-spin text-orange-500 text-4xl" />
  </div>
);

const ErrorMessage = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-10 text-center text-red-600">
    <FiAlertCircle size={40} className="mb-2" />
    <p>Lỗi khi tải giỏ hàng:</p>
    <p className="text-sm">{message}</p>
    <button
      onClick={() => window.location.reload()} // Đơn giản là tải lại trang
      className="mt-4 bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 text-sm"
    >
      Thử lại
    </button>
  </div>
);

const CartPage = () => {
  const [cartData, setCartData] = useState(null); // Lưu CartDTO từ API
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAuthLoading = useAuthStore((state) => state.isLoading); 
  const logoutAction = useAuthStore((state) => state.logout);
  const [removingItemId, setRemovingItemId] = useState(null);
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
        logout();
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
    return (
      <div className="text-center py-16">
        <FiShoppingCart size={60} className="mx-auto text-gray-300 dark:text-gray-600" />
        <h2 className="mt-4 text-xl font-semibold text-gray-700 dark:text-dark-text">Giỏ hàng của bạn đang trống</h2>
        <p className="mt-2 text-gray-500 dark:text-dark-text-secondary">Hãy thêm sản phẩm vào giỏ để tiếp tục mua sắm nhé!</p>
        <Link
          href="/products"
          className="mt-6 inline-block bg-orange-500 text-white px-6 py-2.5 rounded hover:bg-orange-600 transition-colors"
        >
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  // Hiển thị giỏ hàng khi có sản phẩm
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-dark-text">Giỏ hàng của bạn</h1>
           {/* Nút xóa tất cả */}
           {cartData && cartData.items.length > 0 && (
                <button
                    onClick={handleClearCart}
                    className="text-sm text-red-500 hover:text-red-700 dark:hover:text-red-400 flex items-center"
                    disabled={isLoading} // Disable khi đang loading/xóa
                >
                    <FiTrash2 className="mr-1" /> Xóa tất cả
                </button>
           )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Danh sách sản phẩm trong giỏ (Cột chính) */}
        <div className="lg:col-span-2 space-y-4">
          {cartData.items.map((item) => (
            <div key={item.cartItemId} className={`flex flex-col sm:flex-row items-center bg-white dark:bg-dark-surface p-4 rounded-lg shadow border dark:border-gray-700 transition-opacity ${updatingItemId === item.cartItemId ? 'opacity-50' : ''}`}>
              {/* Ảnh sản phẩm */}
              <div className="w-24 h-32 flex-shrink-0 mb-4 sm:mb-0 sm:mr-4 relative overflow-hidden rounded">
                <Image
                  src={'/sample_books.jpg'} // Dùng ảnh thật hoặc placeholder
                  alt={item.productTitle || 'Book cover'}
                  fill
                  style={{ objectFit: 'contain' }}
                  sizes="100px"
                  onError={(e) => { e.target.src = '/sample_books.jpg'; }}
                />
              </div>
              {/* Thông tin sản phẩm và số lượng */}
              <div className="flex-grow text-center sm:text-left mb-4 sm:mb-0">
                <Link href={`/products/${item.productId}`} className="font-semibold text-lg hover:text-orange-600 dark:hover:text-orange-400 dark:text-dark-text line-clamp-2">
                  {item.productTitle}
                </Link>
                <p className="text-sm text-gray-500 dark:text-dark-text-secondary mt-1">by {item.productAuthor || 'N/A'}</p>
                <p className="text-md font-medium text-orange-600 dark:text-orange-400 mt-1">
                  ${item.productPrice?.toFixed(2)}
                </p>
              </div>
              {/* Điều chỉnh số lượng */}
              <div className="flex items-center space-x-2 mb-4 sm:mb-0 sm:mx-6">
                <label htmlFor={`quantity-${item.cartItemId}`} className="sr-only">Quantity</label>
                <input
                  id={`quantity-${item.cartItemId}`}
                  type="number"
                  min="1"
                  max={item.productStockQuantity || 1}
                  defaultValue={item.quantity} // Dùng defaultValue thay vì value để tránh re-render không cần thiết
                  // Dùng onBlur hoặc thêm debounce cho onChange để gọi API
                  onBlur={(e) => { // Gọi API khi người dùng rời khỏi input
                    const newQuantity = parseInt(e.target.value, 10);
                    handleUpdateQuantity(item.cartItemId, newQuantity, item.quantity);
                  }}
                  onKeyDown={(e) => { // Gọi API khi nhấn Enter
                    if (e.key === 'Enter') {
                      const newQuantity = parseInt(e.target.value, 10);
                      handleUpdateQuantity(item.cartItemId, newQuantity, item.quantity);
                    }
                  }}
                  disabled={updatingItemId === item.cartItemId || removingItemId === item.cartItemId}
                  className="w-16 rounded border border-gray-300 dark:border-gray-600 py-1 px-2 text-center dark:bg-gray-700 dark:text-white focus:ring-orange-500 focus:border-orange-500"
                  aria-describedby={`stock-${item.cartItemId}`}
                />
                <span id={`stock-${item.cartItemId}`} className="text-xs text-gray-500">(Max: {item.productStockQuantity})</span>
                {/* Hiển thị spinner nhỏ khi đang cập nhật */}
                {(updatingItemId === item.cartItemId || removingItemId === item.cartItemId) && <FiLoader className="animate-spin text-orange-500 ml-2"/>}
               </div>

              {/* Thành tiền và nút xóa */}
              <div className="flex flex-col items-center sm:items-end">
                <p className="text-lg font-semibold mb-2">
                  ${item.subtotal?.toFixed(2)}
                </p>
                <button
                   onClick={() => handleRemoveItem(item.cartItemId, item.productTitle)}
                   disabled={updatingItemId === item.cartItemId || removingItemId !== null}
                  className="text-red-500 hover:text-red-700 dark:hover:text-red-400 text-sm flex items-center"
                  title="Remove item"
                >
                  {removingItemId === item.cartItemId ? <FiLoader className="animate-spin w-4 h-4"/> : <FiTrash2 className="mr-1" />}
                   {removingItemId === item.cartItemId ? '' : 'Remove'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Tóm tắt giỏ hàng (Cột phụ) */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-dark-surface p-6 rounded-lg shadow border dark:border-gray-700 sticky top-24"> {/* Sticky để cố định khi cuộn */}
            <h2 className="text-xl font-semibold mb-4 border-b pb-2 dark:border-gray-600">Tóm tắt đơn hàng</h2>
            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-dark-text-secondary">Tổng số sản phẩm ({cartData.totalItems} items)</span>
                {/* Có thể tính tạm tổng tiền trước thuế ở đây */}
                <span className="font-medium">${cartData.totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-dark-text-secondary">Phí vận chuyển</span>
                <span className="font-medium text-green-600">FREE</span> {/* Hoặc tính toán sau */}
              </div>
              {/* Thêm các dòng khác nếu cần (thuế, giảm giá...) */}
            </div>
            <div className="border-t pt-4 dark:border-gray-600">
              <div className="flex justify-between font-bold text-lg">
                <span>Tổng cộng</span>
                <span>${cartData.totalPrice.toFixed(2)}</span>
              </div>
            </div>
            <Link
              href="/checkout" // Link đến trang checkout
              className="mt-6 block w-full text-center bg-orange-600 text-white px-6 py-3 rounded font-semibold hover:bg-orange-700 transition-colors"
            >
              Tiến hành Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
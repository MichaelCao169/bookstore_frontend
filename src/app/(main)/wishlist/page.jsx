// src/app/(main)/wishlist/page.jsx
'use client'; // Cần client component để fetch và xử lý tương tác

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation'; // Import hooks nếu cần cho phân trang wishlist (thường không cần)
import axiosInstance from '@/lib/axiosInstance';
import { useAuthStore } from '@/store/authStore';
import { useWishlistStore } from '@/store/wishlistStore'; // Import wishlist store
import { toast } from 'react-toastify';
import { FiHeart, FiTrash2, FiLoader, FiAlertCircle, FiArrowLeft, FiGrid } from 'react-icons/fi';
import { BsCartPlus } from 'react-icons/bs';
import ProductCard from '@/components/ui/ProductCard'; // Tái sử dụng ProductCard
import Image from 'next/image';
import BrandSpinner from '@/components/ui/BrandSpinner';

// Component hiển thị loading
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-16">
    <BrandSpinner
      size="text-4xl"
      text="Đang tải danh sách yêu thích..."
      textColor="text-gray-600 dark:text-gray-300"
    />
  </div>
);

// Component hiển thị lỗi
const ErrorMessage = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <FiAlertCircle size={48} className="mb-4 text-red-500" />
    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Đã xảy ra lỗi</h2>
    <p className="text-gray-600 dark:text-gray-400 mb-4">{message}</p>
    <button
      onClick={onRetry}
      className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors shadow-sm"
    >
      Thử lại
    </button>
  </div>
);

// Component hiển thị danh sách yêu thích trống
const EmptyWishlist = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center max-w-2xl mx-auto my-8 border border-gray-200 dark:border-gray-700">
    <div className="bg-red-50 dark:bg-gray-700 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
      <FiHeart size={48} className="text-red-500 dark:text-red-400" />
    </div>
    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">Danh sách yêu thích của bạn đang trống</h2>
    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
      Hãy thêm sản phẩm vào danh sách yêu thích để dễ dàng theo dõi và mua sau này.
    </p>
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
      <Link href="/products" className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors flex items-center w-full sm:w-auto justify-center">
        <FiArrowLeft className="mr-2" /> Khám phá sách
      </Link>
      <Link href="/" className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors flex items-center w-full sm:w-auto justify-center">
        Về trang chủ
      </Link>
    </div>
  </div>
);

// Component chính của trang Wishlist
const WishlistPage = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removingItemId, setRemovingItemId] = useState(null);
  const [view, setView] = useState('grid'); // 'grid' hoặc 'list'

  // Lấy state và actions từ stores
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAuthLoading = useAuthStore((state) => state.isLoading);
  const logoutAction = useAuthStore((state) => state.logout);
  const setWishlistCount = useWishlistStore((state) => state.setInitialCount);
  const decrementWishlistCount = useWishlistStore((state) => state.decrementItemCount);

  const router = useRouter();

  // Hàm fetch dữ liệu wishlist
  const fetchWishlist = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/wishlist');
      const fetchedData = response.data || { items: [], itemCount: 0 };
      setWishlistItems(fetchedData.items || []);
      setWishlistCount(fetchedData.items?.length ?? 0);
    } catch (err) {
      console.error('Lỗi khi tải danh sách yêu thích:', err);
      if (err.response?.status === 401) {
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        logoutAction();
        setWishlistCount(0);
        router.push('/login?redirect=/wishlist');
      } else {
        setError(err.response?.data?.message || err.message || 'Không thể tải danh sách yêu thích.');
        setWishlistCount(0);
      }
      setWishlistItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [router, logoutAction, setWishlistCount]);

  // Fetch wishlist khi component được tạo
  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      fetchWishlist();
    } else if (!isAuthLoading && !isAuthenticated) {
      router.replace('/login?redirect=/wishlist');
    }
  }, [isAuthenticated, isAuthLoading, fetchWishlist, router]);

  // Hàm xóa sản phẩm khỏi wishlist
  const handleRemoveFromWishlist = useCallback(async (productId, productTitle) => {
    if (removingItemId) return;

    if (!window.confirm(`Bạn có chắc muốn xóa "${productTitle}" khỏi danh sách yêu thích?`)) {
      return;
    }

    setRemovingItemId(productId);

    try {
      await axiosInstance.delete(`/wishlist/products/${productId}`);
      toast.success(`Đã xóa "${productTitle}" khỏi danh sách yêu thích.`);
      setWishlistItems(prevItems => prevItems.filter(item => item.id !== productId));
      decrementWishlistCount();
    } catch (error) {
      console.error(`Lỗi khi xóa sản phẩm ${productId} khỏi danh sách yêu thích:`, error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || error.response?.data || 'Không thể xóa sản phẩm.';
      toast.error(`Lỗi: ${errorMessage}`);
    } finally {
      setRemovingItemId(null);
    }
  }, [removingItemId, decrementWishlistCount]);

  // Hàm xóa tất cả sản phẩm khỏi wishlist
  const handleClearWishlist = useCallback(async () => {
    if (!window.confirm("Bạn có chắc muốn xóa tất cả sản phẩm khỏi danh sách yêu thích?")) {
      return;
    }

    setIsLoading(true);
    try {
      await axiosInstance.delete('/wishlist');
      toast.success("Đã xóa tất cả sản phẩm khỏi danh sách yêu thích.");
      setWishlistItems([]);
      setWishlistCount(0);
    } catch (error) {
      console.error("Lỗi khi xóa danh sách yêu thích:", error.response?.data || error.message);
      toast.error("Lỗi: Không thể xóa danh sách yêu thích.");
      fetchWishlist();
    } finally {
      setIsLoading(false);
    }
  }, [fetchWishlist, setWishlistCount]);

  // Chức năng thêm vào giỏ hàng
  const handleAddToCart = useCallback(async (productId, productTitle) => {
    try {
      await axiosInstance.post('/cart/items', {
        productId: productId,
        quantity: 1
      });
      toast.success(`Đã thêm "${productTitle}" vào giỏ hàng!`);
    } catch (error) {
      console.error('Lỗi khi thêm vào giỏ hàng:', error.response?.data || error);
      if (error.response?.status === 409) {
        toast.info('Sản phẩm đã có trong giỏ hàng.');
      } else {
        const errorMessage = error.response?.data?.message || error.response?.data || 'Không thể thêm sản phẩm vào giỏ hàng.';
        toast.error(`Lỗi: ${errorMessage}`);
      }
    }
  }, []);

  // Render theo trạng thái
  if (isAuthLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <div className="text-center py-10 text-gray-600 dark:text-gray-400">Đang chuyển hướng đến trang đăng nhập...</div>;
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchWishlist} />;
  }

  if (wishlistItems.length === 0) {
    return <EmptyWishlist />;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-4 sm:mb-0">
            <FiHeart className="text-red-500 mr-3" size={24} />
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Danh sách yêu thích</h1>
            <span className="ml-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2.5 py-0.5 rounded-full text-sm font-medium">
              {wishlistItems.length} sản phẩm
            </span>
          </div>

          <div className="flex items-center">
            <Link
              href="/products"
              className="text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 text-sm flex items-center mr-4 transition-colors"
            >
              <FiArrowLeft className="mr-1" /> Tiếp tục mua sắm
            </Link>

            <button
              onClick={handleClearWishlist}
              className="text-red-500 hover:text-red-700 dark:hover:text-red-400 text-sm flex items-center transition-colors"
              disabled={isLoading}
            >
              <FiTrash2 className="mr-1" /> Xóa tất cả
            </button>
          </div>
        </div>

        <div className="flex justify-end items-center mb-4">
          <div className="flex space-x-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-md">
            <button
              onClick={() => setView('grid')}
              className={`p-2 rounded ${view === 'grid'
                ? 'bg-white dark:bg-gray-600 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              aria-label="Chế độ lưới"
              title="Chế độ lưới"
            >
              <FiGrid size={18} />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-2 rounded ${view === 'list'
                ? 'bg-white dark:bg-gray-600 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              aria-label="Chế độ danh sách"
              title="Chế độ danh sách"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        {view === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlistItems.map((product) => (
              <div key={product.id} className={`relative group transition-opacity duration-300 ${removingItemId === product.id ? 'opacity-50 pointer-events-none' : ''}`}>
                <ProductCard product={product} />
                <div className="absolute top-2 left-2 flex space-x-2 z-20">
                  <button
                    onClick={() => handleRemoveFromWishlist(product.id, product.title)}
                    disabled={removingItemId === product.id}
                    className={`p-2 rounded-full shadow-md transition-colors z-10 opacity-0 group-hover:opacity-100 ${removingItemId === product.id
                      ? 'bg-gray-400 cursor-wait text-white'
                      : 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white'
                      }`}
                    title="Xóa khỏi danh sách yêu thích"                  >
                    {removingItemId === product.id ? <BrandSpinner size="xs" /> : <FiTrash2 size={16} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {wishlistItems.map((product) => (
              <div
                key={product.id}
                className={`flex flex-col sm:flex-row items-center bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-300 ${removingItemId === product.id ? 'opacity-60' : 'hover:shadow-md'
                  }`}
              >
                {/* Ảnh sản phẩm */}
                <div className="w-28 h-36 flex-shrink-0 mb-4 sm:mb-0 sm:mr-6 relative bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden">
                  {!product.imageUrl ? (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                      </svg>
                    </div>
                  ) : (
                    <Link href={`/products/${product.id}`}>
                      <Image
                        src={product.imageUrl}
                        alt={product.title || 'Bìa sách'}
                        fill
                        style={{ objectFit: 'contain' }}
                        sizes="(max-width: 640px) 100px, 120px"
                        priority={false}
                        className="transition-transform duration-300 hover:scale-105"
                      />
                    </Link>
                  )}
                </div>

                {/* Thông tin sản phẩm */}
                <div className="flex-grow text-center sm:text-left mb-4 sm:mb-0">
                  <Link
                    href={`/products/${product.id}`}
                    className="font-semibold text-lg text-gray-800 dark:text-gray-100 hover:text-orange-600 dark:hover:text-orange-400 line-clamp-2 transition-colors"
                  >
                    {product.title}
                  </Link>

                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {product.author ? `Tác giả: ${product.author}` : 'Tác giả: Chưa cập nhật'}
                  </p>

                  <p className="text-md font-medium text-orange-600 dark:text-orange-400 mt-2">
                    {product.price?.toLocaleString('vi-VN')} ₫
                  </p>

                  {product.stockQuantity === 0 ? (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">Hết hàng</p>
                  ) : product.stockQuantity < 5 ? (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                      Chỉ còn {product.stockQuantity} sản phẩm
                    </p>
                  ) : null}
                </div>

                {/* Các nút thao tác */}
                <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3">
                  <button
                    onClick={() => handleAddToCart(product.id, product.title)}
                    disabled={product.stockQuantity === 0}
                    className={`px-4 py-2 rounded-md flex items-center transition-colors ${product.stockQuantity === 0
                      ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      : 'bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white'
                      }`}
                  >
                    <BsCartPlus className="mr-2" size={16} />
                    <span className="text-sm">Thêm vào giỏ</span>
                  </button>

                  <button
                    onClick={() => handleRemoveFromWishlist(product.id, product.title)}
                    disabled={removingItemId === product.id}
                    className="text-red-500 hover:text-red-700 dark:hover:text-red-400 text-sm flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Xóa khỏi danh sách yêu thích"                  >
                    {removingItemId === product.id ? (
                      <BrandSpinner size="xs" className="mr-1" />
                    ) : (
                      <FiTrash2 className="mr-1" />
                    )}
                    {removingItemId === product.id ? 'Đang xóa...' : 'Xóa'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
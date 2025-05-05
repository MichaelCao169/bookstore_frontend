// src/app/(main)/wishlist/page.jsx
'use client'; // Cần client component để fetch và xử lý tương tác

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation'; // Import hooks nếu cần cho phân trang wishlist (thường không cần)
import axiosInstance from '@/lib/axiosInstance';
import { useAuthStore } from '@/store/authStore';
import { useWishlistStore } from '@/store/wishlistStore'; // Import wishlist store
import { toast } from 'react-toastify';
import { FiHeart, FiTrash2, FiLoader, FiAlertCircle } from 'react-icons/fi';
import ProductCard from '@/components/ui/ProductCard'; // Tái sử dụng ProductCard

// Components Loading/Error
const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-10">
        <FiLoader className="animate-spin text-orange-500 text-4xl" />
    </div>
);
const ErrorMessage = ({ message, onRetry }) => (
     <div className="flex flex-col items-center justify-center py-10 text-center text-red-600">
         <FiAlertCircle size={40} className="mb-2"/>
        <p>Lỗi khi tải danh sách yêu thích:</p>
        <p className="text-sm">{message}</p>
        {onRetry && (
             <button
                onClick={onRetry}
                className="mt-4 bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 text-sm"
            >
                Thử lại
            </button>
        )}
    </div>
);


// Component chính của trang Wishlist
const WishlistPage = () => {
  const [wishlistItems, setWishlistItems] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removingItemId, setRemovingItemId] = useState(null);

  // Lấy state và actions từ stores riêng lẻ
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAuthLoading = useAuthStore((state) => state.isLoading);
  const logoutAction = useAuthStore((state) => state.logout); 
  const setWishlistCount = useWishlistStore((state) => state.setInitialCount);
  const decrementWishlistCount = useWishlistStore((state) => state.decrementItemCount);

  const router = useRouter();

  // Hàm fetch dữ liệu wishlist
  const fetchWishlist = useCallback(async () => {
    console.log('Fetching wishlist data...');
    setIsLoading(true); // Set loading khi bắt đầu fetch
    setError(null);
    try {
      const response = await axiosInstance.get('/wishlist');
      const fetchedData = response.data || { items: [], itemCount: 0 };
      setWishlistItems(fetchedData.items || []); // Chỉ lưu mảng items vào state local
      // Cập nhật count trong store global
      setWishlistCount(fetchedData.items?.length ?? 0);
      console.log('Wishlist data received:', fetchedData.items);
    } catch (err) {
      console.error('Failed to fetch wishlist:', err);
      if (err.response?.status === 401) {
         toast.error("Phiên đăng nhập hết hạn.");
         logoutAction();
         setWishlistCount(0); // Reset count khi logout
         router.push('/login?redirect=/wishlist');
      } else {
          setError(err.response?.data?.message || err.message || 'Không thể tải danh sách yêu thích.');
          setWishlistCount(0); // Reset count nếu lỗi
      }
      setWishlistItems([]); // Đặt về mảng rỗng nếu lỗi
    } finally {
      setIsLoading(false); // Kết thúc loading sau khi fetch xong (thành công hoặc lỗi)
    }
  }, [router, logoutAction, setWishlistCount]); // Thêm dependencies


  // useEffect để fetch wishlist
  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      fetchWishlist();
    } else if (!isAuthLoading && !isAuthenticated) {
      router.replace('/login?redirect=/wishlist');
    }
  }, [isAuthenticated, isAuthLoading, fetchWishlist, router]); 


  // Hàm xóa item khỏi wishlist
  const handleRemoveFromWishlist = useCallback(async (productId, productTitle) => {
     if (removingItemId) return;

     if (!window.confirm(`Bạn có chắc muốn xóa "${productTitle}" khỏi danh sách yêu thích?`)) {
         return;
     }

     setRemovingItemId(productId);
     console.log(`Removing product ${productId} from wishlist`);

     try {
         await axiosInstance.delete(`/wishlist/products/${productId}`);
         toast.success(`Đã xóa "${productTitle}" khỏi danh sách yêu thích.`);
         // Cập nhật state client và store
         setWishlistItems(prevItems => prevItems.filter(item => item.id !== productId));
         decrementWishlistCount(); // Giảm count trong store
     } catch (error) {
         console.error(`Failed to remove product ${productId} from wishlist:`, error.response?.data || error.message);
         const errorMessage = error.response?.data?.message || error.response?.data || 'Không thể xóa sản phẩm.';
         toast.error(`Lỗi: ${errorMessage}`);
         // Không cần fetch lại nếu chỉ cập nhật state client
     } finally {
          setRemovingItemId(null);
     }
  }, [removingItemId, decrementWishlistCount]); 


  // --- Render Logic ---
   if (isAuthLoading) {
     return <LoadingSpinner />;
   }
    if (!isAuthenticated) {
       return <div className="text-center py-10">Redirecting to login...</div>;
   }
   if (isLoading) { // Chỉ hiển thị loading nếu đang fetch wishlist
        return <LoadingSpinner />;
   }
   if (error) {
     return <ErrorMessage message={error} onRetry={fetchWishlist} />;
   }


  // --- Hiển thị Wishlist ---
  const currentItemCount = wishlistItems.length; // Lấy count từ state local đã cập nhật

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
         <FiHeart className="text-orange-500 mr-3" size={32} />
         <h1 className="text-3xl font-bold text-gray-800 dark:text-dark-text">Danh sách Yêu thích</h1>
         {currentItemCount > 0 && ( // Dùng count từ state local
            <span className="ml-3 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 px-2.5 py-0.5 rounded-full text-sm font-medium">
                {currentItemCount} {currentItemCount === 1 ? 'item' : 'items'}
            </span>
         )}
      </div>

      {wishlistItems.length === 0 ? (
        // Hiển thị khi wishlist trống
        <div className="text-center py-16 border rounded-lg bg-gray-50 dark:bg-dark-surface dark:border-gray-700">
           {/* ... JSX wishlist trống ... */}
           <FiHeart size={60} className="mx-auto text-gray-300 dark:text-gray-600" />
           <h2 className="mt-4 text-xl font-semibold text-gray-700 dark:text-dark-text">Danh sách yêu thích trống</h2>
           <p className="mt-2 text-gray-500 dark:text-dark-text-secondary">Lưu lại những cuốn sách bạn quan tâm để xem lại sau nhé!</p>
           <Link href="/products" /* ... */ > Khám phá Sách </Link>
        </div>
      ) : (
        // Hiển thị lưới sản phẩm yêu thích
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlistItems.map((product) => ( // Dùng mảng wishlistItems từ state
             <div key={product.id} className={`relative group transition-opacity ${removingItemId === product.id ? 'opacity-50 pointer-events-none' : ''}`}> {/* Thêm pointer-events-none khi xóa */}
                  <ProductCard product={product} />
                  {/* Nút xóa */}
                  <button
                      onClick={() => handleRemoveFromWishlist(product.id, product.title)}
                      disabled={removingItemId === product.id}
                      className={`absolute top-2 right-2 p-1.5 rounded-full transition-all duration-200 ease-in-out z-10 ${removingItemId === product.id ? 'bg-gray-400 cursor-wait' : 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-400 dark:hover:bg-red-800/70'}`}
                      title="Remove from Wishlist"
                  >
                     {removingItemId === product.id ? <FiLoader className="animate-spin w-4 h-4"/> : <FiTrash2 size={16} />}
                  </button>
             </div>
          ))}
        </div>
      )}
       {/* Wishlist thường không cần phân trang */}
    </div>
  );
};

export default WishlistPage;
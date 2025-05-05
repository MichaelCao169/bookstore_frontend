'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { FiShoppingCart, FiUser, FiLogOut, FiLogIn, FiUserPlus, FiHeart, FiSun, FiMoon } from 'react-icons/fi';
import axiosInstance from '@/lib/axiosInstance';
import { toast } from 'react-toastify';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
const Navbar = () => {

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const logoutAction = useAuthStore((state) => state.logout); // Đổi tên để tránh trùng
  const isLoading = useAuthStore((state) => state.isLoading);
  const cartItemCount = useCartStore((state) => state.itemCount);
  const wishlistItemCount = useWishlistStore((state) => state.itemCount);
  // Thêm state để quản lý trạng thái hiển thị của dropdown
  const [showDropdown, setShowDropdown] = useState(false);

  const router = useRouter();

  // --- CẬP NHẬT HÀM LOGOUT ---
  const handleLogout = async () => {
    console.log('Navbar: Initiating logout...');
    // Hiển thị loading hoặc disable nút nếu cần
    try {
      // 1. Gọi API Logout của Backend
      // Backend sẽ xử lý việc xóa refresh token trong DB và gửi header xóa cookie
      const response = await axiosInstance.post('/auth/logout');
      console.log('Logout API response:', response.data); // Thường chỉ là thông báo thành công
      toast.success("Bạn đã đăng xuất thành công.");

    } catch (error) {
      // Lỗi khi gọi API logout (ví dụ: mạng lỗi, backend lỗi 500)
      console.error('Logout API call failed:', error.response || error);
      // VẪN TIẾN HÀNH LOGOUT PHÍA CLIENT DÙ API LỖI
      toast.error("Đã xảy ra lỗi khi đăng xuất phía server, nhưng bạn sẽ được đăng xuất khỏi trình duyệt này.");
    } finally {
      // 2. Gọi action logout của Zustand store (Luôn thực hiện bước này)
      // Hành động này sẽ xóa accessToken, user khỏi state và localStorage
      logoutAction();
      console.log('Navbar: Client state cleared.');

      // 3. Chuyển hướng về trang chủ
      router.push('/');
      // Có thể dùng router.refresh() nếu muốn đảm bảo server component nhận biết sự thay đổi trạng thái
      // router.refresh();
    }
  };

  // Không render gì nếu đang load trạng thái auth ban đầu
  if (isLoading) {
    return (
      <nav className="bg-white dark:bg-dark-surface shadow-md sticky top-0 z-50 animate-pulse">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center h-[65px]">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        </div>
      </nav>
    );
  }


  return (
    <nav className="bg-white dark:bg-dark-surface shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-orange-600 dark:text-orange-400">
          AtomicBooks
        </Link>

        {/* Links */}
        <div className="hidden md:flex space-x-6 items-center">
          <Link href="/" className="text-gray-600 dark:text-dark-text-secondary hover:text-orange-500 dark:hover:text-orange-400">Home</Link>
          <Link href="/products" className="text-gray-600 dark:text-dark-text-secondary hover:text-orange-500 dark:hover:text-orange-400">Products</Link>
        </div>

        {/* Icons & Actions */}
        <div className="flex items-center space-x-4">



          {/* Giỏ hàng */}
          <Link href="/cart" className="relative text-gray-600 dark:text-dark-text-secondary hover:text-orange-500 dark:hover:text-orange-400">
            <FiShoppingCart size={24} />
            {isAuthenticated && cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartItemCount > 9 ? '9+' : cartItemCount}
              </span>
            )}
          </Link>

          {/* Wishlist (Chỉ hiển thị khi đã đăng nhập) */}
          {isAuthenticated && (
            <Link href="/wishlist" className="relative text-gray-600 dark:text-dark-text-secondary hover:text-orange-500 dark:hover:text-orange-400">
              <FiHeart size={24} />
              {wishlistItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {wishlistItemCount > 9 ? '9+' : wishlistItemCount}
                </span>
              )}
            </Link>
          )}

          {/* User Profile/Login/Register */}
          {isAuthenticated && user ? (
            <div className="relative">
              {/* Sử dụng onClick để toggle dropdown thay vì chỉ dùng hover */}
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                onMouseEnter={() => setShowDropdown(true)}
                className="flex items-center text-gray-600 dark:text-dark-text-secondary hover:text-orange-500 dark:hover:text-orange-400 focus:outline-none"
              >
                <FiUser size={24} />
                <span className="ml-2 hidden md:inline">{user.name}</span>
              </button>

              {/* Dropdown menu với padding phía trên để tạo "cầu nối" giữa button và menu */}
              {showDropdown && (
                <div
                  className="absolute right-0 w-48 bg-white dark:bg-dark-surface rounded-md shadow-lg py-1 border dark:border-gray-700 z-50"
                  onMouseLeave={() => setShowDropdown(false)}
                  style={{ marginTop: '5px' }}
                >
                  {/* Phần "cầu nối" ẩn để giữ dropdown hiển thị khi di chuyển chuột */}
                  <div className="absolute h-3 w-full top-[-12px]"></div>

                  <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-dark-text hover:bg-orange-50 dark:hover:bg-gray-700">
                    My Profile
                  </Link>
                  <Link href="/orders/my-history" className="block px-4 py-2 text-sm text-gray-700 dark:text-dark-text hover:bg-orange-50 dark:hover:bg-gray-700">
                    Order History
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-dark-text hover:bg-orange-50 dark:hover:bg-gray-700"
                  >
                    <FiLogOut className="inline mr-2" /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Nếu chưa đăng nhập
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link href="/login" className="text-gray-600 dark:text-dark-text-secondary hover:text-orange-500 dark:hover:text-orange-400 flex items-center px-2 py-2 sm:px-0 sm:py-0">
                <FiLogIn className="md:hidden" size={22} /> <span className="hidden md:inline">Login</span>
              </Link>
              <Link href="/register" className="bg-orange-500 text-white px-3 sm:px-4 py-2 rounded hover:bg-orange-600 text-sm flex items-center">
                <FiUserPlus className="md:hidden" size={18} /> <span className="hidden md:inline">Register</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
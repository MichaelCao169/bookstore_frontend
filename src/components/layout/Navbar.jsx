'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useRouter, usePathname } from 'next/navigation';
import { FiShoppingCart, FiUser, FiLogOut, FiLogIn, FiUserPlus, FiHeart, FiSun, FiMoon, FiMenu, FiX, FiSearch, FiBook, FiPackage, FiList, FiSettings, FiChevronDown } from 'react-icons/fi';
import { LiaAtomSolid } from 'react-icons/lia';
import axiosInstance from '@/lib/axiosInstance';
import { toast } from 'react-toastify';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import UserAvatar from '@/components/ui/UserAvatar';
import Image from 'next/image';

// Hàm formatImageUrl để xử lý URL avatar
const formatImageUrl = (url) => {
  if (!url) return '/default-avatar.png';

  console.log("Formatting navbar image URL:", url);

  // Nếu đã là URL tương đối
  if (url.startsWith('/') && !url.startsWith('/api')) {
    return url;
  }

  // Xử lý URL đầy đủ từ backend (http://localhost:8080/...)
  if (url.includes('localhost:8080') && url.includes('/avatars/')) {
    return url;
  }

  if (url.includes('/uploads/avatars/')) {
    // Chuyển đổi thành URL đầy đủ đến backend
    return `http://localhost:8080${url.startsWith('/api') ? '' : '/api'}${url}?t=${new Date().getTime()}`;
  }

  // Trường hợp khác, giữ nguyên URL
  return url;
};

// Hàm kiểm tra có hiển thị avatar hay không
const shouldRenderAvatar = (user) => {
  if (!user || typeof user !== 'object') return false;
  const avatarUrl = user.avatarUrl || user.avatar;
  return avatarUrl && typeof avatarUrl === 'string' && !avatarUrl.includes('default-avatar');
};

const Navbar = ({ theme = 'light', toggleTheme }) => {
  // Kiểm tra xem toggleTheme có phải là hàm
  console.log("Navbar received toggleTheme:", typeof toggleTheme);
  console.log("Navbar received theme:", theme);

  // Xử lý toggle theme đơn giản
  const handleToggleTheme = () => {
    if (typeof toggleTheme === 'function') {
      console.log("Calling provided toggleTheme function");
      console.log("Current theme before toggle:", theme);
      console.log("Dark class before toggle:", document.documentElement.classList.contains('dark'));
      toggleTheme();
    } else {
      console.error("Theme toggle function not provided to Navbar component");
    }
  };

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const logoutAction = useAuthStore((state) => state.logout);
  const isLoading = useAuthStore((state) => state.isLoading);
  const cartItemCount = useCartStore((state) => state.itemCount);
  const wishlistItemCount = useWishlistStore((state) => state.itemCount);
  const setWishlistProductIds = useWishlistStore((state) => state.setWishlistProductIds);
  const setWishlistCount = useWishlistStore((state) => state.setInitialCount);

  // Kiểm tra nếu user có role admin
  const isAdmin = user?.roles?.some(role => role === 'ROLE_ADMIN');
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const searchRef = useRef(null);

  // Fetch wishlist khi user đã đăng nhập
  useEffect(() => {
    const fetchWishlistData = async () => {
      if (isAuthenticated && !isLoading) {
        try {
          const response = await axiosInstance.get('/wishlist');
          const fetchedData = response.data || { items: [], itemCount: 0 };
          setWishlistCount(fetchedData.items?.length ?? 0);
          // Set danh sách productId vào store
          const productIds = (fetchedData.items || []).map(item => item.productId);
          setWishlistProductIds(productIds);
        } catch (error) {
          console.error('Failed to fetch wishlist data in navbar:', error);
          // Don't show error toast in navbar, just reset counts
          setWishlistCount(0);
          setWishlistProductIds([]);
        }
      } else if (!isAuthenticated && !isLoading) {
        // Xóa wishlist khi chưa đăng nhập
        setWishlistCount(0);
        setWishlistProductIds([]);
      }
    };

    fetchWishlistData();
  }, [isAuthenticated, isLoading, setWishlistCount, setWishlistProductIds]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get('/api/categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Debounced search
  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        try {
          const response = await axiosInstance.get('/api/products/search', {
            params: {
              keyword: searchQuery.trim(),
              size: 5 // Giới hạn 5 kết quả cho dropdown
            }
          });
          setSearchResults(response.data.content || []);
          setShowSearchDropdown(true);
        } catch (error) {
          console.error('Error searching products:', error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowSearchDropdown(false);
      }
    }, 300); // 300ms debounce    return () => clearTimeout(searchTimeout);
  }, [searchQuery]);

  // Đóng search dropdown khi click ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    console.log('Navbar: Khởi tạo đăng xuất...');
    try {
      const response = await axiosInstance.post('/auth/logout');
      console.log('Kết quả API đăng xuất:', response.data);
      toast.success("Bạn đã đăng xuất thành công.");
    } catch (error) {
      console.error('Lỗi khi gọi API đăng xuất:', error.response || error);
      toast.error("Đã xảy ra lỗi khi đăng xuất phía server, nhưng bạn sẽ được đăng xuất khỏi trình duyệt này.");
    } finally {
      logoutAction();
      console.log('Navbar: Đã xóa trạng thái client.');
      router.push('/');
    }
  };
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowSearchDropdown(false);
      setMobileMenuOpen(false);
    }
  };

  const handleSearchResultClick = (productId) => {
    router.push(`/products/${productId}`);
    setSearchQuery('');
    setShowSearchDropdown(false);
    setMobileMenuOpen(false);
  };

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Hiển thị skeleton khi đang tải dữ liệu
  if (isLoading) {
    return (
      <nav className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50 animate-pulse">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center h-[65px]">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50 transition-colors duration-300">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-orange-600 dark:text-orange-400 flex items-center">
            <LiaAtomSolid className="mr-2" />
            AtomikBooks
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">            {/* Search Form */}
            <div ref={searchRef} className="relative">
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  placeholder="Tìm kiếm sách..."
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 pr-10 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 w-[320px] transition-all duration-300 focus:w-[380px]"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                  {isSearching ? (
                    <div className="animate-spin w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full"></div>
                  ) : (
                    <FiSearch />
                  )}
                </button>
              </form>              {/* Search Dropdown */}
              {showSearchDropdown && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 shadow-xl rounded-md border border-gray-200 dark:border-gray-600 py-2 z-50 max-h-80 overflow-y-auto">
                  {searchResults.map((product) => (
                    <div
                      key={product.productId}
                      onClick={() => handleSearchResultClick(product.productId)}
                      className="flex items-center gap-4 px-4 py-4 hover:bg-orange-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                    >
                      <div className="w-16 h-20 flex-shrink-0 relative rounded overflow-hidden bg-gray-100 dark:bg-gray-700">
                        {product.coverLink ? (
                          <Image
                            src={product.coverLink}
                            alt={product.title}
                            fill
                            style={{ objectFit: 'contain' }}
                            sizes="64px"
                            onError={(e) => { e.target.src = '/sample_books.jpg'; }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <FiBook size={20} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-base text-gray-900 dark:text-gray-100 line-clamp-2 leading-snug mb-1">
                          {product.title}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          Tác giả: {product.author}
                        </p>
                        <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.currentPrice)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {searchQuery.trim().length >= 2 && (
                    <div className="border-t border-gray-200 dark:border-gray-600 mt-1 pt-1">
                      <button
                        onClick={() => handleSearch({ preventDefault: () => { } })}
                        className="w-full px-4 py-3 text-left text-sm font-medium text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        Xem tất cả kết quả cho "{searchQuery}" →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>{/* Main Navigation Links */}
            <div className="flex space-x-4 items-center">
              <Link href="/products" className="text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 flex items-center">
                <FiBook className="mr-1" />
                <span>Sách</span>
              </Link>

              {/* Thay thế Link bằng div có dropdown */}
              <div className="relative group">
                <button
                  className="text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 flex items-center"
                  onMouseEnter={() => setShowCategoryDropdown(true)}
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                >
                  <FiList className="mr-1" />
                  <span>Danh mục</span>
                  <FiChevronDown className="ml-1" size={14} />
                </button>

                {/* Dropdown Menu */}
                {showCategoryDropdown && (
                  <div
                    className="absolute left-1/2 -translate-x-1/2 mt-1 w-[36rem] bg-white dark:bg-gray-800 shadow-xl rounded-md border border-gray-200 dark:border-gray-600 py-2 z-50"
                    onMouseLeave={() => setShowCategoryDropdown(false)}
                  >
                    <div className="absolute h-2 w-full top-[-8px]"></div>
                    <div className="grid grid-cols-4 gap-x-4 gap-y-1 p-4">
                      {categories.slice(0, 20).map((category) => (
                        <Link
                          key={category.id}
                          href={`/products?categoryId=${category.id}`}
                          className="text-base text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 py-1.5 truncate"
                          onClick={() => setShowCategoryDropdown(false)}
                        >
                          {category.name}
                        </Link>
                      ))}
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-600 mt-1 pt-1.5">
                      <Link
                        href="/products"
                        className="block px-4 py-2.5 text-base font-medium text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300"
                        onClick={() => setShowCategoryDropdown(false)}
                      >
                        Xem tất cả thể loại →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Icons & Actions */}
          <div className="flex items-center space-x-4">
            {/* Admin Dashboard Link - Only shown for admins */}
            {isAuthenticated && isAdmin && (
              <Link href="/admin/dashboard"
                className="text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 group relative">
                <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity right-full mr-2 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs py-1 px-3 rounded-lg whitespace-nowrap pointer-events-none z-10 shadow-lg">
                  Quản trị viên
                  <div className="absolute w-2 h-2 bg-gray-800 transform rotate-45 top-1/2 -translate-y-1/2 -right-1"></div>
                </div>
                <FiSettings size={22} className="hover:animate-spin" />
              </Link>
            )}

            {/* Theme Toggler */}
            <button
              onClick={() => {
                console.log("Theme toggle button clicked");
                handleToggleTheme();
              }}
              className="text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 p-2 rounded-full transition-all relative group overflow-hidden bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-md"
              aria-label={theme === 'dark' ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
            >
              <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-3 rounded-lg whitespace-nowrap pointer-events-none z-10 shadow-lg">
                {theme === 'dark' ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
                <div className="absolute w-2 h-2 bg-gray-800 transform rotate-45 left-1/2 -translate-x-1/2 -bottom-1"></div>
              </div>
              <div className="relative transition-transform duration-300">
                {theme === 'dark' ? (
                  <FiSun size={20} className="text-yellow-400 theme-icon" />
                ) : (
                  <FiMoon size={20} className="text-indigo-600 theme-icon" />
                )}
              </div>
            </button>

            {/* Giỏ hàng */}
            <Link href="/cart" className="relative text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400">
              <FiShoppingCart size={24} />
              {isAuthenticated && cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount > 9 ? '9+' : cartItemCount}
                </span>
              )}
            </Link>

            {/* Danh sách yêu thích */}
            {isAuthenticated && (
              <Link href="/wishlist" className="relative text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400">
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
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  onMouseEnter={() => setShowDropdown(true)}
                  className="flex items-center text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 focus:outline-none"
                >
                  <UserAvatar
                    name={user?.name || user?.displayName || `${user?.firstName} ${user?.lastName}`.trim() || 'User'}
                    avatarUrl={shouldRenderAvatar(user) ? formatImageUrl(user.avatarUrl || user.avatar) : null}
                    size="sm"
                    className="border-2 border-gray-200 dark:border-gray-700"
                  />
                  <span className="ml-2 hidden md:inline">{user?.name || user?.displayName || `${user?.firstName} ${user?.lastName}`.trim() || 'User'}</span>
                </button>

                {showDropdown && (
                  <div
                    className="absolute right-0 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 border border-gray-200 dark:border-gray-700 z-50 mt-1"
                    onMouseLeave={() => setShowDropdown(false)}
                  >
                    <div className="absolute h-3 w-full top-[-12px]"></div>

                    <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-orange-600 hover:text-gray-800 dark:hover:text-white">
                      Hồ sơ của tôi
                    </Link>
                    <Link href="/orders/my-history" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-orange-600 hover:text-gray-800 dark:hover:text-white">
                      Lịch sử đơn hàng
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-orange-600 hover:text-gray-800 dark:hover:text-white"
                    >
                      <FiLogOut className="inline mr-2" /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Chưa đăng nhập
              <div className="hidden md:flex items-center space-x-2 sm:space-x-4">
                <Link href="/login" className="text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 flex items-center">
                  <FiLogIn className="mr-1" size={20} /> <span>Đăng nhập</span>
                </Link>
                <Link href="/register" className="bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white px-4 py-2 rounded-md transition-colors flex items-center">
                  <FiUserPlus className="mr-1" size={18} /> <span>Đăng ký</span>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-4 pb-3 border-t border-gray-200 dark:border-gray-700 mt-3 space-y-4">
            {/* Mobile Search */}
            <div className="relative mb-4">
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  placeholder="Tìm kiếm sách..."
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 pr-10 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 w-full"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                  {isSearching ? (
                    <div className="animate-spin w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full"></div>
                  ) : (
                    <FiSearch />
                  )}
                </button>
              </form>              {/* Mobile Search Dropdown */}
              {showSearchDropdown && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 shadow-xl rounded-md border border-gray-200 dark:border-gray-600 py-2 z-50 max-h-60 overflow-y-auto">
                  {searchResults.map((product) => (
                    <div
                      key={product.productId}
                      onClick={() => handleSearchResultClick(product.productId)}
                      className="flex items-center gap-3 px-4 py-4 hover:bg-orange-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                    >
                      <div className="w-14 h-18 flex-shrink-0 relative rounded overflow-hidden bg-gray-100 dark:bg-gray-700">
                        {product.coverLink ? (
                          <Image
                            src={product.coverLink}
                            alt={product.title}
                            fill
                            style={{ objectFit: 'contain' }}
                            sizes="56px"
                            onError={(e) => { e.target.src = '/sample_books.jpg'; }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <FiBook size={18} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 line-clamp-2 leading-snug mb-1">
                          {product.title}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Tác giả: {product.author}
                        </p>
                        <p className="text-xs font-semibold text-orange-600 dark:text-orange-400">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.currentPrice)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {searchQuery.trim().length >= 2 && (
                    <div className="border-t border-gray-200 dark:border-gray-600 mt-1 pt-1">
                      <button
                        onClick={() => handleSearch({ preventDefault: () => { } })}
                        className="w-full px-4 py-3 text-left text-sm font-medium text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        Xem tất cả kết quả cho "{searchQuery}" →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>{/* Mobile Navigation Links */}
            <Link
              href="/products"
              className="block py-2 text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400"
              onClick={() => setMobileMenuOpen(false)}
            >
              <FiBook className="inline mr-2" /> Sách
            </Link>

            {/* Mobile Categories Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="flex w-full justify-between items-center py-2 text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400"
              >
                <span><FiList className="inline mr-2" /> Danh mục</span>
                <FiChevronDown className={`transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Mobile Categories Dropdown Menu */}
              {showCategoryDropdown && (
                <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3 rounded-md mt-1 border border-gray-200 dark:border-gray-600">
                  <div className="grid grid-cols-3 gap-x-4 gap-y-1">
                    {categories.slice(0, 20).map((category) => (
                      <Link
                        key={category.id}
                        href={`/products?categoryId=${category.id}`}
                        className="text-base text-gray-700 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 py-1.5 truncate"
                        onClick={() => {
                          setShowCategoryDropdown(false);
                          setMobileMenuOpen(false);
                        }}
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-600 mt-1.5 pt-1.5">
                    <Link
                      href="/products"
                      className="block py-2.5 text-base font-medium text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300"
                      onClick={() => {
                        setShowCategoryDropdown(false);
                        setMobileMenuOpen(false);
                      }}
                    >
                      Xem tất cả thể loại →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle in Mobile Menu */}
            <button
              onClick={() => {
                console.log("Mobile theme toggle button clicked");
                handleToggleTheme();
                // Không đóng menu để người dùng có thể thấy sự thay đổi theme
              }}
              className="flex items-center w-full py-3 px-2 text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 transition-all bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg my-2"
            >
              <div className="inline mr-3 relative bg-gray-100 dark:bg-gray-700 p-2 rounded-full transition-all duration-300">
                {theme === 'dark' ? (
                  <FiSun size={18} className="text-yellow-400 theme-icon" />
                ) : (
                  <FiMoon size={18} className="text-indigo-600 theme-icon" />
                )}
              </div>
              <span className="font-medium">{theme === 'dark' ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}</span>
            </button>

            {/* Mobile Auth Links */}
            {!isAuthenticated && (
              <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <Link
                  href="/login"
                  className="block py-2 text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FiLogIn className="inline mr-2" /> Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="block py-2 text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FiUserPlus className="inline mr-2" /> Đăng ký
                </Link>
              </div>
            )}

            {/* Mobile User Link */}
            {isAuthenticated && (
              <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="pb-2 font-medium text-gray-800 dark:text-gray-200 flex items-center">
                  <UserAvatar
                    name={user?.name || 'User'}
                    avatarUrl={shouldRenderAvatar(user) ? formatImageUrl(user.avatarUrl) : null}
                    size="sm"
                    className="border-2 border-gray-200 dark:border-gray-700 mr-2"
                  />
                  Xin chào, {user.name}
                </div>
                <Link
                  href="/profile"
                  className="block py-2 text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FiUser className="inline mr-2" /> Hồ sơ của tôi
                </Link>
                <Link
                  href="/orders/my-history"
                  className="block py-2 text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FiPackage className="inline mr-2" /> Lịch sử đơn hàng
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left py-2 text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400"
                >
                  <FiLogOut className="inline mr-2" /> Đăng xuất
                </button>
              </div>
            )}

            {/* Admin Link ở Mobile Menu  */}
            {isAuthenticated && isAdmin && (
              <Link
                href="/admin/dashboard"
                className="block py-2 text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400"
                onClick={() => setMobileMenuOpen(false)}
              >
                <FiSettings className="inline mr-2" /> Quản trị viên
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
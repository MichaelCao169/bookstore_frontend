// src/components/ui/ProductCard.jsx
'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiShoppingCart, FiHeart, FiLoader, FiCheck, FiImage } from 'react-icons/fi';
import { BsCart2, BsCartPlus } from 'react-icons/bs';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import axiosInstance from '@/lib/axiosInstance';
import BrandSpinner from '@/components/ui/BrandSpinner';

const placeholderImage = '/sample_books.jpg';

// Component hiển thị đánh giá sao
const StarRating = ({ rating = 0, count = 0 }) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
      <span className="text-yellow-500 flex mr-1">
        {[...Array(fullStars)].map((_, i) => (
          <svg key={`full-${i}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10.868 2.884c.321-.772 1.415-.772 1.736 0l1.83 4.421 4.876.709c.85.124 1.188 1.168.576 1.756l-3.528 3.438.834 4.857c.145.845-.738 1.5-1.504 1.1l-4.36-2.292-4.36 2.292c-.766.4-1.649-.255-1.504-1.1l.834-4.857L2.68 9.769c-.612-.588-.274-1.632.576-1.756l4.876-.709L10 2.884Z" clipRule="evenodd" /></svg>
        ))}
        {halfStar && (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10 1.5c.21 0 .41.037.6.105l1.83 4.421 4.876.709c.43.063.759.416.81.858l-.01.017-.018.027-.023.03-.03.034-.036.037-.04.037-.045.037-.05.035-.056.033L15.32 9.77l-.057.055.834 4.857c.004.024.007.048.009.073l.004.046.003.05.002.055v.106l-.002.055-.003.05-.004.046-.009.073-.016.09-.023.105-.03.115-.038.12-.046.125-.054.126a1.017 1.017 0 0 1-.121.21l-.07.1-.076.095-.084.09a1 1 0 0 1-.62.31l-.135.014-4.36-2.292-.154-.08-.168-.083a1.017 1.017 0 0 1-.474 0l-.168.083-.154.08-4.36 2.292a1.017 1.017 0 0 1-.135-.014 1 1 0 0 1-.899-.494l-.054-.126-.046-.125-.038-.12-.03-.115-.023-.105-.016-.09-.009-.073-.004-.046-.003-.05-.002-.055v-.106l.002-.055.003-.05.004-.046.009-.073.834-4.857-.058-.055L3.3 9.77c-.234-.227-.363-.527-.388-.84l-.01-.048-.006-.05-.004-.053-.002-.058V8.65c0-.08.003-.159.008-.237l.01-.09.016-.093.023-.096.03-.096.038-.093.046-.087a1.017 1.017 0 0 1 .21-.35l.07-.08.076-.075.084-.07a1 1 0 0 1 .504-.25l.116-.018 4.876-.709 1.83-4.421A1.91 1.91 0 0 1 10 1.5Zm0 2.634L8.58 8.13l-4.05.588 2.93 2.85-.693 4.035L10 13.36l3.233 1.7-.693-4.035 2.93-2.85-4.05-.588L10 4.134Z" clipRule="evenodd" /></svg>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <svg key={`empty-${i}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-300 dark:text-gray-600"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.31h5.418a.563.563 0 0 1 .372.956l-4.386 3.114a.563.563 0 0 0-.182.635l1.658 5.281a.563.563 0 0 1-.812.622l-4.39-3.135a.563.563 0 0 0-.576 0l-4.39 3.135a.563.563 0 0 1-.812-.622l1.658-5.281a.563.563 0 0 0-.182-.635L2.47 9.881a.562.562 0 0 1 .372-.956h5.418a.563.563 0 0 0 .475-.31L11.48 3.5Z" /></svg>
        ))}
      </span>
      {count > 0 && <span className="ml-1 dark:text-gray-400">({count})</span>}
    </div>
  );
};

const ProductCard = ({ product }) => {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [addedToWishlist, setAddedToWishlist] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const fetchCartCount = useCartStore((state) => state.fetchCartCount);
  const incrementWishlistCount = useWishlistStore((state) => state.incrementItemCount);

  // Kiểm tra và xử lý URL hình ảnh khi component mount
  useEffect(() => {
    if (!product) return;    // Khởi tạo giá trị imageUrl
    if (product.coverLink) {
      try {
        // Kiểm tra nếu URL hợp lệ
        new URL(product.coverLink);
        setImageUrl(product.coverLink);
      } catch (e) {
        console.warn(`URL ảnh không hợp lệ: ${product.coverLink}`);
        setImageUrl(placeholderImage);
        setImageError(true);
      }
    } else {
      setImageUrl(placeholderImage);
      setImageError(true);
    }
  }, [product]);

  // Xử lý lỗi ảnh
  const handleImageError = (e) => {
    console.warn(`Ảnh không tải được: ${imageUrl}. Sử dụng ảnh mặc định.`);
    setImageUrl(placeholderImage);
    setImageError(true);
  };

  // Xử lý thêm vào giỏ hàng
  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.warn('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.');
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    } if (product.quantity <= 0) {
      toast.error('Sản phẩm đã hết hàng.');
      return;
    }

    setIsAddingToCart(true);

    try {
      await axiosInstance.post('/cart/items', {
        productId: product.productId,
        quantity: 1
      });

      toast.success('Đã thêm sản phẩm vào giỏ hàng!');
      if (fetchCartCount) await fetchCartCount();
    } catch (error) {
      console.error('Lỗi khi thêm vào giỏ hàng:', error.response?.data || error);
      if (error.response?.status === 409) {
        toast.info('Sản phẩm đã có trong giỏ hàng. Vui lòng mở giỏ hàng để điều chỉnh số lượng.');
      } else {
        const errorMessage = error.response?.data?.message || error.response?.data || 'Không thể thêm sản phẩm vào giỏ hàng.';
        toast.error(`Lỗi: ${errorMessage}`);
      }
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Xử lý thêm vào danh sách yêu thích
  const handleAddToWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.warn('Vui lòng đăng nhập để thêm sản phẩm vào danh sách yêu thích.');
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setIsAddingToWishlist(true); try {
      await axiosInstance.post(`/wishlist/products/${product.productId}`);
      toast.success('Đã thêm sản phẩm vào danh sách yêu thích!');
      incrementWishlistCount();
      setAddedToWishlist(true);
    } catch (error) {
      if (error.response?.status === 409) {
        toast.info('Sản phẩm đã có trong danh sách yêu thích.');
        setAddedToWishlist(true);
      } else {
        const errorMessage = error.response?.data?.message || error.response?.data || 'Không thể thêm vào danh sách yêu thích.';
        toast.error(`Lỗi: ${errorMessage}`);
      }
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  if (!product) {
    return null;
  }

  return (<Link
    href={`/products/${product.productId}`}
    className="group relative flex flex-col h-full rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700"
  >
    {/* Badge cho sản phẩm mới hoặc hết hàng */}
    {product.quantity <= 0 && (
      <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-md">
        Hết hàng
      </div>
    )}
    {product.isNew && (
      <div className="absolute top-2 left-2 z-10 bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-md">
        Mới
      </div>
    )}

    {/* Ảnh sản phẩm */}
    <div className="relative w-full h-48 sm:h-56 overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={product.title || 'Bìa sách'}
          fill
          style={{ objectFit: 'contain' }}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={false}
          onError={handleImageError}
          className={`transition-transform duration-300 ${!imageError ? 'group-hover:scale-105' : ''}`}
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
          <FiImage size={40} />
          <span className="text-sm mt-2">Không có ảnh</span>
        </div>
      )}

      {/* Nút thêm vào danh sách yêu thích */}
      <button
        onClick={handleAddToWishlist}
        disabled={isAddingToWishlist}
        className={`absolute top-2 right-2 p-2 rounded-full text-white shadow-md transition-all duration-200 z-10
            ${addedToWishlist
            ? 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 opacity-100'
            : 'bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 opacity-0 group-hover:opacity-100'
          }`}
        title={addedToWishlist ? 'Đã thêm vào yêu thích' : 'Thêm vào yêu thích'}
      >          {isAddingToWishlist ? (
        <BrandSpinner size="sm" />
      ) : addedToWishlist ? (
        <FiCheck size={18} />
      ) : (
        <FiHeart size={18} />
      )}
      </button>
    </div>

    {/* Thông tin sản phẩm */}
    <div className="p-4 flex flex-col flex-grow">
      {/* Danh mục */}
      {product.categoryName && (
        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
          {product.categoryName}
        </div>
      )}

      {/* Tiêu đề sách */}
      <h3 className="font-semibold text-base sm:text-lg text-gray-800 dark:text-gray-200 mb-1 line-clamp-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
        {product.title || 'Chưa có tên'}
      </h3>

      {/* Tác giả */}
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
        {product.author ? `Tác giả: ${product.author}` : 'Tác giả: Chưa cập nhật'}
      </p>

      {/* Đánh giá */}
      <div className="mb-2">
        <StarRating rating={product.averageRating} count={product.reviewCount} />
      </div>

      {/* Khoảng trống đẩy giá và nút xuống dưới */}
      <div className="flex-grow"></div>

      {/* Giá và nút thêm vào giỏ hàng */}
      <div className="flex justify-between items-center mt-4">          <div>
        <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
          {product.currentPrice?.toLocaleString('vi-VN')} ₫
        </p>
        {product.originalPrice && product.originalPrice > product.currentPrice && (
          <p className="text-sm text-gray-500 dark:text-gray-400 line-through">
            {product.originalPrice.toLocaleString('vi-VN')} ₫
          </p>
        )}
      </div>
      </div>
    </div>

    {/* Nút Thêm vào giỏ hàng xuất hiện khi hover - ở góc phải dưới của card */}      <button
      onClick={handleAddToCart}
      disabled={isAddingToCart || product.quantity <= 0}
      className={`absolute bottom-3 right-3 p-2 rounded-full text-white shadow-md transition-all duration-200 z-10 
          ${product.quantity <= 0
          ? 'bg-gray-400 cursor-not-allowed opacity-0 group-hover:opacity-70'
          : 'bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 opacity-0 group-hover:opacity-100'
        }`}
      title={product.quantity <= 0 ? 'Sản phẩm đã hết hàng' : 'Thêm vào giỏ hàng'}
    >{isAddingToCart ? (
      <BrandSpinner size="sm" />
    ) : (
      <BsCartPlus size={18} />
    )}
    </button>
  </Link>
  );
};

export default ProductCard;
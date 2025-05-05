// src/components/ui/ProductCard.jsx
'use client';
import React from 'react';
import Image from 'next/image'; // Dùng Image của Next.js để tối ưu ảnh
import Link from 'next/link';
import { FiShoppingCart, FiHeart } from 'react-icons/fi'; // Icon thêm vào giỏ/wishlist
const placeholderImage = '/sample_books.jpg';
// Component hiển thị sao đánh giá (ví dụ đơn giản)
const StarRating = ({ rating = 0, count = 0 }) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
 
  return (
    <div className="flex items-center text-sm text-gray-500">
      <span className="text-yellow-500 flex mr-1">
        {[...Array(fullStars)].map((_, i) => (
          <svg key={`full-${i}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10.868 2.884c.321-.772 1.415-.772 1.736 0l1.83 4.421 4.876.709c.85.124 1.188 1.168.576 1.756l-3.528 3.438.834 4.857c.145.845-.738 1.5-1.504 1.1l-4.36-2.292-4.36 2.292c-.766.4-1.649-.255-1.504-1.1l.834-4.857L2.68 9.769c-.612-.588-.274-1.632.576-1.756l4.876-.709L10 2.884Z" clipRule="evenodd" /></svg>
        ))}
        {halfStar && (
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10 1.5c.21 0 .41.037.6.105l1.83 4.421 4.876.709c.43.063.759.416.81.858l-.01.017-.018.027-.023.03-.03.034-.036.037-.04.037-.045.037-.05.035-.056.033L15.32 9.77l-.057.055.834 4.857c.004.024.007.048.009.073l.004.046.003.05.002.055v.106l-.002.055-.003.05-.004.046-.009.073-.016.09-.023.105-.03.115-.038.12-.046.125-.054.126a1.017 1.017 0 0 1-.121.21l-.07.1-.076.095-.084.09a1 1 0 0 1-.62.31l-.135.014-4.36-2.292-.154-.08-.168-.083a1.017 1.017 0 0 1-.474 0l-.168.083-.154.08-4.36 2.292a1.017 1.017 0 0 1-.135-.014 1 1 0 0 1-.899-.494l-.054-.126-.046-.125-.038-.12-.03-.115-.023-.105-.016-.09-.009-.073-.004-.046-.003-.05-.002-.055v-.106l.002-.055.003-.05.004-.046.009-.073.834-4.857-.058-.055L3.3 9.77c-.234-.227-.363-.527-.388-.84l-.01-.048-.006-.05-.004-.053-.002-.058V8.65c0-.08.003-.159.008-.237l.01-.09.016-.093.023-.096.03-.096.038-.093.046-.087a1.017 1.017 0 0 1 .21-.35l.07-.08.076-.075.084-.07a1 1 0 0 1 .504-.25l.116-.018 4.876-.709 1.83-4.421A1.91 1.91 0 0 1 10 1.5Zm0 2.634L8.58 8.13l-4.05.588 2.93 2.85-.693 4.035L10 13.36l3.233 1.7-.693-4.035 2.93-2.85-4.05-.588L10 4.134Z" clipRule="evenodd" /></svg>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <svg key={`empty-${i}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-300"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.31h5.418a.563.563 0 0 1 .372.956l-4.386 3.114a.563.563 0 0 0-.182.635l1.658 5.281a.563.563 0 0 1-.812.622l-4.39-3.135a.563.563 0 0 0-.576 0l-4.39 3.135a.563.563 0 0 1-.812-.622l1.658-5.281a.563.563 0 0 0-.182-.635L2.47 9.881a.562.562 0 0 1 .372-.956h5.418a.563.563 0 0 0 .475-.31L11.48 3.5Z" /></svg>
        ))}
      </span>
      {count > 0 && <span className="ml-1">({count})</span>}
    </div>
  );
};


const ProductCard = ({ product }) => {
  if (!product) {
    return null; // Tránh lỗi nếu product không có
  }

  // Hàm xử lý khi nhấn nút Add to Cart (sẽ gọi API sau)
  const handleAddToCart = (e) => {
    e.preventDefault(); // Ngăn Link chuyển trang khi bấm nút
    e.stopPropagation();
    // TODO: Gọi API service.addProductToCart(userId, { productId: product.id, quantity: 1 });
    console.log('Adding to cart:', product.id);
    // Hiển thị thông báo thành công (ví dụ: dùng react-toastify)
  };

  // Hàm xử lý khi nhấn nút Add to Wishlist (sẽ gọi API sau)
    const handleAddToWishlist = (e) => {
        e.preventDefault();
        e.stopPropagation();
        // TODO: Gọi API service.addProductToWishlist(userId, product.id);
        console.log('Adding to wishlist:', product.id);
         // Hiển thị thông báo
    };
   const handleImageError = (e) => {
    if (!e.target.src.endsWith(placeholderImage)) { // Chỉ đặt placeholder nếu chưa phải là nó
         console.warn(`Image failed to load: ${product.imageUrl}. Falling back to placeholder.`);
         e.target.src = placeholderImage;
    }
};


  return (
    // Sử dụng Link để bao toàn bộ card, dẫn đến trang chi tiết sản phẩm
    <Link
    href={`/products/${product.id}`}
    className="block group rounded-lg overflow-hidden bg-white dark:bg-dark-surface shadow-md hover:shadow-lg transition-shadow duration-300"
  >
     <div className="relative w-full h-48 sm:h-56 overflow-hidden">
       
          <Image
            src={placeholderImage}
            alt={product.title || 'Book cover'}
            fill 
            style={{ objectFit: 'contain' }} 
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" 
            priority={false} 
            onError={handleImageError}
          />
        
          
        
         {/* Nút thêm vào Wishlist (hiển thị khi hover) */}
         <button
             onClick={handleAddToWishlist}
             className="absolute top-2 right-2 bg-orange-500 hover:bg-orange-600 p-1.5 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all duration-200"
             title="Add to Wishlist"
          >
             <FiHeart size={18} />
          </button>
      </div>

      <div className="p-4">
        {/* Tên danh mục (nếu có) */}
        <h3
          className="font-semibold text-base sm:text-lg text-gray-800 dark:text-dark-text mb-1 truncate
                     group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors" // Thêm hiệu ứng hover màu cam
                     // Thay orange-600/orange-400 bằng primary/primary-light nếu dùng màu tùy chỉnh
        > {product.title || 'Untitled Book'}
        </h3>
        
        {/* Tên tác giả */}
        <p className="text-sm text-gray-600 dark:text-dark-text-secondary mb-2 truncate">
          by {product.author || 'Unknown Author'}
        </p>
        {/* Rating */}
        <div className="mb-3">
           {/* Truyền averageRating và reviewCount từ product DTO */}
          <StarRating rating={product.averageRating} count={product.reviewCount} />
        </div>

        {/* Giá và nút Add to Cart */}
        <div className="flex justify-between items-center mt-4"> {/* Thêm mt-4 nếu cần */}
              <p className="text-lg font-bold text-orange-600 dark:text-orange-400"> {/* Đổi màu giá sang cam */}
                 ${product.price?.toFixed(2) || 'N/A'}
              </p>
              <button
                 onClick={handleAddToCart}
                 className="bg-orange-500 hover:bg-orange-600 text-white rounded-full p-2 transition-colors duration-200"
                 title="Add to Cart"
              >
                 <FiShoppingCart size={18} />
              </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
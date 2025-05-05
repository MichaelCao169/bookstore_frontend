// src/components/product/ProductImage.jsx
'use client'; // Đánh dấu là Client Component

import React from 'react';
import Image from 'next/image';

const ProductImage = ({ src, alt, title }) => {
  const placeholderImage = '/sample_books.jpg'; // Đường dẫn ảnh mặc định

  const handleImageError = (e) => {
    // Chỉ thay thế nếu src hiện tại không phải là placeholder
    if (e.target.src !== `${window.location.origin}${placeholderImage}`) {
      console.warn(`Image failed to load: ${src}. Falling back to placeholder.`);
      e.target.src = placeholderImage;
    }
    // Xóa onError để tránh lặp vô hạn nếu placeholder cũng lỗi
    e.target.onerror = null;
  };

  return (
    <div className="w-full aspect-[3/4] relative rounded overflow-hidden shadow-lg">
      <Image
        // Dùng src được truyền vào hoặc placeholder
        src={src || placeholderImage}
        alt={alt || title || 'Book cover'} // Dùng alt truyền vào, hoặc title, hoặc mặc định
        fill
        style={{ objectFit: 'contain' }} // Contain để thấy rõ bìa sách
        sizes="(max-width: 768px) 100vw, 50vw"
        priority // Ưu tiên tải ảnh này
        onError={handleImageError} // Hàm xử lý lỗi giờ đây hợp lệ trong Client Component
      />
    </div>
  );
};

export default ProductImage;
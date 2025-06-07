// src/components/product/ProductListClient.jsx
'use client';

import React from 'react';
import ProductCard from '@/components/ui/ProductCard';
import Pagination from '@/components/ui/Pagination'; // Import Pagination đã sửa
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

const ProductListClient = ({ initialProductPage, hideTitle = false }) => {
  // Lấy dữ liệu ban đầu từ props (do Server Component fetch)
  const products = initialProductPage?.content || [];
  const totalPages = initialProductPage?.totalPages || 0;
  // Lấy trang hiện tại từ searchParams để đảm bảo đồng bộ với URL
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const router = useRouter();
  const pathname = usePathname();

  // Hàm xử lý khi chuyển trang (Cập nhật URL)
  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams); // Lấy các params hiện tại
    params.set('page', newPage.toString()); // Cập nhật page
    // Push URL mới, Next.js sẽ tự động fetch lại dữ liệu cho Server Component cha (HomePage)
    // và re-render component này với props mới
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div>
      {/* TODO: Thêm bộ lọc sản phẩm ở đây (Filter cũng nên là Client Component) */}
      {/* <ProductFilter /> */}      {products.length > 0 ? (
        // Hiển thị lưới sản phẩm
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.productId} product={product} />
          ))}
        </div>
      ) : (
        // Hiển thị khi không có sản phẩm
        <div className="text-center py-10 text-gray-500 dark:text-gray-400">
          <p>Không tìm thấy sản phẩm phù hợp với tiêu chí của bạn.</p>
        </div>
      )}

      {/* Phân trang */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange} // Truyền hàm xử lý cập nhật URL
          />
        </div>
      )}
    </div>
  );
};

export default ProductListClient;
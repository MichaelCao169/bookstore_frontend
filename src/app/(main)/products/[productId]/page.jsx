// src/app/(main)/products/[productId]/page.jsx
// Hoặc src/app/products/[productId]/page.jsx

// Đây là Server Component để fetch dữ liệu ban đầu
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FiEdit } from 'react-icons/fi';
import WriteReviewButton from '@/components/review/WriteReviewButton';
import ProductImage from '@/components/product/ProductImage';
import AddToCartButton from '@/components/product/AddToCartButton';
import AddToWishlistButton from '@/components/product/AddToWishlistButton';
import ReviewList from '@/components/review/ReviewList'; 
// import WriteReviewButton from '@/components/review/WriteReviewButton'; // Nên tách nút này ra

// Star rating
const StarRating = ({ rating = 0, count = 0 }) => {
  const fullStars = Math.floor(rating);
  const emptyStars = 5 - fullStars;

  return (
    <div className="flex items-center text-sm text-gray-600 dark:text-dark-text-secondary">
      <span className="text-yellow-400 flex mr-1">
        {[...Array(fullStars)].map((_, i) => (
          <svg key={`full-${i}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M10.868 2.884c.321-.772 1.415-.772 1.736 0l1.83 4.421 4.876.709c.85.124 1.188 1.168.576 1.756l-3.528 3.438.834 4.857c.145.845-.738 1.5-1.504 1.1l-4.36-2.292-4.36 2.292c-.766.4-1.649-.255-1.504-1.1l.834-4.857L2.68 9.769c-.612-.588-.274-1.632.576-1.756l4.876-.709L10 2.884Z" clipRule="evenodd" /></svg>
        ))}
        {[...Array(emptyStars)].map((_, i) => (
          <svg key={`empty-${i}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-300 dark:text-gray-600"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.31h5.418a.563.563 0 0 1 .372.956l-4.386 3.114a.563.563 0 0 0-.182.635l1.658 5.281a.563.563 0 0 1-.812.622l-4.39-3.135a.563.563 0 0 0-.576 0l-4.39 3.135a.563.563 0 0 1-.812-.622l1.658-5.281a.563.563 0 0 0-.182-.635L2.47 9.881a.562.562 0 0 1 .372-.956h5.418a.563.563 0 0 0 .475-.31L11.48 3.5Z" /></svg>
        ))}
      </span>
      {count > 0 && <span className="ml-2">({count} {count === 1 ? 'review' : 'reviews'})</span>}
      {count === 0 && <span className="ml-2 text-gray-400">Chưa có đánh giá </span>}
    </div>
  );
};


// Hàm lấy dữ liệu chi tiết sản phẩm
async function getProductDetails(productId) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const id = parseInt(productId, 10);
  if (isNaN(id) || id <= 0) return null;

  try {
    const res = await fetch(`${apiUrl}/products/${id}`, {
      method: 'GET',
      next: { revalidate: 300 }
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`API error fetching product ${id}: Status ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    throw new Error(`Could not fetch product data for ID ${id}.`);
  }
}

// Hàm lấy metadata cho trang
export async function generateMetadata({ params }) {
  // Make sure params is properly awaited first
  const resolvedParams = await Promise.resolve(params);
  const productId = resolvedParams.productId;

  try {
    const product = await getProductDetails(productId);
    if (!product) return { title: 'Product Not Found - AtomicBooks' };
    return {
      title: `${product.title}  ${product.author} - AtomicBooks`,
      description: product.description?.substring(0, 160) || `Details for ${product.title}`,
    };
  } catch (error) {
    return { title: 'Error - AtomicBooks', description: 'Could not load product information.' };
  }
}

// Component chính của trang chi tiết sản phẩm (Async Server Component)
export default async function ProductDetailPage({ params }) {
  // Make sure params is properly awaited first
  const resolvedParams = await Promise.resolve(params);
  const productId = resolvedParams.productId;
  let product = null;

  try {
    product = await getProductDetails(productId);
  } catch (error) {
    console.error("Error rendering product page:", error.message);
    // Có thể hiển thị thông báo lỗi chung ở đây hoặc để error.js xử lý
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold text-red-600">Error Loading Product</h1>
        <p className="text-gray-500 mt-2">{error.message || "Could not load product data."}</p>
        <Link href="/products" className="mt-4 inline-block bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600">
          Back to Products
        </Link>
      </div>
    );
  }

  if (!product) {
    notFound(); // Render trang 404
  }


  return (
    <div className="container mx-auto pt-6 pb-12 px-4 md:px-6 lg:px-8 max-w-7xl">
      {/* Breadcrumbs */}
      <div className="mb-6 text-sm flex items-center flex-wrap gap-1 text-gray-500 dark:text-dark-text-secondary">
        <Link href="/" className="hover:text-orange-500 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
          Home
        </Link>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-gray-400">
          <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
        </svg>
        <Link href="/products" className="hover:text-orange-500">Products</Link>
        {product.category && (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-gray-400">
              <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
            </svg>
            <Link href={`/products?categoryId=${product.category.id}`} className="hover:text-orange-500">{product.category.name}</Link>
          </>
        )}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-gray-400">
          <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
        </svg>
        <span className="font-medium text-gray-700 dark:text-dark-text truncate max-w-[250px] md:max-w-xs">{product.title}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Cột Ảnh - Sử dụng Client Component */}
        <ProductImage
          src='/sample_books.jpg'
          alt={product.title}
          title={product.title}
        />

        {/* Cột Thông tin và Actions */}
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold mb-2 text-gray-800 dark:text-dark-text">{product.title}</h1>
          <p className="text-lg text-gray-600 dark:text-dark-text-secondary mb-3">
            by <span className="font-medium">{product.author}</span>
          </p>
          {product.category && (
            <Link
              href={`/products?categoryId=${product.category.id}`}
              className="inline-flex items-center mb-4 px-3 py-1.5 rounded-full text-sm font-medium
               transition-all duration-200 ease-in-out
               bg-orange-100 text-orange-700 border border-orange-200
               hover:bg-orange-200 hover:text-orange-800 hover:border-orange-300
               dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800/50
               dark:hover:bg-orange-800/50 dark:hover:text-orange-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4 mr-1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 6h.008v.008H6V6z"
                />
              </svg>
              {product.category.name}
            </Link>
          )}

          {/* Rating */}
          <div className="mb-4">
            <StarRating rating={product.averageRating} count={product.reviewCount} />
          </div>

          {/* Giá */}
          <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-4">
            ${product.price?.toFixed(2)}
          </p>

          {/* Tồn kho - Thiết kế cải tiến */}
          <div className="mb-6">
            {product.stockQuantity > 0 ? (
              <div className="flex items-center">
                <div className={`relative inline-flex items-center px-3 py-2 rounded-md
                     ${product.stockQuantity > 10
                    ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                    : "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"}`}>

                  {/* Icon và số lượng */}
                  <div className="flex items-center">
                    {product.stockQuantity > 10 ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                      </svg>
                    )}
                    <span className="font-medium text-sm">
                      {product.stockQuantity > 10
                        ? "Còn hàng"
                        : `Chỉ còn ${product.stockQuantity} sản phẩm`}
                    </span>
                  </div>

                  {/* Chỉ báo số lượng (nếu ít) */}
                  {product.stockQuantity <= 10 && (
                    <div className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 dark:bg-yellow-800/60 dark:text-yellow-200 text-xs font-medium rounded-full animate-pulse">
                      Sắp hết hàng
                    </div>
                  )}
                </div>

                {/* Dự kiến giao hàng */}
                <div className="ml-3 text-sm text-gray-500 dark:text-gray-400 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                  </svg>
                  <span>Giao hàng trong 1-3 ngày</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center">
                <div className="flex items-center bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 px-3 py-2 rounded-md">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                  <span className="font-medium">Hết hàng</span>
                </div>

                {/* Nút đặt trước */}
                <button className="ml-3 inline-flex items-center text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  Thông báo khi có hàng
                </button>
              </div>
            )}
          </div>

          {/* Nút Actions - Sử dụng Client Components */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <AddToCartButton
              productId={product.id}
              stockQuantity={product.stockQuantity}
            />
            <AddToWishlistButton
              productId={product.id}
            />
          </div>

          {/* Mô tả sản phẩm */}
          <div className="prose dark:prose-invert max-w-none mt-8">
            <h3 className="text-xl font-semibold mb-3 flex items-center">
              <span className="inline-block w-1 h-6 bg-orange-500 mr-2 rounded"></span>
              Description
            </h3>
            <p className="text-gray-700 dark:text-dark-text-secondary whitespace-pre-wrap bg-white dark:bg-gray-800 p-4 rounded-md border border-gray-200 dark:border-gray-700 shadow-sm">
              {product.description || 'No description available.'}
            </p>
          </div>

          {/* Thông tin khác */}
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-md p-4 text-sm text-gray-600 dark:text-dark-text-secondary space-y-1 border border-gray-200 dark:border-gray-700 shadow-sm">
            {product.isbn && <p><strong>ISBN:</strong> {product.isbn}</p>}
            {product.publishedDate && <p><strong>Published:</strong> {product.publishedDate}</p>}
          </div>

        </div>
      </div>

      {/* Phần Reviews */}
      <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Customer Reviews ({product.reviewCount})</h2>
          {/* *** SỬ DỤNG COMPONENT MỚI *** */}
          <WriteReviewButton productId={product.id} />
        </div>
        {/* TODO: Fetch và hiển thị danh sách Reviews + Pagination */}
        {/* <ReviewList productId={productId} /> */}
        <div className="text-center text-gray-500 dark:text-dark-text-secondary py-6 bg-gray-50 dark:bg-gray-800/50 rounded-md border border-gray-100 dark:border-gray-700">
        <ReviewList productId={product.id} />
        </div>
      </div>
    </div>
  );
}
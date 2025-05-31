// src/app/(main)/products/[productId]/page.jsx
// Hoặc src/app/products/[productId]/page.jsx

// Đây là Server Component để fetch dữ liệu ban đầu
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FiEdit, FiHome, FiBookOpen, FiTag, FiShoppingCart, FiHeart, FiStar, FiTruck, FiClock, FiInfo, FiCheckCircle, FiAlertCircle, FiAlertTriangle, FiBox } from 'react-icons/fi';
import WriteReviewButton from '@/components/review/WriteReviewButton';
import ProductImage from '@/components/product/ProductImage';
import AddToCartButton from '@/components/product/AddToCartButton';
import AddToWishlistButton from '@/components/product/AddToWishlistButton';
import ReviewList from '@/components/review/ReviewList';
// import WriteReviewButton from '@/components/review/WriteReviewButton'; // Nên tách nút này ra

// Star rating
const StarRating = ({ rating = 0, count = 0 }) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
      <div className="text-yellow-400 flex mr-1">
        {[...Array(fullStars)].map((_, i) => (
          <FiStar key={`full-${i}`} className="w-5 h-5 fill-current" />
        ))}
        {halfStar && (
          <span className="relative">
            <FiStar className="w-5 h-5 text-gray-300 dark:text-gray-600" />
            <FiStar className="w-2.5 h-5 fill-current text-yellow-400 absolute top-0 left-0 overflow-hidden" />
          </span>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <FiStar key={`empty-${i}`} className="w-5 h-5 text-gray-300 dark:text-gray-600" />
        ))}
      </div>
      {count > 0 && (
        <span className="ml-2 text-gray-600 dark:text-gray-300">
          ({count} {count === 1 ? 'đánh giá' : 'đánh giá'})
        </span>
      )}
      {count === 0 && (
        <span className="ml-2 text-gray-400 dark:text-gray-500">Chưa có đánh giá</span>
      )}
    </div>
  );
};


// Hàm lấy dữ liệu chi tiết sản phẩm - sửa để hỗ trợ UUID
async function getProductDetails(productId) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // Không cần chuyển đổi productId thành số vì giờ nó là UUID (chuỗi)
  if (!productId) return null;

  try {
    console.log(`Fetching product details for UUID: ${productId}`);
    const res = await fetch(`${apiUrl}/products/${productId}`, {
      method: 'GET',
      next: { revalidate: 300 }
    });

    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`API error fetching product ${productId}: Status ${res.status}`);

    return await res.json();
  } catch (error) {
    console.error(`Error fetching product ${productId}:`, error);
    throw new Error(`Could not fetch product data for ID ${productId}.`);
  }
}

// Hàm lấy metadata cho trang
export async function generateMetadata({ params }) {
  // Make sure params is properly awaited first
  const resolvedParams = await Promise.resolve(params);
  const productId = resolvedParams.productId;

  try {
    const product = await getProductDetails(productId);
    if (!product) return { title: 'Không tìm thấy sản phẩm - AtomikBooks' };
    return {
      title: `${product.title} - ${product.author} - AtomicBooks`,
      description: product.description?.substring(0, 160) || `Chi tiết về ${product.title}`,
    };
  } catch (error) {
    return { title: 'Lỗi - AtomicBooks', description: 'Không thể tải thông tin sản phẩm.' };
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
        <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">Lỗi khi tải sản phẩm</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">{error.message || "Không thể tải dữ liệu sản phẩm."}</p>
        <Link href="/products" className="mt-4 inline-block bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white px-4 py-2 rounded-md transition-colors duration-200">
          Quay lại trang sản phẩm
        </Link>
      </div>
    );
  }

  if (!product) {
    notFound(); // Render trang 404
  }

  // Format VND price
  const formatVND = (price) => {
    // Handle null or undefined values
    if (price == null) return "0 ₫";

    // Convert to number if it's a string
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;

    // Use standard Vietnamese currency format
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numPrice);
  };

  return (
    <div className="container mx-auto pt-6 pb-12 px-4 md:px-6 lg:px-8 max-w-7xl">
      {/* Breadcrumbs */}
      <div className="mb-6 text-sm flex items-center flex-wrap gap-1 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-md">
        <Link href="/" className="hover:text-orange-500 dark:hover:text-orange-400 flex items-center transition-colors">
          <FiHome className="w-4 h-4 mr-1" />
          Trang chủ
        </Link>
        <FiTag className="w-3 h-3 mx-2 text-gray-400 dark:text-gray-500" />
        <Link href="/products" className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors">Sản phẩm</Link>
        {product.category && (
          <>
            <FiTag className="w-3 h-3 mx-2 text-gray-400 dark:text-gray-500" />
            <Link href={`/products?categoryId=${product.category.id}`} className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors">{product.category.name}</Link>
          </>
        )}
        <FiTag className="w-3 h-3 mx-2 text-gray-400 dark:text-gray-500" />
        <span className="font-medium text-gray-700 dark:text-gray-300 truncate max-w-[250px] md:max-w-xs">{product.title}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Product Image */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <ProductImage
            src={product.imageUrl}
            alt={product.title}
            title={product.title}
            className="w-full h-auto object-contain"
          />
        </div>

        {/* Product Details */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          {/* Title and Author */}
          <div className="mb-4">
            <h1 className="text-3xl lg:text-4xl font-bold mb-2 text-gray-800 dark:text-white">{product.title}</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-3">
              tác giả <span className="font-medium text-gray-800 dark:text-white">{product.author}</span>
            </p>
          </div>

          {/* Category Tags */}
          <div className="mb-4">
            {/* Show multiple categories if available */}
            {product.categories && product.categories.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {product.categories.map(category => (
                  <Link
                    key={category.id}
                    href={`/products?categoryId=${category.id}`}
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium
                    transition-colors duration-200
                    bg-orange-100 text-orange-700 border border-orange-200
                    hover:bg-orange-200 hover:text-orange-800 hover:border-orange-300
                    dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800/50
                    dark:hover:bg-orange-800/50 dark:hover:text-orange-200"
                  >
                    <FiTag className="w-4 h-4 mr-1.5" />
                    {category.name}
                  </Link>
                ))}
              </div>
            ) : product.category ? (
              <Link
                href={`/products?categoryId=${product.category.id}`}
                className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium
                transition-colors duration-200
                bg-orange-100 text-orange-700 border border-orange-200
                hover:bg-orange-200 hover:text-orange-800 hover:border-orange-300
                dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800/50
                dark:hover:bg-orange-800/50 dark:hover:text-orange-200"
              >
                <FiTag className="w-4 h-4 mr-1.5" />
                {product.category.name}
              </Link>
            ) : null}
          </div>

          {/* Rating */}
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
            <StarRating rating={product.averageRating} count={product.reviewCount} />
          </div>

          {/* Price */}
          <div className="mb-6 flex items-center">
            <span className="text-3xl font-bold text-orange-600 dark:text-orange-400">{formatVND(product.price)}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <>
                <span className="ml-3 text-lg line-through text-gray-500 dark:text-gray-400">
                  {formatVND(product.originalPrice)}
                </span>
                <span className="ml-2 px-2 py-1 bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 text-xs font-bold rounded">
                  GIẢM {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                </span>
              </>
            )}
          </div>

          {/* Availability Status */}
          <div className="mb-6">
            {product.stockQuantity > 0 ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className={`relative inline-flex items-center px-3 py-2 rounded-md
                    ${product.stockQuantity > 10
                    ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 border border-green-100 dark:border-green-900/50"
                    : "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border border-yellow-100 dark:border-yellow-900/50"}`}>

                  {/* Icon and quantity */}
                  <div className="flex items-center">
                    {product.stockQuantity > 10 ? (
                      <FiCheckCircle className="w-5 h-5 mr-2" />
                    ) : (
                      <FiAlertTriangle className="w-5 h-5 mr-2" />
                    )}
                    <span className="font-medium text-sm">
                      {product.stockQuantity > 10
                        ? "Còn hàng"
                        : `Chỉ còn ${product.stockQuantity} sản phẩm`}
                    </span>
                  </div>

                  {/* Stock indicator for all products */}
                  <div className="ml-2 px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full flex items-center">
                    <FiBox className="w-3 h-3 mr-1" />
                    Kho: {product.stockQuantity} sản phẩm
                  </div>
                </div>

                {/* Delivery estimate */}
                <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-md border border-blue-100 dark:border-blue-900/50">
                  <FiTruck className="w-4 h-4 mr-2 text-blue-500 dark:text-blue-400" />
                  <span>Giao hàng trong 1-3 ngày làm việc</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 px-3 py-2 rounded-md border border-red-100 dark:border-red-900/50">
                  <FiAlertCircle className="w-5 h-5 mr-2" />
                  <span className="font-medium">Hết hàng</span>
                </div>

                {/* Backorder button */}
                <button className="flex items-center justify-center text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium transition-colors bg-indigo-50 dark:bg-indigo-900/20 px-3 py-2 rounded-md border border-indigo-100 dark:border-indigo-900/50">
                  <FiClock className="w-4 h-4 mr-2" />
                  Thông báo khi có hàng
                </button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-4 mb-8">
            <AddToCartButton
              productId={product.id}
              isInStock={product.stockQuantity > 0}
              className="flex-1 sm:flex-none min-w-[180px] bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 dark:from-orange-600 dark:to-orange-700 dark:hover:from-orange-700 dark:hover:to-orange-800 text-white font-medium py-3 px-6 rounded-md shadow-sm transition-all duration-200 flex items-center justify-center"
            />
            <AddToWishlistButton
              productId={product.id}
              className="flex-1 sm:flex-none min-w-[180px] bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium py-3 px-6 rounded-md shadow-sm transition-all duration-200 flex items-center justify-center border border-gray-200 dark:border-gray-600"
            />
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-3 text-gray-800 dark:text-white flex items-center">
              <FiInfo className="mr-2 text-orange-500 dark:text-orange-400" />
              Mô tả sản phẩm
            </h2>
            <div className="prose prose-orange dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-md border border-gray-200 dark:border-gray-700">
              <p>{product.description}</p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-white dark:bg-gray-700 rounded-md p-4 text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 shadow-sm">
            <h3 className="font-medium text-gray-800 dark:text-white mb-2 flex items-center">
              <FiBookOpen className="mr-2 text-orange-500 dark:text-orange-400" />
              Thông tin sách
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {product.isbn && <p><strong>ISBN:</strong> {product.isbn}</p>}
              {product.publicationYear && <p><strong>Năm xuất bản:</strong> {product.publicationYear}</p>}
              {product.publisher && <p><strong>Nhà xuất bản:</strong> {product.publisher}</p>}
              {product.pageCount && <p><strong>Số trang:</strong> {product.pageCount}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-6">

        </div>

        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-md border border-gray-200 dark:border-gray-700">
          <ReviewList productId={product.id} />
        </div>
      </div>
    </div>
  );
}
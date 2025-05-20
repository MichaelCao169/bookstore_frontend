// src/app/page.jsx
import ProductListClient from '@/components/product/ProductListClient';
import HeroSection from '@/components/home/HeroSection';
import FeaturedCategories from '@/components/home/FeaturedCategories';
import CuratedCollections from '@/components/home/CuratedCollections';
import AuthorSpotlight from '@/components/home/AuthorSpotlight';
import SpecialOffers from '@/components/home/SpecialOffers';
import NewArrivals from '@/components/home/NewArrivals';

// Hàm lấy dữ liệu phía Server (Next.js App Router)
async function getProducts(searchParams) {
  // Make sure searchParams is properly handled
  const resolvedParams = searchParams || {};

  const page = resolvedParams.page ? parseInt(resolvedParams.page, 10) - 1 : 0; // page param thường là 1-based
  const size = resolvedParams.size ? parseInt(resolvedParams.size, 10) : 8; //  8 sản phẩm
  const sort = resolvedParams.sort || 'title,asc'; //  sort theo title

  // TODO: Thêm các tham số lọc khác từ searchParams vào URL
  const keyword = resolvedParams.keyword || '';
  const categoryId = resolvedParams.categoryId || '';
  const minPrice = resolvedParams.minPrice || '';
  const maxPrice = resolvedParams.maxPrice || '';
  const author = resolvedParams.author || '';
  const inStockOnly = resolvedParams.inStockOnly || '';

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sort: sort,
      ...(keyword && { keyword }), // Thêm nếu có giá trị
      ...(categoryId && { categoryId }),
      ...(minPrice && { minPrice }),
      ...(maxPrice && { maxPrice }),
      ...(author && { author }),
      ...(inStockOnly === 'true' && { inStockOnly: 'true' }), // Chỉ thêm nếu là true
    }).toString();

    const res = await fetch(`${apiUrl}/products?${queryParams}`, {
      method: 'GET',
      // cache: 'no-store', // Bỏ comment nếu muốn dữ liệu luôn mới nhất (không cache)
      next: { revalidate: 60 } // Optional: Revalidate cache mỗi 60 giây
    });

    if (!res.ok) {
      // This will activate the closest `error.js` Error Boundary
      console.error("Failed to fetch products:", res.status, res.statusText);
      // throw new Error('Failed to fetch products');
      return { content: [], totalPages: 0, totalElements: 0, number: 0, size: size }; // Trả về page rỗng nếu lỗi
    }

    const data = await res.json();
    return data; // Trả về đối tượng Page từ API

  } catch (error) {
    console.error("Error fetching products:", error);
    // throw new Error('Could not connect to API');
    return { content: [], totalPages: 0, totalElements: 0, number: 0, size: size }; // Trả về page rỗng nếu lỗi
  }
}

// Hàm lấy sản phẩm mới
async function getNewArrivals() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  try {
    const res = await fetch(`${apiUrl}/products?page=0&size=4&sort=createdAt,desc`, {
      method: 'GET',
      next: { revalidate: 3600 } // Cache 1 hour
    });

    if (!res.ok) return { content: [] };

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching new arrivals:", error);
    return { content: [] };
  }
}

// Hàm lấy sản phẩm bán chạy
async function getBestsellers() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  try {
    // In a real app, this would call a specific bestseller endpoint
    const res = await fetch(`${apiUrl}/products?page=0&size=4&sort=reviewCount,desc`, {
      method: 'GET',
      next: { revalidate: 3600 } // Cache 1 hour
    });

    if (!res.ok) return { content: [] };

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching bestsellers:", error);
    return { content: [] };
  }
}

// Trang chủ là một Async Server Component
export default async function HomePage({ searchParams }) {
  // Create a resolved searchParams object for safety
  const resolvedSearchParams = await Promise.resolve(searchParams || {});

  // Gọi hàm lấy dữ liệu
  const initialProductPage = await getProducts(resolvedSearchParams);
  const newArrivalsData = await getNewArrivals();
  const bestsellersData = await getBestsellers();

  return (
    <div className="space-y-12 pb-10">
      {/* Hero Section */}
      <HeroSection />

      {/* Featured Categories */}
      <section className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Danh mục sách</h2>
        <FeaturedCategories />
      </section>

      {/* New Arrivals */}
      <section className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Sách mới</h2>
          <a href="/products?sort=createdAt,desc" className="text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 font-medium text-sm">
            Xem tất cả →
          </a>
        </div>
        <NewArrivals products={newArrivalsData.content} />
      </section>

      {/* Bestsellers and Staff Picks - tạm thời ẩn */}
      {/* 
      <section className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Sách bán chạy</h2>
          <a href="/products?sort=reviewCount,desc" className="text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 font-medium text-sm">
            Xem tất cả →
          </a>
        </div>
        <CuratedCollections products={bestsellersData.content} />
      </section>
      */}

      {/* Special Offers */}
      <section className="bg-gray-50 dark:bg-gray-800/50 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Ưu đãi đặc biệt</h2>
          <SpecialOffers />
        </div>
      </section>

      {/* Author Spotlight */}
      <section className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Tác giả nổi bật</h2>
        <AuthorSpotlight />
      </section>

      {/* Featured & Recommended */}
      <section className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Sách đề xuất</h2>
          <a href="/products" className="text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 font-medium text-sm">
            Xem tất cả sản phẩm →
          </a>
        </div>
        <ProductListClient initialProductPage={initialProductPage} hideTitle />
      </section>
    </div>
  );
}
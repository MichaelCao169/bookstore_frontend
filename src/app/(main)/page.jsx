// src/app/page.jsx
import HeroSection from '@/components/home/HeroSection';
import FeaturedCategories from '@/components/home/FeaturedCategories';
import CuratedCollections from '@/components/home/CuratedCollections';
import AuthorSpotlight from '@/components/home/AuthorSpotlight';
import SpecialOffers from '@/components/home/SpecialOffers';
import NewArrivals from '@/components/home/NewArrivals';
import RecommendedBooks from '@/components/home/RecommendedBooks';



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
    const res = await fetch(`${apiUrl}/products?page=0&size=4&sort=soldCount,desc`, {
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

// Hàm lấy sách đề xuất ngẫu nhiên
async function getRandomRecommendations() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  try {
    // Lấy một page lớn để có nhiều sách để chọn ngẫu nhiên
    const res = await fetch(`${apiUrl}/products?page=0&size=50&sort=title,asc`, {
      method: 'GET',
      next: { revalidate: 1800 } // Cache 30 minutes
    });

    if (!res.ok) return [];

    const data = await res.json();
    const products = data.content || [];

    // Trộn ngẫu nhiên và lấy 8 sản phẩm
    const shuffled = products.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 8);
  } catch (error) {
    console.error("Error fetching random recommendations:", error);
    return [];
  }
}

// Trang chủ là một Async Server Component
export default async function HomePage() {
  // Gọi hàm lấy dữ liệu
  const newArrivalsData = await getNewArrivals();
  const bestsellersData = await getBestsellers();
  const recommendedProducts = await getRandomRecommendations();

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
          <a href="/products?sort=soldCount,desc" className="text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 font-medium text-sm">
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
        <RecommendedBooks products={recommendedProducts} />
      </section>
    </div>
  );
}
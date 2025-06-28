
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
    // Use the dedicated top-selling endpoint
    const res = await fetch(`${apiUrl}/products/top-selling`, {
      method: 'GET',
      next: { revalidate: 3600 } // Cache 1 hour
    });

    if (!res.ok) return [];

    const data = await res.json();
    // The top-selling endpoint returns an array directly, not a paginated response
    return data.slice(0, 4); // Take only first 4 for homepage
  } catch (error) {
    console.error("Error fetching bestsellers:", error);
    return [];
  }
}



// Trang chủ là một Async Server Component
export default async function HomePage() {
  // Gọi hàm lấy dữ liệu
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



      {/* Bestsellers Section */}
      <section className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Sách bán chạy</h2>
          <a href="/products?sort=soldCount,desc" className="text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 font-medium text-sm">
            Xem tất cả →
          </a>
        </div>
        <CuratedCollections products={bestsellersData} />
      </section>

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
        <RecommendedBooks />
      </section>
    </div>
  );
}
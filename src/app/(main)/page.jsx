// src/app/page.jsx
import ProductListClient from '@/components/product/ProductListClient';

// Hàm lấy dữ liệu phía Server (Next.js App Router)
async function getProducts(searchParams) {
  // Make sure searchParams is properly handled
  const resolvedParams = searchParams || {};
  
  const page = resolvedParams.page ? parseInt(resolvedParams.page, 10) - 1 : 0; // page param thường là 1-based
  const size = resolvedParams.size ? parseInt(resolvedParams.size, 10) : 12; //  12 sản phẩm
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

// Trang chủ là một Async Server Component
export default async function HomePage({ searchParams }) {
  // Create a resolved searchParams object for safety
  const resolvedSearchParams = await Promise.resolve(searchParams || {});
  
  // Gọi hàm lấy dữ liệu
  const initialProductPage  = await getProducts(resolvedSearchParams);
  

  return (
    <div>
       <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-dark-text">Our Books</h1>

      {/* *** RENDER CLIENT COMPONENT VÀ TRUYỀN DỮ LIỆU BAN ĐẦU *** */}
      <ProductListClient initialProductPage={initialProductPage} />

    </div>
  );
}
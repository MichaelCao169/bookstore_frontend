import ProductListClient from '@/components/product/ProductListClient';
import ProductFilterSidebar from '@/components/product/ProductFilterSidebar';
import ProductSortFilterClient from '@/components/product/ProductSortFilterClient';
import MobileFilterButton from '@/components/product/MobileFilterButton';

// Hàm lấy dữ liệu phía Server (Next.js App Router)
async function getProducts(searchParams) {
    // Make sure searchParams is properly handled
    const resolvedParams = searchParams || {};

    const page = resolvedParams.page ? parseInt(resolvedParams.page, 10) - 1 : 0; // page param  là 1-based
    const size = resolvedParams.size ? parseInt(resolvedParams.size, 10) : 12; // Số lượng sản phẩm mỗi trang
    const sort = resolvedParams.sort || 'title,asc'; // Mặc định sắp xếp theo tên

    // Xử lý các tham số lọc từ URL
    const keyword = resolvedParams.keyword || resolvedParams.search || '';
    const categoryId = resolvedParams.categoryId || '';
    const minPrice = resolvedParams.minPrice || '';
    const maxPrice = resolvedParams.maxPrice || '';
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
            ...(inStockOnly === 'true' && { inStockOnly: 'true' }), // Chỉ thêm nếu là true
        }).toString();

        const fullUrl = `${apiUrl}/products?${queryParams}`;

        const res = await fetch(fullUrl, {
            method: 'GET',
            next: { revalidate: 60 } // Optional: Revalidate cache mỗi 60 giây
        });

        if (!res.ok) {
            console.error("Failed to fetch products:", res.status, res.statusText);
            return { content: [], totalPages: 0, totalElements: 0, number: 0, size: size };
        }

        const data = await res.json();

        // Kiểm tra nếu backend trả về cấu trúc mới với page object
        if (data.page) {
            // Flatten pagination data để frontend có thể đọc được
            return {
                content: data.content,
                totalElements: data.page.totalElements,
                totalPages: data.page.totalPages,
                number: data.page.number,
                size: data.page.size,
                first: data.page.number === 0,
                last: data.page.number === data.page.totalPages - 1
            };
        }

        return data; // Trả về đối tượng Page từ API (legacy format)

    } catch (error) {
        console.error("Error fetching products:", error);
        return { content: [], totalPages: 0, totalElements: 0, number: 0, size: size };
    }
}

// Hàm lấy danh sách categories
async function getCategories() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    try {
        const res = await fetch(`${apiUrl}/categories`, {
            method: 'GET',
            next: { revalidate: 60 }
        });

        if (!res.ok) {
            console.error("Failed to fetch categories:", res.status, res.statusText);
            return [];
        }

        return await res.json();
    } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
}

// Trang Products là một Async Server Component
export default async function ProductsPage({ searchParams }) {
    // Xử lý searchParams
    const resolvedSearchParams = await Promise.resolve(searchParams || {});

    // Gọi hàm lấy dữ liệu
    const initialProductPage = await getProducts(resolvedSearchParams);
    const categories = await getCategories();

    // Extract thông tin tìm kiếm/bộ lọc để hiển thị
    const keyword = resolvedSearchParams.keyword || resolvedSearchParams.search || '';
    const categoryId = resolvedSearchParams.categoryId || '';
    const sortOption = resolvedSearchParams.sort || 'title,asc';

    // Tìm tên danh mục từ ID
    const selectedCategory = categories.find(cat => cat.id.toString() === categoryId);

    // Tạo tiêu đề trang
    let pageTitle = "Tất cả sách";
    if (keyword) {
        pageTitle = `Kết quả tìm kiếm: "${keyword}"`;
    } else if (selectedCategory) {
        pageTitle = `Danh mục: ${selectedCategory.name}`;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar */}
                <div className="w-full md:w-64 flex-shrink-0">
                    <div className="sticky top-4">
                        <ProductFilterSidebar initialCategories={categories} />
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            {pageTitle}
                        </h1>
                        {keyword && (
                            <p className="text-gray-600 dark:text-gray-400">
                                Tìm thấy {initialProductPage.totalElements} kết quả
                            </p>
                        )}
                    </div>

                    {/* Sort Filter */}
                    <div className="mb-6">
                        <ProductSortFilterClient />
                    </div>

                    {/* Product List */}
                    <ProductListClient initialProductPage={initialProductPage} />
                </div>
            </div>
        </div>
    );
} 
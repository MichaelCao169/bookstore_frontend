'use client';

import React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { FiChevronDown, FiXCircle, FiLoader } from 'react-icons/fi';

// Danh sách các tác giả nổi bật (placeholders)
const popularAuthors = [
    "Nguyễn Nhật Ánh", "Tô Hoài", "Nguyễn Ngọc Tư", "Nguyễn Phong Việt",
    "Dale Carnegie", "J.K. Rowling", "Haruki Murakami", "Paulo Coelho"
];

const ProductFilterSidebar = ({ initialCategories = [] }) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // State cho UI
    const [showCategoryFilter, setShowCategoryFilter] = React.useState(true);
    const [showPriceFilter, setShowPriceFilter] = React.useState(true);
    const [showAuthorFilter, setShowAuthorFilter] = React.useState(true);

    // Lấy giá trị từ URL
    const selectedCategory = searchParams.get('categoryId') || '';
    const minPrice = searchParams.get('minPrice') || '';
    const maxPrice = searchParams.get('maxPrice') || '';
    const selectedAuthor = searchParams.get('author') || '';
    const inStockOnly = searchParams.get('inStockOnly') === 'true';

    // Xử lý thay đổi bộ lọc
    const handleFilterChange = (param, value) => {
        const params = new URLSearchParams(searchParams);

        if (value) {
            params.set(param, value);
        } else {
            params.delete(param);
        }

        // Reset về trang 1 khi thay đổi bộ lọc
        params.set('page', '1');

        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="w-64 space-y-6">
            {/* Category Filter */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                <button
                    onClick={() => setShowCategoryFilter(!showCategoryFilter)}
                    className="flex items-center justify-between w-full text-left text-gray-900 dark:text-white font-medium"
                >
                    <span>Danh mục</span>
                    <FiChevronDown className={`transform transition-transform ${showCategoryFilter ? 'rotate-180' : ''}`} />
                </button>

                {showCategoryFilter && (
                    <div className="mt-4 space-y-2">
                        {initialCategories.map((category) => (
                            <div key={category.id} className="flex items-center">
                                <input
                                    type="radio"
                                    id={`category-${category.id}`}
                                    name="category"
                                    checked={selectedCategory === category.id.toString()}
                                    onChange={() => handleFilterChange('categoryId', category.id)}
                                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 dark:border-gray-600"
                                />
                                <label
                                    htmlFor={`category-${category.id}`}
                                    className="ml-3 text-sm text-gray-600 dark:text-gray-300"
                                >
                                    {category.name}
                                </label>
                            </div>
                        ))}
                        {selectedCategory && (
                            <button
                                onClick={() => handleFilterChange('categoryId', '')}
                                className="flex items-center text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
                            >
                                <FiXCircle className="mr-1" /> Xóa bộ lọc
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Price Filter */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                <button
                    onClick={() => setShowPriceFilter(!showPriceFilter)}
                    className="flex items-center justify-between w-full text-left text-gray-900 dark:text-white font-medium"
                >
                    <span>Khoảng giá</span>
                    <FiChevronDown className={`transform transition-transform ${showPriceFilter ? 'rotate-180' : ''}`} />
                </button>

                {showPriceFilter && (
                    <div className="mt-4 space-y-4">
                        <div className="flex items-center space-x-2">
                            <input
                                type="number"
                                placeholder="Từ"
                                value={minPrice}
                                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                            <span className="text-gray-500">-</span>
                            <input
                                type="number"
                                placeholder="Đến"
                                value={maxPrice}
                                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                        </div>
                        {(minPrice || maxPrice) && (
                            <button
                                onClick={() => {
                                    handleFilterChange('minPrice', '');
                                    handleFilterChange('maxPrice', '');
                                }}
                                className="flex items-center text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
                            >
                                <FiXCircle className="mr-1" /> Xóa bộ lọc
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Author Filter */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                <button
                    onClick={() => setShowAuthorFilter(!showAuthorFilter)}
                    className="flex items-center justify-between w-full text-left text-gray-900 dark:text-white font-medium"
                >
                    <span>Tác giả</span>
                    <FiChevronDown className={`transform transition-transform ${showAuthorFilter ? 'rotate-180' : ''}`} />
                </button>

                {showAuthorFilter && (
                    <div className="mt-4 space-y-2">
                        {popularAuthors.map((author) => (
                            <div key={author} className="flex items-center">
                                <input
                                    type="radio"
                                    id={`author-${author}`}
                                    name="author"
                                    checked={selectedAuthor === author}
                                    onChange={() => handleFilterChange('author', author)}
                                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 dark:border-gray-600"
                                />
                                <label
                                    htmlFor={`author-${author}`}
                                    className="ml-3 text-sm text-gray-600 dark:text-gray-300"
                                >
                                    {author}
                                </label>
                            </div>
                        ))}
                        {selectedAuthor && (
                            <button
                                onClick={() => handleFilterChange('author', '')}
                                className="flex items-center text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
                            >
                                <FiXCircle className="mr-1" /> Xóa bộ lọc
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Stock Filter */}
            <div className="flex items-center">
                <input
                    type="checkbox"
                    id="inStock"
                    checked={inStockOnly}
                    onChange={(e) => handleFilterChange('inStockOnly', e.target.checked ? 'true' : '')}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 dark:border-gray-600"
                />
                <label
                    htmlFor="inStock"
                    className="ml-3 text-sm text-gray-600 dark:text-gray-300"
                >
                    Chỉ hiện sách còn hàng
                </label>
            </div>
        </div>
    );
};

export default ProductFilterSidebar; 
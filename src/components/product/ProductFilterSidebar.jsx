'use client';

import React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { FiChevronDown, FiXCircle, FiLoader, FiTag } from 'react-icons/fi';

const ProductFilterSidebar = ({ initialCategories = [] }) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // State cho UI
    const [showCategoryFilter, setShowCategoryFilter] = React.useState(true);
    const [showPriceFilter, setShowPriceFilter] = React.useState(true);

    // Lấy giá trị từ URL
    const selectedCategory = searchParams.get('categoryId') || '';
    const minPrice = searchParams.get('minPrice') || '';
    const maxPrice = searchParams.get('maxPrice') || '';
    const inStockOnly = searchParams.get('inStockOnly') === 'true';

    // Xác định priceRange dựa trên minPrice và maxPrice
    const getPriceRange = () => {
        if (!minPrice && !maxPrice) return '';
        if (!minPrice && maxPrice === '100000') return 'under-100k';
        if (minPrice === '100000' && maxPrice === '300000') return '100k-300k';
        if (minPrice === '300000' && maxPrice === '500000') return '300k-500k';
        if (minPrice === '500000' && !maxPrice) return 'over-500k';
        return 'custom'; // Khoảng giá tùy chỉnh
    };

    const priceRange = getPriceRange();    // Xử lý thay đổi bộ lọc
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

    // Get category name from ID
    const getSelectedCategoryName = () => {
        if (!selectedCategory) return '';
        const category = initialCategories.find(cat => cat.id.toString() === selectedCategory);
        return category ? category.name : '';
    };// Xử lý thay đổi radio button giá
    const handlePriceRangeChange = (range) => {
        const params = new URLSearchParams(searchParams);

        // Xóa các filter giá cũ
        params.delete('minPrice');
        params.delete('maxPrice');
        params.delete('priceRange');

        if (range && range !== '') {
            // Chỉ set minPrice và maxPrice, không set priceRange để URL sạch hơn
            switch (range) {
                case 'under-100k':
                    params.set('maxPrice', '100000');
                    break;
                case '100k-300k':
                    params.set('minPrice', '100000');
                    params.set('maxPrice', '300000');
                    break;
                case '300k-500k':
                    params.set('minPrice', '300000');
                    params.set('maxPrice', '500000');
                    break;
                case 'over-500k':
                    params.set('minPrice', '500000');
                    break;
            }
        }

        // Reset về trang 1 khi thay đổi bộ lọc
        params.set('page', '1');

        router.push(`${pathname}?${params.toString()}`);
    };    // Xử lý thay đổi input range tùy chỉnh
    const handleCustomRangeChange = (param, value) => {
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
                </button>                {showCategoryFilter && (
                    <div className="mt-4 space-y-3">
                        {/* Category Dropdown */}
                        <select
                            value={selectedCategory}
                            onChange={(e) => handleFilterChange('categoryId', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="">Tất cả danh mục</option>
                            {initialCategories.map(category => (
                                <option
                                    key={category.id}
                                    value={category.id.toString()}
                                    className="dark:bg-gray-700 py-1"
                                >
                                    {category.name}
                                </option>
                            ))}
                        </select>

                        {/* Selected Category Tag */}
                        {selectedCategory && (
                            <div className="space-y-2">
                                <div className="flex items-center bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 px-3 py-2 rounded-full text-sm w-fit">
                                    <FiTag className="mr-2 flex-shrink-0" />
                                    <span className="font-medium">{getSelectedCategoryName()}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleFilterChange('categoryId', '')}
                                        className="ml-2 text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-200 transition-colors"
                                    >
                                        <FiXCircle size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>            {/* Price Filter */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                <button
                    onClick={() => setShowPriceFilter(!showPriceFilter)}
                    className="flex items-center justify-between w-full text-left text-gray-900 dark:text-white font-medium"
                >
                    <span>Khoảng giá</span>
                    <FiChevronDown className={`transform transition-transform ${showPriceFilter ? 'rotate-180' : ''}`} />
                </button>

                {showPriceFilter && (
                    <div className="mt-4 space-y-4">                        {/* Custom styled radio button price ranges */}
                        <div className="space-y-1">
                            {/* Tất cả giá */}
                            <label className="flex items-center cursor-pointer group hover:bg-orange-50 dark:hover:bg-orange-900/20 p-2 rounded-lg transition-colors duration-200">
                                <input
                                    type="radio"
                                    name="priceRange"
                                    value=""
                                    checked={priceRange === ''}
                                    onChange={(e) => handlePriceRangeChange('')}
                                    className="sr-only"
                                />
                                <div className={`w-5 h-5 border-2 rounded-sm flex items-center justify-center transition-all duration-200 ${priceRange === ''
                                    ? 'bg-orange-500 border-orange-500 shadow-md transform scale-105'
                                    : 'border-gray-300 dark:border-gray-600 group-hover:border-orange-400'
                                    }`}>
                                    {priceRange === '' && (
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                                <span className={`ml-3 text-sm transition-colors duration-200 ${priceRange === ''
                                    ? 'text-orange-600 dark:text-orange-400 font-medium'
                                    : 'text-gray-600 dark:text-gray-300 group-hover:text-orange-600 dark:group-hover:text-orange-400'
                                    }`}>
                                    Tất cả giá
                                </span>
                            </label>
                            {/* Dưới 100,000đ */}
                            <label className="flex items-center cursor-pointer group hover:bg-orange-50 dark:hover:bg-orange-900/20 p-2 rounded-lg transition-colors duration-200">
                                <input
                                    type="radio"
                                    name="priceRange"
                                    value="under-100k"
                                    checked={priceRange === 'under-100k'}
                                    onChange={(e) => handlePriceRangeChange('under-100k')}
                                    className="sr-only"
                                />
                                <div className={`w-5 h-5 border-2 rounded-sm flex items-center justify-center transition-all duration-200 ${priceRange === 'under-100k'
                                    ? 'bg-orange-500 border-orange-500 shadow-md transform scale-105'
                                    : 'border-gray-300 dark:border-gray-600 group-hover:border-orange-400'
                                    }`}>
                                    {priceRange === 'under-100k' && (
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                                <span className={`ml-3 text-sm transition-colors duration-200 ${priceRange === 'under-100k'
                                    ? 'text-orange-600 dark:text-orange-400 font-medium'
                                    : 'text-gray-600 dark:text-gray-300 group-hover:text-orange-600 dark:group-hover:text-orange-400'
                                    }`}>
                                    Dưới 100,000đ
                                </span>
                            </label>
                            {/* 100,000đ - 300,000đ */}
                            <label className="flex items-center cursor-pointer group hover:bg-orange-50 dark:hover:bg-orange-900/20 p-2 rounded-lg transition-colors duration-200">
                                <input
                                    type="radio"
                                    name="priceRange"
                                    value="100k-300k"
                                    checked={priceRange === '100k-300k'}
                                    onChange={(e) => handlePriceRangeChange('100k-300k')}
                                    className="sr-only"
                                />
                                <div className={`w-5 h-5 border-2 rounded-sm flex items-center justify-center transition-all duration-200 ${priceRange === '100k-300k'
                                    ? 'bg-orange-500 border-orange-500 shadow-md transform scale-105'
                                    : 'border-gray-300 dark:border-gray-600 group-hover:border-orange-400'
                                    }`}>
                                    {priceRange === '100k-300k' && (
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                                <span className={`ml-3 text-sm transition-colors duration-200 ${priceRange === '100k-300k'
                                    ? 'text-orange-600 dark:text-orange-400 font-medium'
                                    : 'text-gray-600 dark:text-gray-300 group-hover:text-orange-600 dark:group-hover:text-orange-400'
                                    }`}>
                                    100,000đ - 300,000đ
                                </span>
                            </label>
                            {/* 300,000đ - 500,000đ */}
                            <label className="flex items-center cursor-pointer group hover:bg-orange-50 dark:hover:bg-orange-900/20 p-2 rounded-lg transition-colors duration-200">
                                <input
                                    type="radio"
                                    name="priceRange"
                                    value="300k-500k"
                                    checked={priceRange === '300k-500k'}
                                    onChange={(e) => handlePriceRangeChange('300k-500k')}
                                    className="sr-only"
                                />
                                <div className={`w-5 h-5 border-2 rounded-sm flex items-center justify-center transition-all duration-200 ${priceRange === '300k-500k'
                                    ? 'bg-orange-500 border-orange-500 shadow-md transform scale-105'
                                    : 'border-gray-300 dark:border-gray-600 group-hover:border-orange-400'
                                    }`}>
                                    {priceRange === '300k-500k' && (
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                                <span className={`ml-3 text-sm transition-colors duration-200 ${priceRange === '300k-500k'
                                    ? 'text-orange-600 dark:text-orange-400 font-medium'
                                    : 'text-gray-600 dark:text-gray-300 group-hover:text-orange-600 dark:group-hover:text-orange-400'
                                    }`}>
                                    300,000đ - 500,000đ
                                </span>
                            </label>
                            {/* Trên 500,000đ */}
                            <label className="flex items-center cursor-pointer group hover:bg-orange-50 dark:hover:bg-orange-900/20 p-2 rounded-lg transition-colors duration-200">
                                <input
                                    type="radio"
                                    name="priceRange"
                                    value="over-500k"
                                    checked={priceRange === 'over-500k'}
                                    onChange={(e) => handlePriceRangeChange('over-500k')}
                                    className="sr-only"
                                />
                                <div className={`w-5 h-5 border-2 rounded-sm flex items-center justify-center transition-all duration-200 ${priceRange === 'over-500k'
                                    ? 'bg-orange-500 border-orange-500 shadow-md transform scale-105'
                                    : 'border-gray-300 dark:border-gray-600 group-hover:border-orange-400'
                                    }`}>
                                    {priceRange === 'over-500k' && (
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                                <span className={`ml-3 text-sm transition-colors duration-200 ${priceRange === 'over-500k'
                                    ? 'text-orange-600 dark:text-orange-400 font-medium'
                                    : 'text-gray-600 dark:text-gray-300 group-hover:text-orange-600 dark:group-hover:text-orange-400'
                                    }`}>
                                    Trên 500,000đ
                                </span>
                            </label>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Hoặc nhập khoảng giá tùy chỉnh:</p>
                        </div>                        {/* Custom price range inputs */}
                        <div className="flex items-center space-x-2">
                            <input
                                type="number"
                                placeholder="Từ"
                                value={priceRange === 'custom' || (!priceRange && minPrice) ? minPrice : ''}
                                onChange={(e) => handleCustomRangeChange('minPrice', e.target.value)}
                                disabled={priceRange !== '' && priceRange !== 'custom'}
                                className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${priceRange !== '' && priceRange !== 'custom' ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                            />
                            <span className="text-gray-500">-</span>
                            <input
                                type="number"
                                placeholder="Đến"
                                value={priceRange === 'custom' || (!priceRange && maxPrice) ? maxPrice : ''}
                                onChange={(e) => handleCustomRangeChange('maxPrice', e.target.value)}
                                disabled={priceRange !== '' && priceRange !== 'custom'}
                                className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${priceRange !== '' && priceRange !== 'custom' ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                            />
                        </div>

                        {/* Clear filter button */}
                        {(minPrice || maxPrice) && (
                            <button
                                onClick={() => {
                                    const params = new URLSearchParams(searchParams);
                                    params.delete('minPrice');
                                    params.delete('maxPrice');
                                    params.set('page', '1');
                                    router.push(`${pathname}?${params.toString()}`);
                                }}
                                className="flex items-center text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
                            >
                                <FiXCircle className="mr-1" /> Xóa bộ lọc giá
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
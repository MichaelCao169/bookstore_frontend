'use client';

import React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';


const sortOptions = [
    { value: 'title,asc', label: 'Tên A-Z' },
    { value: 'title,desc', label: 'Tên Z-A' },
    { value: 'currentPrice,asc', label: 'Giá tăng dần' },
    { value: 'currentPrice,desc', label: 'Giá giảm dần' },
    { value: 'createdAt,desc', label: 'Mới nhất' },
    { value: 'soldCount,desc', label: 'Bán chạy nhất' },
];

const ProductSortFilterClient = () => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Lấy tham số sắp xếp hiện tại từ URL
    const currentSort = searchParams.get('sort') || 'title,asc';

    // Xử lý thay đổi sắp xếp
    const handleSortChange = (e) => {
        const newSort = e.target.value;
        const params = new URLSearchParams(searchParams);

        // Cập nhật sort param
        params.set('sort', newSort);

        // Giữ nguyên trang hiện tại
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="w-full flex justify-start items-center gap-4 mb-6">
            {/* Sort Options */}
            <div className="flex items-center gap-2">
                <label htmlFor="sort" className="text-gray-600 dark:text-gray-400 whitespace-nowrap">Sắp xếp theo:</label>
                <select
                    id="sort"
                    className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm"
                    value={currentSort}
                    onChange={handleSortChange}
                >
                    {sortOptions.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default ProductSortFilterClient; 
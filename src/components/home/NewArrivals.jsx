'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiClock, FiTag } from 'react-icons/fi';

const NewArrivals = ({ products = [] }) => {
    if (!products || products.length === 0) {
        return (
            <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow text-gray-500 dark:text-gray-400">
                <FiClock className="mx-auto h-10 w-10 mb-3 text-gray-400 dark:text-gray-500" />
                <p>Đang tải sách mới...</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">            {products.map((product) => (
            <Link
                key={product.productId}
                href={`/products/${product.productId}`}
                className="group relative flex flex-col bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 h-full"
            >
                {/* New badge */}
                <div className="absolute top-3 right-3 z-10">
                    <div className="bg-green-100 dark:bg-green-900/70 text-green-800 dark:text-green-300 px-2 py-1 rounded text-xs font-bold">
                        Mới
                    </div>
                </div>

                {/* Cover image - larger than normal product cards */}
                <div className="relative w-full h-72 overflow-hidden border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700">
                    <Image
                        src={product.coverLink || '/sample_books.jpg'}
                        alt={product.title}
                        fill
                        className="object-contain transform group-hover:scale-110 transition-transform duration-700"
                    />
                </div>

                {/* Product details - minimal to emphasize the cover */}
                <div className="p-4 flex flex-col flex-grow">
                    {/* Category if available */}
                    {product.category && (
                        <div className="flex items-center mb-2 text-xs">
                            <FiTag className="mr-1 text-gray-500 dark:text-gray-400" />
                            <span className="text-gray-500 dark:text-gray-400">
                                {product.category.name}
                            </span>
                        </div>
                    )}

                    {/* Book title */}
                    <h3 className="font-semibold text-gray-800 dark:text-white mb-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-2">
                        {product.title}
                    </h3>

                    {/* Author */}
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        tác giả: {product.author}
                    </p>                        {/* Price */}
                    <div className="mt-auto">
                        <span className="font-bold text-orange-600 dark:text-orange-400">
                            {product.currentPrice?.toLocaleString('vi-VN')} ₫
                        </span>
                    </div>
                </div>
            </Link>
        ))}
        </div>
    );
};

export default NewArrivals; 
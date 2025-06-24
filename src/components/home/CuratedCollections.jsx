'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiAward, FiClock, FiStar } from 'react-icons/fi';

const StarRating = ({ rating = 0 }) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
        <div className="flex text-yellow-500">
            {[...Array(fullStars)].map((_, i) => (
                <FiStar key={`full-${i}`} className="w-4 h-4 fill-current" />
            ))}
            {halfStar && (
                <span className="relative">
                    <FiStar className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                    <FiStar className="w-2 h-4 fill-current text-yellow-500 absolute top-0 left-0 overflow-hidden" />
                </span>
            )}
            {[...Array(emptyStars)].map((_, i) => (
                <FiStar key={`empty-${i}`} className="w-4 h-4 text-gray-300 dark:text-gray-600" />
            ))}
        </div>
    );
};

const CuratedCollections = ({ products = [] }) => {
    if (!products || products.length === 0) {
        return (
            <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow text-gray-500 dark:text-gray-400">
                <FiClock className="mx-auto h-10 w-10 mb-3 text-gray-400 dark:text-gray-500" />
                <p>Đang tải sách bán chạy...</p>
            </div>
        );
    }

    // Luôn hiển thị sách từ API, bất kể có đánh giá hay không
    if (products.length === 0) {
        return (
            <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow text-gray-500 dark:text-gray-400">
                <FiClock className="mx-auto h-10 w-10 mb-3 text-gray-400 dark:text-gray-500" />
                <p>Đang tải sách bán chạy...</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {products.map((product, index) => (
                <Link
                    key={product.productId}
                    href={`/products/${product.productId}`}
                    className="flex flex-col sm:flex-row bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 group"
                >
                    {/* Bestseller badge */}
                    <div className="absolute top-3 left-3 z-10">
                        <div className="flex items-center bg-amber-100 dark:bg-amber-900/70 text-amber-800 dark:text-amber-300 px-2 py-1 rounded text-xs font-bold">
                            <FiAward className="mr-1" />
                            Bán chạy #{index + 1}
                        </div>
                    </div>

                    {/* Product image */}
                    <div className="relative h-60 sm:h-auto sm:w-1/3 overflow-hidden bg-gray-100 dark:bg-gray-700">
                        <Image
                            src={product.coverLink || '/sample_books.jpg'}
                            alt={product.title}
                            fill
                            className="object-contain group-hover:scale-105 transition-transform duration-500"
                        />
                    </div>

                    {/* Product details */}
                    <div className="p-5 flex flex-col flex-grow sm:w-2/3">
                        <div className="mb-2">
                            <div className="flex items-center mb-1">
                                {product.averageRating > 0 ? (
                                    <>
                                        <StarRating rating={product.averageRating} />
                                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                                            ({product.reviewCount || 0} đánh giá)
                                        </span>
                                    </>
                                ) : product.soldCount > 0 ? (
                                    <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                                        <FiStar className="mr-1 text-orange-500" />
                                        Đã bán {product.soldCount} cuốn
                                    </span>
                                ) : (
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        Sản phẩm mới
                                    </span>
                                )}
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                                {product.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">tác giả: {product.author}</p>
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-4">
                            {product.description || "Một cuốn sách hấp dẫn đã trở thành một trong những tác phẩm phổ biến nhất của chúng tôi."}
                        </p>

                        <div className="mt-auto">
                            <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                                {product.currentPrice?.toLocaleString('vi-VN')} ₫
                            </span>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
};

export default CuratedCollections; 
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiStar, FiTag } from 'react-icons/fi';
import axiosInstance from '@/lib/axiosInstance';

const RecommendedBooks = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecommendedBooks = async () => {
            try {
                setLoading(true);
                // Fetch random products from API
                const response = await axiosInstance.get('/api/products', {
                    params: {
                        page: 0,
                        size: 50,
                        sort: 'title,asc'
                    }
                });

                const allProducts = response.data.content || [];
                // Shuffle and take 8 products
                const shuffled = allProducts.sort(() => 0.5 - Math.random());
                setProducts(shuffled.slice(0, 8));
            } catch (error) {
                console.error('Error fetching recommended books:', error);
                // Keep empty array on error
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendedBooks();
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md animate-pulse">
                        <div className="w-full h-72 bg-gray-300 dark:bg-gray-600"></div>
                        <div className="p-4 space-y-2">
                            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!products || products.length === 0) {
        return (
            <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow text-gray-500 dark:text-gray-400">
                <FiStar className="mx-auto h-10 w-10 mb-3 text-gray-400 dark:text-gray-500" />
                <p>Không có sách đề xuất nào</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {products.map((product) => (
                <Link
                    key={product.productId}
                    href={`/products/${product.productId}`}
                    className="group relative flex flex-col bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 h-full"
                >
                    {/* Recommended badge */}
                    <div className="absolute top-3 right-3 z-10">
                        <div className="bg-orange-100 dark:bg-orange-900/70 text-orange-800 dark:text-orange-300 px-2 py-1 rounded text-xs font-bold">
                            Đề xuất
                        </div>
                    </div>

                    {/* Cover image */}
                    <div className="relative w-full h-72 overflow-hidden border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700">
                        <Image
                            src={product.coverLink || '/sample_books.jpg'}
                            alt={product.title}
                            fill
                            className="object-contain transform group-hover:scale-110 transition-transform duration-700"
                        />
                    </div>

                    {/* Product details */}
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
                        </p>

                        {/* Price */}
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

export default RecommendedBooks; 
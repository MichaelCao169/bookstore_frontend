'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiBookOpen } from 'react-icons/fi';
import axiosInstance from '@/lib/axiosInstance';

const AuthorSpotlight = () => {
    const [featuredAuthor, setFeaturedAuthor] = useState({
        name: 'Cal Newport',
        bio: 'Cal Newport là một tác giả, giáo sư khoa học máy tính tại Đại học Georgetown và là diễn giả nổi tiếng về năng suất và công việc trí óc sâu sắc. Ông nổi bật với các tác phẩm như "Làm Việc Sâu" và "Chủ Nghĩa Tối Giản Kỹ Thuật Số", tập trung vào cách tối ưu hóa hiệu suất và sống một cuộc sống có chủ đích trong thời đại công nghệ số.',
        image: '/images/author.jpg',
        books: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAuthorBooks = async () => {
            try {
                setLoading(true);
                // Fetch sách của Cal Newport từ API
                const response = await axiosInstance.get('/api/products', {
                    params: {
                        keyword: 'Cal Newport',
                        size: 3, // Chỉ lấy 3 cuốn sách nổi bật
                        sort: 'soldCount,desc' // Sắp xếp theo số lượng bán giảm dần
                    }
                });

                const books = response.data.content.map(product => ({
                    productId: product.productId,
                    title: product.title,
                    cover: product.coverLink,
                    currentPrice: product.currentPrice
                }));

                setFeaturedAuthor(prev => ({
                    ...prev,
                    books: books
                }));
            } catch (error) {
                console.error('Error fetching author books:', error);
                // Giữ nguyên state ban đầu nếu có lỗi
            } finally {
                setLoading(false);
            }
        };

        fetchAuthorBooks();
    }, []);

    const getImageSrc = (path) => {
        return path || '/sample_books.jpg';
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
                {/* Author info section */}
                <div className="md:col-span-1 p-6 bg-gradient-to-br from-orange-600 to-orange-800 text-white">
                    <div className="flex flex-col h-full">
                        <div className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-white/30">
                            <Image
                                src={getImageSrc(featuredAuthor.image)}
                                alt={featuredAuthor.name}
                                fill
                                className="object-cover"
                            />
                        </div>

                        <h3 className="text-2xl font-bold text-center mb-4">{featuredAuthor.name}</h3>

                        <p className="text-sm text-white/90 mb-6 flex-grow">
                            {featuredAuthor.bio}
                        </p>
                    </div>
                </div>

                {/* Author's books section */}
                <div className="md:col-span-2 lg:col-span-3 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
                            <FiBookOpen className="mr-2 text-orange-600 dark:text-blue-400" />
                            Sách nổi bật của {featuredAuthor.name}
                        </h3>

                        <Link
                            href={`/products?keyword=${encodeURIComponent(featuredAuthor.name)}`}
                            className="text-orange-600 dark:text-orange-400 hover:underline text-sm font-medium"
                        >
                            Xem tất cả sách
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {loading ? (
                            // Loading skeleton
                            Array.from({ length: 3 }).map((_, index) => (
                                <div key={index} className="flex bg-gray-50 dark:bg-gray-700/50 rounded-lg overflow-hidden animate-pulse">
                                    <div className="w-1/3 h-32 bg-gray-300 dark:bg-gray-600"></div>
                                    <div className="w-2/3 p-3 space-y-2">
                                        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                                        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                                        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                                    </div>
                                </div>
                            ))
                        ) : featuredAuthor.books.length > 0 ? (
                            featuredAuthor.books.map(book => (
                                <Link
                                    key={book.productId}
                                    href={`/products/${book.productId}`}
                                    className="group flex bg-gray-50 dark:bg-gray-700/50 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200"
                                >
                                    {/* Book cover */}
                                    <div className="w-1/3 relative h-32 overflow-hidden">
                                        <Image
                                            src={getImageSrc(book.cover)}
                                            alt={book.title}
                                            fill
                                            className="object-contain"
                                        />
                                    </div>

                                    {/* Book info */}
                                    <div className="w-2/3 p-3">
                                        <h4 className="font-medium text-gray-800 dark:text-white mb-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-200 line-clamp-2">
                                            {book.title}
                                        </h4>
                                        <p className="text-sm font-bold text-orange-600 dark:text-orange-400 mt-2">
                                            {book.currentPrice?.toLocaleString('vi-VN')} ₫
                                        </p>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
                                Không tìm thấy sách của tác giả này
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthorSpotlight; 
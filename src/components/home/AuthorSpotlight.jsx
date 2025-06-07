'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiArrowRight, FiBookOpen } from 'react-icons/fi';


const featuredAuthor =
{
    id: 'cal-newport',
    name: 'Cal Newport',
    bio: 'Cal Newport là một tác giả, giáo sư khoa học máy tính tại Đại học Georgetown và là diễn giả nổi tiếng về năng suất và công việc trí óc sâu sắc. Ông nổi bật với các tác phẩm như "Làm Việc Sâu" và "Chủ Nghĩa Tối Giản Kỹ Thuật Số", tập trung vào cách tối ưu hóa hiệu suất và sống một cuộc sống có chủ đích trong thời đại công nghệ số.',
    image: '/images/author.jpg', books: [
        {
            productId: 'book1',
            title: 'Làm Việc Sâu: Quy Tắc Thành Công Trong Thế Giới Đầy Xao Nhãng',
            cover: '/images/book1.jpg',
            currentPrice: 195000,
        },
        {
            productId: 'book2',
            title: 'Chủ Nghĩa Tối Giản Kỹ Thuật Số: Lựa Chọn Cuộc Sống Tập Trung Trong Thế Giới Ồn Ào',
            cover: '/images/book2.jpg',
            currentPrice: 180000,
        },
        {
            productId: 'book3',
            title: 'Giỏi Đến Mức Họ Không Thể Phớt Lờ Bạn',
            cover: '/images/book3.jpg',
            currentPrice: 175000,
        }
    ]
}


const AuthorSpotlight = () => {
    // Use placeholder images if needed
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

                        <Link
                            href={`/authors/${featuredAuthor.id}`}
                            className="inline-flex items-center justify-center w-full px-4 py-2 bg-white/20 hover:bg-white/30 rounded-md text-white font-medium transition-colors duration-200"
                        >
                            Xem trang tác giả
                            <FiArrowRight className="ml-2" />
                        </Link>
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
                            href={`/authors/${featuredAuthor.id}`}
                            className="text-orange-600 dark:text-orange-400 hover:underline text-sm font-medium"
                        >
                            Xem tất cả sách
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">                        {featuredAuthor.books.map(book => (
                        <Link
                            key={book.productId}
                            href={`/products/${book.productId}`}
                            className="group flex bg-gray-50 dark:bg-gray-700/50 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200"
                        >
                            {/* Book cover */}
                            <div className="w-1/3 relative h-32">
                                <Image
                                    src={getImageSrc(book.cover)}
                                    alt={book.title}
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            {/* Book info */}
                            <div className="w-2/3 p-3">
                                <h4 className="font-medium text-gray-800 dark:text-white mb-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-200 line-clamp-2">
                                    {book.title}
                                </h4>                                    <p className="text-sm font-bold text-orange-600 dark:text-orange-400 mt-2">
                                    {book.currentPrice?.toLocaleString('vi-VN')} ₫
                                </p>
                            </div>
                        </Link>
                    ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthorSpotlight; 
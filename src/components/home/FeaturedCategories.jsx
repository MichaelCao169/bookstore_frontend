'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiBookOpen, FiHeart, FiAward, FiFeather, FiCoffee, FiGlobe } from 'react-icons/fi';
import axiosInstance from '@/lib/axiosInstance';

// Map category names to icons and styles
const categoryStyles = {
    'Tiểu thuyết': {
        icon: <FiBookOpen className="w-6 h-6" />,
        bgColor: "bg-blue-100 dark:bg-blue-900/30",
        textColor: "text-blue-800 dark:text-blue-300",
        borderColor: "border-blue-200 dark:border-blue-800/50",
        image: "/images/fiction.jpg",
    },
    'Lãng mạn': {
        icon: <FiHeart className="w-6 h-6" />,
        bgColor: "bg-rose-100 dark:bg-rose-900/30",
        textColor: "text-rose-800 dark:text-rose-300",
        borderColor: "border-rose-200 dark:border-rose-800/50",
        image: "/images/romance.jpg",
    },
    'Phát triển bản thân': {
        icon: <FiAward className="w-6 h-6" />,
        bgColor: "bg-amber-100 dark:bg-amber-900/30",
        textColor: "text-amber-800 dark:text-amber-300",
        borderColor: "border-amber-200 dark:border-amber-800/50",
        image: "/images/self-help.jpg",
    },
    'Tiểu sử': {
        icon: <FiFeather className="w-6 h-6" />,
        bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
        textColor: "text-emerald-800 dark:text-emerald-300",
        borderColor: "border-emerald-200 dark:border-emerald-800/50",
        image: "/images/biography.jpg",
    },
    'Nấu ăn': {
        icon: <FiCoffee className="w-6 h-6" />,
        bgColor: "bg-orange-100 dark:bg-orange-900/30",
        textColor: "text-orange-800 dark:text-orange-300",
        borderColor: "border-orange-200 dark:border-orange-800/50",
        image: "/images/cooking.jpg",
    },
    'Du lịch': {
        icon: <FiGlobe className="w-6 h-6" />,
        bgColor: "bg-indigo-100 dark:bg-indigo-900/30",
        textColor: "text-indigo-800 dark:text-indigo-300",
        borderColor: "border-indigo-200 dark:border-indigo-800/50",
        image: "/images/travel.jpg",
    },
};

const FeaturedCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axiosInstance.get('/api/categories');
                // Lọc ra 6 categories cần hiển thị
                const featuredCategories = response.data.filter(cat =>
                    Object.keys(categoryStyles).includes(cat.name)
                );
                setCategories(featuredCategories);
            } catch (error) {
                console.error('Error fetching categories:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    // Placeholder image handling
    const getImageSrc = (path) => {
        return path || '/sample_books.jpg';
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                    <div key={index} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map(category => {
                const style = categoryStyles[category.name];
                return (
                    <Link
                        key={category.id}
                        href={`/products?categoryId=${category.id}`}
                        className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center h-48 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    >
                        {/* Hình ảnh nền với lớp phủ */}
                        <div className="absolute inset-0 z-0">
                            <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70 group-hover:from-black/50 group-hover:to-black/80 transition-all duration-300 z-10"></div>
                            <Image
                                src={getImageSrc(style?.image)}
                                alt={category.name}
                                fill
                                className="object-cover transform group-hover:scale-110 transition-transform duration-700"
                            />
                        </div>

                        {/* Nội dung icon và văn bản */}
                        <div className="relative z-20 text-center px-6 py-8 w-full">
                            <div className={`mx-auto mb-3 ${style?.bgColor} ${style?.textColor} p-3 rounded-full w-14 h-14 flex items-center justify-center ${style?.borderColor} border transition-transform group-hover:scale-110 duration-300`}>
                                {style?.icon}
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-1">{category.name}</h3>
                            <p className="text-sm text-gray-200 opacity-90">{category.description}</p>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
};

export default FeaturedCategories; 
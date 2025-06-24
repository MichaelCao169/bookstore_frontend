'use client';

import React from 'react';
import Link from 'next/link';
import { FiBookOpen, FiDollarSign, FiTarget, FiUsers, FiTrendingUp, FiCompass } from 'react-icons/fi';


const FEATURED_CATEGORIES = [
    {
        id: 1,
        name: 'Tiểu Thuyết',
        description: 'Khám phá thế giới của trí tưởng tượng',
        icon: <FiBookOpen className="w-6 h-6" />,
        bgGradient: "bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600",
        textColor: "text-white",
        iconBg: "bg-white/20 backdrop-blur-sm",
        iconColor: "text-white",
    },
    {
        id: 8,
        name: 'Tài chính, tiền tệ',
        description: 'Quản lý tài chính thông minh',
        icon: <FiDollarSign className="w-6 h-6" />,
        bgGradient: "bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600",
        textColor: "text-white",
        iconBg: "bg-white/20 backdrop-blur-sm",
        iconColor: "text-white",
    },
    {
        id: 2,
        name: 'Tư duy - kĩ năng sống',
        description: 'Phát triển tư duy và kỹ năng',
        icon: <FiTarget className="w-6 h-6" />,
        bgGradient: "bg-gradient-to-br from-purple-400 via-purple-500 to-indigo-600",
        textColor: "text-white",
        iconBg: "bg-white/20 backdrop-blur-sm",
        iconColor: "text-white",
    },
    {
        id: 15,
        name: 'Quản trị, lãnh đạo',
        description: 'Nghệ thuật lãnh đạo và quản lý',
        icon: <FiUsers className="w-6 h-6" />,
        bgGradient: "bg-gradient-to-br from-indigo-400 via-blue-500 to-purple-600",
        textColor: "text-white",
        iconBg: "bg-white/20 backdrop-blur-sm",
        iconColor: "text-white",
    },
    {
        id: 16,
        name: 'Marketing-bán hàng',
        description: 'Chiến lược marketing hiệu quả',
        icon: <FiTrendingUp className="w-6 h-6" />,
        bgGradient: "bg-gradient-to-br from-orange-400 via-red-500 to-pink-600",
        textColor: "text-white",
        iconBg: "bg-white/20 backdrop-blur-sm",
        iconColor: "text-white",
    },
    {
        id: 6,
        name: 'Giả tưởng -huyền bí-phiêu lưu',
        description: 'Cuộc phiêu lưu đầy bí ẩn',
        icon: <FiCompass className="w-6 h-6" />,
        bgGradient: "bg-gradient-to-br from-rose-400 via-pink-500 to-purple-600",
        textColor: "text-white",
        iconBg: "bg-white/20 backdrop-blur-sm",
        iconColor: "text-white",
    }
];

const FeaturedCategories = () => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURED_CATEGORIES.map(category => (
                <Link
                    key={category.id}
                    href={`/products?categoryId=${category.id}`}
                    className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center h-48 transform hover:scale-105"
                >
                    {/* Gradient Background */}
                    <div className={`absolute inset-0 ${category.bgGradient} transition-all duration-300 group-hover:opacity-90`}>
                        {/* Overlay Pattern for added visual interest */}
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-all duration-300"></div>

                        {/* Subtle pattern overlay */}
                        <div
                            className="absolute inset-0 opacity-30 group-hover:opacity-20 transition-all duration-300"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                            }}
                        ></div>
                    </div>

                    {/* Content */}
                    <div className="relative z-20 text-center px-6 py-8 w-full">
                        <div className={`mx-auto mb-4 ${category.iconBg} ${category.iconColor} p-4 rounded-full w-16 h-16 flex items-center justify-center border border-white/30 transition-all group-hover:scale-110 group-hover:border-white/50 duration-300`}>
                            {category.icon}
                        </div>
                        <h3 className={`text-xl font-bold ${category.textColor} mb-2 drop-shadow-sm`}>
                            {category.name}
                        </h3>
                        <p className={`text-sm ${category.textColor} opacity-90 drop-shadow-sm`}>
                            {category.description}
                        </p>
                    </div>

                    {/* Hover Effect Glow */}
                    <div className="absolute inset-0 rounded-xl bg-white/0 group-hover:bg-white/5 transition-all duration-300 pointer-events-none"></div>
                </Link>
            ))}
        </div>
    );
};

export default FeaturedCategories; 
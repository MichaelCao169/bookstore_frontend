'use client';

import React from 'react';
import { FiPercent, FiGift, FiTruck } from 'react-icons/fi';

const offers = [
    {
        id: 'summer-sale',
        title: 'Khuyến mãi sách mùa hè',
        description: 'Giảm giá đến 36% cho các đầu sách chọn lọc. Chỉ trong thời gian giới hạn!',
        icon: <FiPercent className="h-8 w-8" />,
        bgColor: 'bg-gradient-to-br from-orange-600 to-amber-500',
        textColor: 'text-white',
    },
    {
        id: 'bundle-deals',
        title: 'Mua combo & Tiết kiệm',
        description: 'Mua 3 sách và nhận miễn phí quyển thứ 4. Kết hợp từ các danh mục đã chọn.',
        icon: <FiGift className="h-8 w-8" />,
        bgColor: 'bg-gradient-to-br from-indigo-600 to-blue-500',
        textColor: 'text-white',
    },
    {
        id: 'free-shipping',
        title: 'Miễn phí vận chuyển',
        description: 'Miễn phí vận chuyển cho tất cả đơn hàng trên 360.000₫. Không cần mã giảm giá!',
        icon: <FiTruck className="h-8 w-8" />,
        bgColor: 'bg-gradient-to-br from-emerald-600 to-teal-500',
        textColor: 'text-white',
    }
];



const SpecialOffers = () => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {offers.map((offer) => (
                <div
                    key={offer.id}
                    className={`group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ${offer.bgColor}`}
                >
                    {/* Content */}
                    <div className="relative z-10 p-6">
                        {/* Icon */}
                        <div className="inline-flex mb-3 bg-white/20 p-3 rounded-full">
                            {offer.icon}
                        </div>

                        {/* Title and description */}
                        <h3 className={`text-xl font-bold mb-2 ${offer.textColor}`}>
                            {offer.title}
                        </h3>

                        <p className={`${offer.textColor} opacity-90 text-sm line-clamp-3`}>
                            {offer.description}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SpecialOffers; 
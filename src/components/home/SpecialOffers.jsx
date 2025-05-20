'use client';

import React from 'react';
import Link from 'next/link';
import { FiClock, FiPercent, FiGift, FiTruck } from 'react-icons/fi';

const offers = [
    {
        id: 'summer-sale',
        title: 'Khuyến mãi sách mùa hè',
        description: 'Giảm giá đến 40% cho các đầu sách chọn lọc. Chỉ trong thời gian giới hạn!',
        icon: <FiPercent className="h-8 w-8" />,
        bgColor: 'bg-gradient-to-br from-orange-600 to-amber-500',
        textColor: 'text-white',
        buttonText: 'Mua ngay',
        buttonLink: '/products?sort=price,asc',
        expiryDate: '2023-08-31',
    },
    {
        id: 'bundle-deals',
        title: 'Mua combo & Tiết kiệm',
        description: 'Mua 3 sách và nhận miễn phí quyển thứ 4. Kết hợp từ các danh mục đã chọn.',
        icon: <FiGift className="h-8 w-8" />,
        bgColor: 'bg-gradient-to-br from-indigo-600 to-blue-500',
        textColor: 'text-white',
        buttonText: 'Xem combo',
        buttonLink: '/bundles',
    },
    {
        id: 'free-shipping',
        title: 'Miễn phí vận chuyển',
        description: 'Miễn phí vận chuyển cho tất cả đơn hàng trên 500.000₫. Không cần mã giảm giá!',
        icon: <FiTruck className="h-8 w-8" />,
        bgColor: 'bg-gradient-to-br from-emerald-600 to-teal-500',
        textColor: 'text-white',
        buttonText: 'Tìm hiểu thêm',
        buttonLink: '/shipping',
    }
];

// Component to display a countdown timer for offers with expiry dates
const CountdownTimer = ({ expiryDate }) => {
    const [timeLeft, setTimeLeft] = React.useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    React.useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = new Date(expiryDate) - new Date();
            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                });
            }
        };

        const timer = setInterval(calculateTimeLeft, 1000);
        calculateTimeLeft();

        return () => clearInterval(timer);
    }, [expiryDate]);

    return (
        <div className="inline-flex items-center text-sm">
            <FiClock className="mr-1.5 text-white/80" />
            <div className="flex space-x-1.5">
                <div className="bg-black/20 text-white px-1.5 py-0.5 rounded text-xs">
                    {timeLeft.days}n
                </div>
                <div className="bg-black/20 text-white px-1.5 py-0.5 rounded text-xs">
                    {timeLeft.hours.toString().padStart(2, '0')}g
                </div>
                <div className="bg-black/20 text-white px-1.5 py-0.5 rounded text-xs">
                    {timeLeft.minutes.toString().padStart(2, '0')}p
                </div>
                <div className="bg-black/20 text-white px-1.5 py-0.5 rounded text-xs">
                    {timeLeft.seconds.toString().padStart(2, '0')}g
                </div>
            </div>
        </div>
    );
};

const SpecialOffers = () => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {offers.map((offer) => (
                <div
                    key={offer.id}
                    className={`group relative overflow-hidden rounded-lg shadow-lg h-64 hover:shadow-xl transition-all duration-300 ${offer.bgColor}`}
                >
                    {/* Content */}
                    <div className="relative z-10 h-full flex flex-col justify-between p-6">
                        <div>
                            {/* Icon */}
                            <div className="inline-flex mb-3 bg-white/20 p-3 rounded-full">
                                {offer.icon}
                            </div>

                            {/* Title and description */}
                            <h3 className={`text-xl font-bold mb-2 ${offer.textColor}`}>
                                {offer.title}
                            </h3>

                            <p className={`${offer.textColor} opacity-90 mb-3 text-sm line-clamp-2`}>
                                {offer.description}
                            </p>
                        </div>

                        <div className="flex flex-col">
                            {/* Button and timer in one flex container */}
                            <div className="flex items-center justify-between">
                                {/* CTA Button */}
                                <Link
                                    href={offer.buttonLink}
                                    className="inline-block bg-white text-gray-900 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors duration-200 text-center shadow-md transform group-hover:-translate-y-1 group-hover:shadow-lg transition-all duration-300"
                                >
                                    {offer.buttonText}
                                </Link>

                                {/* Countdown timer if there's an expiry date */}
                                {offer.expiryDate && <CountdownTimer expiryDate={offer.expiryDate} />}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SpecialOffers; 
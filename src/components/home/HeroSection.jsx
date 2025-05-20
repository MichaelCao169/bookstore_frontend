'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const slides = [
    {
        id: 1,
        title: "Banner 1",
        description: "Thiết kế sau",
        image: "/images/banner1.jpg",
        altText: "Bộ sưu tập sách",
        buttonText: "Thiết kế sau",
        buttonLink: "/products",
        bgColor: "from-blue-600 to-indigo-800",
    },
    {
        id: 2,
        title: "Banner 2",
        description: "Thiết kế sau",
        image: "/images/banner2.jpg",
        altText: "Khuyến mãi sách mùa hè",
        buttonText: "Thiết kế sau",
        buttonLink: "/products?sort=price,asc",
        bgColor: "from-orange-500 to-amber-700",
    },
    {
        id: 3,
        title: "Banner 3",
        description: "Thiết kế sau",
        image: "/images/banner3.jpg",
        altText: "Câu lạc bộ sách",
        buttonText: "Thiết kế sau",
        buttonLink: "/about",
        bgColor: "from-emerald-600 to-teal-800",
    }
];

const HeroSection = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [direction, setDirection] = useState(1); // 1 sang phải, -1 sang trái

    // Tự động chuyển slide sau 5 giây
    useEffect(() => {
        const interval = setInterval(() => {
            setDirection(1);
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const nextSlide = () => {
        setDirection(1);
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setDirection(-1);
        setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    };

    const goToSlide = (index) => {
        setDirection(index > currentSlide ? 1 : -1);
        setCurrentSlide(index);
    };

    // Sử dụng hình ảnh mẫu 
    const getImageSrc = (path) => {
        try {
            return path || '/sample_books.jpg';
        } catch (e) {
            return '/sample_books.jpg';
        }
    };

    return (
        <div className="container mx-auto px-4 py-4">
            <div className="max-w-5xl mx-auto relative overflow-hidden bg-gray-900 h-[450px] md:h-[550px] shadow-lg">
                <div className="relative h-full w-full overflow-hidden">
                    {slides.map((slide, index) => (
                        <div
                            key={slide.id}
                            className={`absolute inset-0 w-full h-full transition-all duration-700 ease-in-out
                                ${index === currentSlide ? 'z-20 translate-x-0 opacity-100' :
                                    (direction > 0 ?
                                        (((index - currentSlide + slides.length) % slides.length) === 1 ? 'translate-x-full opacity-100 z-10' : 'translate-x-full opacity-0 z-0') :
                                        (((currentSlide - index + slides.length) % slides.length) === 1 ? '-translate-x-full opacity-100 z-10' : '-translate-x-full opacity-0 z-0')
                                    )
                                }`}
                        >
                            {/* Background with gradient overlay */}
                            <div className={`absolute inset-0 bg-gradient-to-r ${slide.bgColor} opacity-80 z-10`}></div>

                            {/* Background image */}
                            <div className="absolute inset-0">
                                <Image
                                    src={getImageSrc(slide.image)}
                                    alt={slide.altText}
                                    fill
                                    priority={index === 0}
                                    className={`object-cover transform transition-transform duration-700 ${index === currentSlide ? 'scale-105' : 'scale-100'}`}
                                />
                            </div>

                            {/* Content */}
                            <div className="relative z-30 flex h-full">
                                <div className="container mx-auto px-4 md:px-8 flex items-center">
                                    <div className={`max-w-lg text-white transition-all duration-700 delay-200 ${index === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">{slide.title}</h1>
                                        <p className="text-lg md:text-xl opacity-90 mb-8">{slide.description}</p>
                                        <Link href={slide.buttonLink} className="inline-block px-6 py-3 bg-white text-gray-900 font-medium hover:bg-gray-100 transition-colors duration-200 shadow-lg">
                                            {slide.buttonText}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Navigation arrows */}
                <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 z-30 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white focus:outline-none"
                    aria-label="Previous slide"
                >
                    <FiChevronLeft size={24} />
                </button>

                <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white focus:outline-none"
                    aria-label="Next slide"
                >
                    <FiChevronRight size={24} />
                </button>

                {/* Indicator dots */}
                <div className="absolute bottom-6 left-0 right-0 z-30 flex justify-center space-x-3">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`h-2.5 w-2.5 rounded-full transition-colors duration-200 ${index === currentSlide
                                ? 'bg-white w-8'
                                : 'bg-white/50 hover:bg-white/75'
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        ></button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HeroSection; 
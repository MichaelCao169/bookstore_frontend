'use client';
import Link from 'next/link';
import { FiHome, FiSearch, FiArrowLeft } from 'react-icons/fi';
import { LiaAtomSolid } from 'react-icons/lia';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function NotFound() {
    const [mounted, setMounted] = useState(false);

    // Animation effect when component mounts
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null; // Prevent flash of content
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
            <div className="max-w-lg w-full">
                {/* 404 Page Title */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-8"
                >
                    <div className="flex justify-center mb-4">
                        <div className="relative">
                            <LiaAtomSolid className="text-6xl text-orange-500 dark:text-orange-400" />
                            <div className="absolute -right-2 -top-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                ?
                            </div>
                        </div>
                    </div>
                    <h1 className="text-5xl font-bold text-gray-800 dark:text-white">404</h1>
                    <p className="text-2xl mt-2 text-gray-600 dark:text-gray-300">Trang không tìm thấy</p>
                </motion.div>

                {/* Book illustration */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="relative flex justify-center mb-8"
                >
                    <div className="relative w-60 h-60">
                        <div className="absolute inset-0 transform rotate-3 rounded-lg bg-orange-500 shadow-lg"></div>
                        <div className="absolute inset-0 transform -rotate-3 rounded-lg bg-blue-500 shadow-lg"></div>
                        <div className="absolute inset-0 transform rotate-0 rounded-lg bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center p-4">
                            <div className="text-center">
                                <div className="w-full border-b-2 border-dashed border-gray-300 dark:border-gray-600 mb-4"></div>
                                <p className="text-gray-500 dark:text-gray-400 italic">
                                    "Không tìm thấy thông tin này trong thư viện của chúng tôi."
                                </p>
                                <div className="w-full border-b-2 border-dashed border-gray-300 dark:border-gray-600 mt-4"></div>
                                <div className="flex justify-center mt-4">
                                    <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700">
                                        <FiSearch className="w-full h-full p-2 text-gray-500 dark:text-gray-400" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Action buttons */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                    <Link href="/" className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 transition-colors">
                        <FiHome className="mr-2" />
                        Về trang chủ
                    </Link>
                    <Link href="/products" className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-base font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <LiaAtomSolid className="mr-2" />
                        Khám phá sách
                    </Link>
                </motion.div>

                {/* Extra suggestion */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="text-center mt-10 text-gray-500 dark:text-gray-400 text-sm"
                >
                    <p>Bạn có thể thử tìm kiếm hoặc kiểm tra lại đường dẫn.</p>
                    <div className="flex justify-center mt-2">
                        <Link href="/" className="flex items-center text-orange-600 dark:text-orange-400 hover:underline">
                            <FiArrowLeft className="mr-1" />
                            <span>Quay lại trang trước</span>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
} 
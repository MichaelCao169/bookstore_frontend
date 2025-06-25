'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FiMail, FiArrowRight, FiLogIn } from 'react-icons/fi';

export default function RegisterConfirmation() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email');

    // Redirect to home if no email parameter
    useEffect(() => {
        if (!email) {
            router.push('/');
        }
    }, [email, router]);

    if (!email) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h1 className="text-center text-4xl font-bold text-orange-600">AtomikBooks</h1>
                <h2 className="mt-6 text-center text-2xl font-bold text-gray-900 dark:text-white">
                    Đăng ký thành công!
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <div className="text-center py-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-6">
                            <FiMail className="h-10 w-10 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Vui lòng xác thực email của bạn</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            Chúng tôi đã gửi một email xác thực đến <strong>{email}</strong>.
                            Vui lòng kiểm tra hộp thư đến của bạn và nhấp vào liên kết xác thực để hoàn tất đăng ký.
                        </p>
                        <div className="mt-8 space-y-4">
                            <Link
                                href="/login"
                                className="block w-full text-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                            >
                                <FiLogIn className="inline-block mr-2" />
                                Đến trang đăng nhập
                            </Link>
                            <Link
                                href="/"
                                className="block w-full text-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                            >
                                <FiArrowRight className="inline-block mr-2" />
                                Về trang chủ
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 
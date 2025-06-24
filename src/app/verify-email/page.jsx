'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import axiosInstance from '@/lib/axiosInstance';
import { FiCheckCircle, FiAlertCircle, FiLoader, FiMail, FiArrowRight } from 'react-icons/fi';
import BrandSpinner from '@/components/ui/BrandSpinner';

export default function VerifyEmail() {
    const [verifying, setVerifying] = useState(true);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    useEffect(() => {
        const verifyEmail = async () => {
            // If there's no token, we can't verify
            if (!token) {
                setVerifying(false);
                setError('Không tìm thấy mã xác thực. Vui lòng kiểm tra lại đường dẫn.');
                return;
            }

            try {
                // Call the API to verify the email
                await axiosInstance.get(`/auth/verify-email?token=${token}`);
                setSuccess(true);
                setVerifying(false);
            } catch (err) {
                console.error('Email verification error:', err);
                setVerifying(false);

                // Handle error messages from the API
                if (err.response) {
                    if (err.response.status === 404) {
                        setError('Mã xác thực không hợp lệ hoặc đã hết hạn.');
                    } else if (err.response.data && err.response.data.message) {
                        setError(err.response.data.message);
                    } else {
                        setError('Đã xảy ra lỗi khi xác thực email. Vui lòng thử lại sau.');
                    }
                } else {
                    setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet của bạn.');
                }
            }
        };

        verifyEmail();
    }, [token]);

    // Redirect to login after successful verification
    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => {
                router.push('/login');
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [success, router]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h1 className="text-center text-4xl font-bold text-orange-600">AtomikBooks</h1>
                <h2 className="mt-6 text-center text-2xl font-bold text-gray-900 dark:text-white">
                    Xác thực tài khoản
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">                    {verifying ? (
                    <div className="text-center py-8">
                        <BrandSpinner
                            size="text-5xl"
                            text="Đang xác thực email của bạn..."
                            textColor="text-lg text-gray-700 dark:text-gray-300"
                        />
                    </div>
                ) : success ? (
                    <div className="text-center py-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
                            <FiCheckCircle className="h-10 w-10 text-green-600" />
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Xác thực thành công!</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            Tài khoản của bạn đã được xác thực thành công. Bây giờ bạn có thể đăng nhập.
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                            Đang chuyển hướng đến trang đăng nhập...
                        </p>
                        <Link
                            href="/login"
                            className="inline-flex items-center font-medium text-orange-600 hover:text-orange-500 dark:text-orange-400 dark:hover:text-orange-300"
                        >
                            Đến trang đăng nhập <FiArrowRight className="ml-1" />
                        </Link>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-6">
                            <FiAlertCircle className="h-10 w-10 text-red-600" />
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Xác thực thất bại</h3>
                        <p className="text-red-600 dark:text-red-400 mb-6">{error}</p>
                        <div className="mt-4 space-y-4">
                            <Link
                                href="/login"
                                className="block w-full text-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                            >
                                Đến trang đăng nhập
                            </Link>
                            <Link
                                href="/"
                                className="block w-full text-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                            >
                                Về trang chủ
                            </Link>
                        </div>
                    </div>
                )}
                </div>
            </div>
        </div>
    );
} 
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import axiosInstance from '@/lib/axiosInstance';
import { FiMail, FiArrowLeft, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});

    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const isAuthLoading = useAuthStore((state) => state.isLoading);
    const router = useRouter();

    // Redirect nếu đã đăng nhập
    useEffect(() => {
        if (!isAuthLoading && isAuthenticated) {
            console.log('Forgot Password Page: User already authenticated, redirecting to home');
            router.replace('/');
        }
    }, [isAuthenticated, isAuthLoading, router]);

    // Validate email
    const validateForm = () => {
        const errors = {};

        if (!email) {
            errors.email = 'Vui lòng nhập email';
        } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
            errors.email = 'Email không hợp lệ';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await axiosInstance.post('/auth/forgot-password', { email });

            console.log('Phản hồi API quên mật khẩu:', response.data);
            setSuccess(true);
            setEmail(''); // Xóa email sau khi gửi thành công
        } catch (err) {
            console.error('Lỗi API quên mật khẩu:', err.response || err);
            // Lưu ý: Backend có thể trả về 200 thay vì lỗi để tránh tiết lộ thông tin
            // Vì vậy chúng ta phải xử lý lỗi thực sự là 500 hoặc 503
            if (err.response?.status >= 500) {
                setError('Đã xảy ra lỗi trong quá trình xử lý yêu cầu. Vui lòng thử lại sau.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Hiển thị loading khi đang kiểm tra trạng thái xác thực
    if (isAuthLoading) {
        return (
            <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 items-center">
                <p className="text-gray-600 dark:text-gray-400">Đang kiểm tra xác thực...</p>
                <div className="mt-4 w-8 h-8 border-t-2 border-b-2 border-orange-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    // Hiển thị trang quên mật khẩu
    return (
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-white dark:bg-gray-900">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <h1 className="text-center text-4xl font-bold text-orange-600">AtomikBooks</h1>
                <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-white">
                    Quên mật khẩu
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                    Nhập email của bạn và chúng tôi sẽ gửi liên kết đặt lại mật khẩu
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-sm">
                {success ? (
                    <div className="rounded-md bg-green-50 dark:bg-green-900/30 p-4 mb-4">
                        <div className="flex">
                            <FiCheckCircle className="h-5 w-5 text-green-400 mr-2" />
                            <div>
                                <p className="text-sm font-medium text-green-800 dark:text-green-400">
                                    Yêu cầu đặt lại mật khẩu đã được gửi!
                                </p>
                                <p className="mt-2 text-sm text-green-700 dark:text-green-300">
                                    Nếu có tài khoản với email {email}, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu.
                                    Vui lòng kiểm tra hộp thư của bạn (và thư mục spam nếu cần).
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200"
                            >
                                Địa chỉ email
                            </label>
                            <div className="mt-2 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FiMail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={`block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 shadow-sm outline-none ${validationErrors.email
                                        ? 'border-2 border-red-500 focus:border-red-500 dark:border-red-500'
                                        : 'border border-gray-300 dark:border-gray-600 focus:border-2 focus:border-orange-600 dark:focus:border-orange-500'
                                        } placeholder:text-gray-400 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:text-white`}
                                    placeholder="your-email@example.com"
                                />
                            </div>
                            {validationErrors.email && (
                                <p className="mt-2 text-sm text-red-600 dark:text-red-500 flex items-center">
                                    <FiAlertCircle className="mr-1" /> {validationErrors.email}
                                </p>
                            )}
                        </div>

                        {error && (
                            <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-4">
                                <div className="flex">
                                    <FiAlertCircle className="h-5 w-5 text-red-400 mr-2" />
                                    <p className="text-sm text-red-700 dark:text-red-400 font-medium">{error}</p>
                                </div>
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex w-full justify-center rounded-md bg-orange-600 px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Đang gửi...
                                    </>
                                ) : (
                                    'Gửi liên kết đặt lại mật khẩu'
                                )}
                            </button>
                        </div>
                    </form>
                )}

                <div className="mt-6">
                    <Link
                        href="/login"
                        className="flex items-center justify-center text-sm font-medium text-orange-600 hover:text-orange-500 dark:text-orange-400 dark:hover:text-orange-300"
                    >
                        <FiArrowLeft className="mr-2" />
                        Quay lại trang đăng nhập
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage; 
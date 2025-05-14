'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import axiosInstance from '@/lib/axiosInstance';
import { FiLock, FiArrowLeft, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

const ResetPasswordPage = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [passwordStrength, setPasswordStrength] = useState({
        score: 0,
        message: ''
    });

    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const isAuthLoading = useAuthStore((state) => state.isLoading);
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    // Redirect nếu đã đăng nhập hoặc không có token
    useEffect(() => {
        if (!isAuthLoading) {
            if (isAuthenticated) {
                console.log('Reset Password Page: User already authenticated, redirecting to home');
                router.replace('/');
            } else if (!token) {
                console.log('Reset Password Page: No token provided, redirecting to forgot-password');
                setError('Không tìm thấy mã xác thực. Vui lòng yêu cầu lại liên kết đặt lại mật khẩu.');
            }
        }
    }, [isAuthenticated, isAuthLoading, router, token]);

    // Đánh giá độ mạnh của mật khẩu và cập nhật trạng thái
    const evaluatePasswordStrength = (pass) => {
        if (!pass) {
            setPasswordStrength({ score: 0, message: '' });
            return;
        }

        let score = 0;
        let message = '';

        // Tiêu chí độ mạnh
        const hasLength = pass.length >= 8;
        const hasUpperCase = /[A-Z]/.test(pass);
        const hasLowerCase = /[a-z]/.test(pass);
        const hasNumbers = /\d/.test(pass);
        const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(pass);

        // Tính điểm
        if (hasLength) score += 1;
        if (hasUpperCase) score += 1;
        if (hasLowerCase) score += 1;
        if (hasNumbers) score += 1;
        if (hasSpecialChars) score += 1;

        // Đặt thông báo tương ứng
        if (score === 0) message = '';
        else if (score <= 2) message = 'Yếu';
        else if (score <= 4) message = 'Trung bình';
        else message = 'Mạnh';

        setPasswordStrength({ score, message });
    };

    // Cập nhật đánh giá mật khẩu khi mật khẩu thay đổi
    useEffect(() => {
        evaluatePasswordStrength(newPassword);
    }, [newPassword]);

    // Validate form
    const validateForm = () => {
        const errors = {};

        if (!newPassword) {
            errors.newPassword = 'Vui lòng nhập mật khẩu mới';
        } else if (newPassword.length < 8) {
            errors.newPassword = 'Mật khẩu phải có ít nhất 8 ký tự';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
            errors.newPassword = 'Mật khẩu phải có chữ hoa, chữ thường và số';
        }

        if (!confirmPassword) {
            errors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
        } else if (newPassword !== confirmPassword) {
            errors.confirmPassword = 'Mật khẩu không khớp';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Render password strength indicator
    const renderPasswordStrengthIndicator = () => {
        if (!newPassword) return null;

        const getColorClass = () => {
            if (passwordStrength.score <= 2) return 'bg-red-500';
            if (passwordStrength.score <= 4) return 'bg-yellow-500';
            return 'bg-green-500';
        };

        return (
            <div className="mt-2">
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className={`h-full ${getColorClass()}`}
                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                    ></div>
                </div>
                <p className={`text-xs mt-1 ${passwordStrength.score <= 2
                    ? 'text-red-600'
                    : passwordStrength.score <= 4
                        ? 'text-yellow-600'
                        : 'text-green-600'
                    }`}>
                    {passwordStrength.message && `Độ mạnh: ${passwordStrength.message}`}
                </p>
            </div>
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!token) {
            setError('Không tìm thấy mã xác thực. Vui lòng yêu cầu lại liên kết đặt lại mật khẩu.');
            return;
        }

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await axiosInstance.post('/auth/reset-password', {
                token,
                newPassword
            });

            console.log('Phản hồi API đặt lại mật khẩu:', response.data);
            setSuccess(true);

            // Xóa form
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            console.error('Lỗi API đặt lại mật khẩu:', err.response || err);

            const errorMessage = err.response?.data;
            if (errorMessage && typeof errorMessage === 'string') {
                if (errorMessage.includes('token') || errorMessage.includes('Token')) {
                    setError('Mã xác thực không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu lại liên kết đặt lại mật khẩu.');
                } else {
                    setError(errorMessage.replace('Error:', 'Lỗi:'));
                }
            } else {
                setError('Đã xảy ra lỗi khi đặt lại mật khẩu. Vui lòng thử lại sau.');
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

    // Hiển thị trang đặt lại mật khẩu
    return (
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-white dark:bg-gray-900">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <h1 className="text-center text-4xl font-bold text-orange-600">AtomicBooks</h1>
                <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-white">
                    Đặt lại mật khẩu
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                    Tạo mật khẩu mới cho tài khoản của bạn
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-sm">
                {success ? (
                    <div className="rounded-md bg-green-50 dark:bg-green-900/30 p-4 mb-4">
                        <div className="flex">
                            <FiCheckCircle className="h-5 w-5 text-green-400 mr-2" />
                            <div>
                                <p className="text-sm font-medium text-green-800 dark:text-green-400">
                                    Đặt lại mật khẩu thành công!
                                </p>
                                <p className="mt-2 text-sm text-green-700 dark:text-green-300">
                                    Mật khẩu của bạn đã được cập nhật. Bây giờ bạn có thể đăng nhập bằng mật khẩu mới.
                                </p>
                                <div className="mt-4">
                                    <Link
                                        href="/login"
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                                    >
                                        Đến trang đăng nhập
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
                        {!token && (
                            <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-4">
                                <div className="flex">
                                    <FiAlertCircle className="h-5 w-5 text-red-400 mr-2" />
                                    <div>
                                        <p className="text-sm text-red-700 dark:text-red-400 font-medium">
                                            Không tìm thấy mã xác thực
                                        </p>
                                        <p className="mt-2 text-sm text-red-700 dark:text-red-300">
                                            Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu lại liên kết đặt lại mật khẩu.
                                        </p>
                                        <div className="mt-4">
                                            <Link
                                                href="/forgot-password"
                                                className="text-sm font-medium text-orange-600 hover:text-orange-500 dark:text-orange-400 dark:hover:text-orange-300"
                                            >
                                                Quên mật khẩu?
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {token && (
                            <>
                                {/* Trường Mật khẩu mới */}
                                <div>
                                    <label
                                        htmlFor="newPassword"
                                        className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200"
                                    >
                                        Mật khẩu mới
                                    </label>
                                    <div className="mt-2 relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FiLock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="newPassword"
                                            name="newPassword"
                                            type="password"
                                            autoComplete="new-password"
                                            required
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className={`block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 shadow-sm outline-none ${validationErrors.newPassword
                                                ? 'border-2 border-red-500 focus:border-red-500 dark:border-red-500'
                                                : 'border border-gray-300 dark:border-gray-600 focus:border-2 focus:border-orange-600 dark:focus:border-orange-500'
                                                } placeholder:text-gray-400 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:text-white`}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    {renderPasswordStrengthIndicator()}
                                    {validationErrors.newPassword && (
                                        <p className="mt-2 text-sm text-red-600 dark:text-red-500 flex items-center">
                                            <FiAlertCircle className="mr-1" /> {validationErrors.newPassword}
                                        </p>
                                    )}
                                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                        <p>Mật khẩu phải có:</p>
                                        <ul className="list-disc pl-5 mt-1 space-y-1">
                                            <li className={`flex items-center ${newPassword.length >= 8 ? 'text-green-600 dark:text-green-400' : ''}`}>
                                                {newPassword.length >= 8 ? <FiCheckCircle className="mr-1" /> : <span className="w-4 mr-1"></span>}
                                                Ít nhất 8 ký tự
                                            </li>
                                            <li className={`flex items-center ${/[A-Z]/.test(newPassword) ? 'text-green-600 dark:text-green-400' : ''}`}>
                                                {/[A-Z]/.test(newPassword) ? <FiCheckCircle className="mr-1" /> : <span className="w-4 mr-1"></span>}
                                                Ít nhất 1 chữ hoa
                                            </li>
                                            <li className={`flex items-center ${/[a-z]/.test(newPassword) ? 'text-green-600 dark:text-green-400' : ''}`}>
                                                {/[a-z]/.test(newPassword) ? <FiCheckCircle className="mr-1" /> : <span className="w-4 mr-1"></span>}
                                                Ít nhất 1 chữ thường
                                            </li>
                                            <li className={`flex items-center ${/\d/.test(newPassword) ? 'text-green-600 dark:text-green-400' : ''}`}>
                                                {/\d/.test(newPassword) ? <FiCheckCircle className="mr-1" /> : <span className="w-4 mr-1"></span>}
                                                Ít nhất 1 số
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Trường Xác nhận mật khẩu */}
                                <div>
                                    <label
                                        htmlFor="confirmPassword"
                                        className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200"
                                    >
                                        Xác nhận mật khẩu
                                    </label>
                                    <div className="mt-2 relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FiLock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type="password"
                                            autoComplete="new-password"
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className={`block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 shadow-sm outline-none ${validationErrors.confirmPassword
                                                ? 'border-2 border-red-500 focus:border-red-500 dark:border-red-500'
                                                : 'border border-gray-300 dark:border-gray-600 focus:border-2 focus:border-orange-600 dark:focus:border-orange-500'
                                                } placeholder:text-gray-400 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:text-white`}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    {validationErrors.confirmPassword && (
                                        <p className="mt-2 text-sm text-red-600 dark:text-red-500 flex items-center">
                                            <FiAlertCircle className="mr-1" /> {validationErrors.confirmPassword}
                                        </p>
                                    )}
                                    {newPassword && confirmPassword && newPassword === confirmPassword && (
                                        <p className="mt-2 text-sm text-green-600 dark:text-green-400 flex items-center">
                                            <FiCheckCircle className="mr-1" /> Mật khẩu đã khớp
                                        </p>
                                    )}
                                </div>

                                {/* Hiển thị lỗi chung */}
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
                                                Đang xử lý...
                                            </>
                                        ) : (
                                            'Đặt lại mật khẩu'
                                        )}
                                    </button>
                                </div>
                            </>
                        )}
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

export default ResetPasswordPage; 
// src/app/(auth)/register/page.jsx
'use client'; // Cần client component cho form state và event handler

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore'; // Import để kiểm tra nếu đã đăng nhập
import axiosInstance from '@/lib/axiosInstance';
import { toast } from 'react-toastify';
import { FiUserPlus, FiLoader, FiUser, FiMail, FiLock, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import BrandSpinner from '@/components/ui/BrandSpinner';

const RegisterPage = () => {
  // State cho form inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // State cho loading và error
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: ''
  });

  // Lấy trạng thái auth từ store
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAuthLoading = useAuthStore((state) => state.isLoading);
  const router = useRouter();

  // Redirect nếu đã đăng nhập
  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      console.log('Register Page: Already authenticated, redirecting to /');
      router.replace('/'); // Chuyển về trang chủ nếu đã đăng nhập
    }
  }, [isAuthenticated, isAuthLoading, router]);

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
    evaluatePasswordStrength(password);
  }, [password]);

  // Validate form
  const validateForm = () => {
    const errors = {};

    // Validate name
    if (!name.trim()) {
      errors.name = 'Họ và tên là bắt buộc';
    } else if (name.trim().length < 2) {
      errors.name = 'Họ và tên phải có ít nhất 2 ký tự';
    }

    // Validate email
    if (!email.trim()) {
      errors.email = 'Email là bắt buộc';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Email không hợp lệ';
    }

    // Validate password
    if (!password) {
      errors.password = 'Mật khẩu là bắt buộc';
    } else if (password.length < 8) {
      errors.password = 'Mật khẩu phải có ít nhất 8 ký tự';
    } else if (!/[A-Z]/.test(password)) {
      errors.password = 'Mật khẩu phải có ít nhất 1 chữ hoa';
    } else if (!/[a-z]/.test(password)) {
      errors.password = 'Mật khẩu phải có ít nhất 1 chữ thường';
    } else if (!/\d/.test(password)) {
      errors.password = 'Mật khẩu phải có ít nhất 1 số';
    }

    // Validate confirm password
    if (!confirmPassword) {
      errors.confirmPassword = 'Xác nhận mật khẩu là bắt buộc';
    } else if (confirmPassword !== password) {
      errors.confirmPassword = 'Mật khẩu không khớp';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Register API call
      const response = await axiosInstance.post('/api/auth/register', {
        name,
        email,
        password
      });

      // Show success message
      toast.success('Đăng ký thành công!', {
        position: "top-center",
        autoClose: 2000
      });

      // Redirect to confirmation page
      router.push(`/register-confirmation?email=${encodeURIComponent(email)}`);
    } catch (error) {
      console.error('Registration error:', error);

      // Handle error message
      const errorMsg = error.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
      setError(errorMsg);

      // Show error toast
      toast.error(errorMsg, {
        position: "top-center",
        autoClose: 3000
      });
    } finally {
      setIsLoading(false);
    }
  };

  // --- Render Logic ---
  if (isAuthLoading) {
    return (
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 items-center">
        <p className="text-gray-600 dark:text-gray-400">Đang kiểm tra xác thực...</p>
        <div className="mt-4 w-8 h-8 border-t-2 border-b-2 border-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 items-center">
        <p className="text-gray-600 dark:text-gray-400">Đang chuyển hướng...</p>
        <div className="mt-4 w-8 h-8 border-t-2 border-b-2 border-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Render password strength indicator
  const renderPasswordStrengthIndicator = () => {
    if (!password) return null;

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

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-white dark:bg-gray-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-4xl font-bold text-orange-600">AtomikBooks</h1>
        <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-white">
          Tạo tài khoản mới
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          {/* Trường Họ tên */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200"
            >
              Họ và tên
            </label>
            <div className="mt-2 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiUser className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className={`block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 shadow-sm outline-none ${validationErrors.name
                  ? 'border-2 border-red-500 focus:border-red-500 dark:border-red-500'
                  : 'border border-gray-300 dark:border-gray-600 focus:border-2 focus:border-orange-600 dark:focus:border-orange-500'
                  } placeholder:text-gray-400 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:text-white`}
              />
            </div>
            {validationErrors.name && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-500 flex items-center">
                <FiAlertCircle className="mr-1" /> {validationErrors.name}
              </p>
            )}
          </div>

          {/* Trường Email */}
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
                placeholder="your-email@example.com"
                className={`block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 shadow-sm outline-none ${validationErrors.email
                  ? 'border-2 border-red-500 focus:border-red-500 dark:border-red-500'
                  : 'border border-gray-300 dark:border-gray-600 focus:border-2 focus:border-orange-600 dark:focus:border-orange-500'
                  } placeholder:text-gray-400 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:text-white`}
              />
            </div>
            {validationErrors.email && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-500 flex items-center">
                <FiAlertCircle className="mr-1" /> {validationErrors.email}
              </p>
            )}
            {error && error.toLowerCase().includes('email') && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-500 flex items-center">
                <FiAlertCircle className="mr-1" /> {error}
              </p>
            )}
          </div>

          {/* Trường Mật khẩu */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200"
            >
              Mật khẩu
            </label>
            <div className="mt-2 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 shadow-sm outline-none ${validationErrors.password
                  ? 'border-2 border-red-500 focus:border-red-500 dark:border-red-500'
                  : 'border border-gray-300 dark:border-gray-600 focus:border-2 focus:border-orange-600 dark:focus:border-orange-500'
                  } placeholder:text-gray-400 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:text-white`}
              />
            </div>
            {renderPasswordStrengthIndicator()}
            {validationErrors.password && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-500 flex items-center">
                <FiAlertCircle className="mr-1" /> {validationErrors.password}
              </p>
            )}
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              <p>Mật khẩu phải có:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li className={`flex items-center ${password.length >= 8 ? 'text-green-600 dark:text-green-400' : ''}`}>
                  {password.length >= 8 ? <FiCheckCircle className="mr-1" /> : <span className="w-4 mr-1"></span>}
                  Ít nhất 8 ký tự
                </li>
                <li className={`flex items-center ${/[A-Z]/.test(password) ? 'text-green-600 dark:text-green-400' : ''}`}>
                  {/[A-Z]/.test(password) ? <FiCheckCircle className="mr-1" /> : <span className="w-4 mr-1"></span>}
                  Ít nhất 1 chữ hoa
                </li>
                <li className={`flex items-center ${/[a-z]/.test(password) ? 'text-green-600 dark:text-green-400' : ''}`}>
                  {/[a-z]/.test(password) ? <FiCheckCircle className="mr-1" /> : <span className="w-4 mr-1"></span>}
                  Ít nhất 1 chữ thường
                </li>
                <li className={`flex items-center ${/\d/.test(password) ? 'text-green-600 dark:text-green-400' : ''}`}>
                  {/\d/.test(password) ? <FiCheckCircle className="mr-1" /> : <span className="w-4 mr-1"></span>}
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
                placeholder="••••••••"
                className={`block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 shadow-sm outline-none ${validationErrors.confirmPassword
                  ? 'border-2 border-red-500 focus:border-red-500 dark:border-red-500'
                  : 'border border-gray-300 dark:border-gray-600 focus:border-2 focus:border-orange-600 dark:focus:border-orange-500'
                  } placeholder:text-gray-400 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:text-white`}
              />
            </div>
            {validationErrors.confirmPassword && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-500 flex items-center">
                <FiAlertCircle className="mr-1" /> {validationErrors.confirmPassword}
              </p>
            )}
            {password && confirmPassword && password === confirmPassword && (
              <p className="mt-2 text-sm text-green-600 dark:text-green-400 flex items-center">
                <FiCheckCircle className="mr-1" /> Mật khẩu đã khớp
              </p>
            )}
          </div>

          {/* Hiển thị lỗi chung không thuộc về field cụ thể */}
          {error && !error.toLowerCase().includes('email') && !validationErrors.name && !validationErrors.password && !validationErrors.confirmPassword && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-4">
              <div className="flex">
                <FiAlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <p className="text-sm text-red-700 dark:text-red-400 font-medium">{error}</p>
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full justify-center rounded-md bg-orange-600 px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 disabled:opacity-60 disabled:cursor-not-allowed"
            >              {isLoading ? (
              <>
                <BrandSpinner size="sm" className="-ml-1 mr-3" color="white" />
                Đang tạo tài khoản...
              </>
            ) : (
              <>
                <FiUserPlus className="mr-2 h-5 w-5" />
                Đăng ký
              </>
            )}
            </button>
          </div>
        </form>

        <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          Đã có tài khoản?{' '}
          <Link
            href="/login"
            className="font-semibold leading-6 text-orange-600 hover:text-orange-500 dark:text-orange-400 dark:hover:text-orange-300"
          >
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
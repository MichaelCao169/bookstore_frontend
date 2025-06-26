// src/app/(auth)/login/page.jsx
'use client'; // Cần client component vì có form state và event handler

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation'; // Import hooks
import { useAuthStore } from '@/store/authStore'; // Import auth store
import { FiLogIn, FiMail, FiLock, FiAlertCircle, FiEye, FiEyeOff } from 'react-icons/fi';
import { toast } from 'react-toastify';
import axios from 'axios'; // Import axios trực tiếp
import axiosInstance from '@/lib/axiosInstance'; // Import axiosInstance for profile API call

// Tạo instance axios riêng (không dùng axiosInstance có interceptors để tránh reload)
const authApi = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // Gửi cookies với các request
});

// Map với các thông báo lỗi tiếng Anh sang tiếng Việt
const errorMessages = {
  'Invalid email or password': 'Email hoặc mật khẩu không đúng',
  'User account is disabled': 'Tài khoản đã bị vô hiệu hóa',
  'User account is locked': 'Tài khoản tạm thời bị khóa',
  'User email is not verified': 'Email chưa được xác thực, vui lòng kiểm tra hộp thư của bạn',
  'Bad credentials': 'Email hoặc mật khẩu không đúng',
  'Your account has been locked due to too many failed login attempts': 'Tài khoản đã bị tạm khóa do đăng nhập sai nhiều lần',
  'Network Error': 'Lỗi kết nối mạng, vui lòng kiểm tra lại kết nối của bạn',
  'Tài khoản cần được xác minh. Vui lòng kiểm tra email của bạn.': 'Tài khoản cần được xác minh. Vui lòng kiểm tra email của bạn.',
  'Email hoặc mật khẩu không đúng': 'Email hoặc mật khẩu không đúng',
  'Tài khoản đã bị tạm khóa do đăng nhập sai nhiều lần': 'Tài khoản đã bị tạm khóa do đăng nhập sai nhiều lần',
  'Đã xảy ra lỗi hệ thống. Vui lòng liên hệ hỗ trợ.': 'Đã xảy ra lỗi hệ thống. Vui lòng liên hệ hỗ trợ.',
  'Request failed with status code 401': 'Email hoặc mật khẩu không đúng',
  'Request failed with status code 500': 'Lỗi hệ thống, vui lòng thử lại sau',
  'Request failed with status code 503': 'Dịch vụ tạm thời không khả dụng, vui lòng thử lại sau'
};

// Hàm dịch thông báo lỗi từ tiếng Anh sang tiếng Việt
const translateErrorMessage = (message) => {
  if (!message) return 'Đã xảy ra lỗi không xác định';

  // Nếu message đã là tiếng Việt thì trả về nguyên bản
  if (message.includes('Tài khoản') || message.includes('Email hoặc mật khẩu') ||
    message.includes('Lỗi hệ thống') || message.includes('đăng nhập') ||
    message.includes('xác minh')) {
    return message;
  }

  // Tìm trong map các thông báo lỗi đã biết
  for (const [englishMsg, vietnameseMsg] of Object.entries(errorMessages)) {
    if (message.includes(englishMsg)) {
      return vietnameseMsg;
    }
  }

  // Xử lý các lỗi HTTP status code
  if (message.includes('status code 401') || message.includes('401')) {
    return 'Email hoặc mật khẩu không đúng';
  }
  if (message.includes('status code 500') || message.includes('500')) {
    return 'Lỗi hệ thống, vui lòng thử lại sau';
  }
  if (message.includes('status code 503') || message.includes('503')) {
    return 'Dịch vụ tạm thời không khả dụng, vui lòng thử lại sau';
  }

  // Thay thế các cụm từ tiếng Anh phổ biến
  return message
    .replace('Error:', 'Lỗi:')
    .replace('Invalid', 'Không hợp lệ')
    .replace('Failed', 'Thất bại')
    .replace('login', 'đăng nhập')
    .replace('password', 'mật khẩu')
    .replace('email', 'email')
    .replace('user', 'người dùng')
    .replace('not found', 'không tìm thấy')
    .replace('Server error', 'Lỗi máy chủ')
    .replace('Network error', 'Lỗi kết nối mạng')
    .replace('Authentication failed', 'Xác thực thất bại')
    .replace('Please check your credentials', 'Vui lòng kiểm tra thông tin đăng nhập')
    .replace('Please try again', 'Vui lòng thử lại')
    || 'Đăng nhập thất bại. Vui lòng kiểm tra thông tin đăng nhập.';
};

const LoginPage = () => {
  // State cho form input
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // State cho lỗi và trạng thái loading của form submit
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  // State cho việc hiển thị mật khẩu
  const [showPassword, setShowPassword] = useState(false);
  // State nội bộ để theo dõi redirect
  const [shouldRedirect, setShouldRedirect] = useState(false);

  // Lấy state và actions từ Zustand store
  const loginAction = useAuthStore((state) => state.login);
  const updateUser = useAuthStore((state) => state.updateUser);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAuthLoading = useAuthStore((state) => state.isLoading);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Lưu URL chuyển hướng sau khi đăng nhập thành công
  const redirectUrl = searchParams.get('redirect') || '/';

  // Xử lý redirect khi người dùng đã đăng nhập
  useEffect(() => {
    let isMounted = true;

    // Chỉ chuyển hướng khi đã xác thực và không đang loading
    if (isAuthenticated && !isAuthLoading && isMounted) {
      console.log('Đã đăng nhập, chuyển hướng đến:', redirectUrl);
      setTimeout(() => {
        if (isMounted) router.replace(redirectUrl);
      }, 500); // Thêm timeout nhỏ để đảm bảo toast hiện trước khi chuyển trang
    }

    return () => { isMounted = false; };
  }, [isAuthenticated, isAuthLoading, redirectUrl, router]);

  // Validate form
  const validateForm = () => {
    const errors = {};

    // Validate email
    if (!email) {
      errors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Email không hợp lệ';
    }

    // Validate password
    if (!password) {
      errors.password = 'Vui lòng nhập mật khẩu';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Hàm toggle hiển thị/ẩn mật khẩu
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Xử lý sự kiện submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Call login API
      const response = await authApi.post('/auth/login', { email, password });
      const { accessToken, userId, verified, message, ...restUserData } = response.data;

      // Check if login was successful
      if (!verified) {
        // Login failed - handle as error
        const errorMessage = message || 'Email hoặc mật khẩu không đúng';
        const translatedError = translateErrorMessage(errorMessage);
        toast.error(translatedError, {
          position: "top-center",
          autoClose: 4000
        });
        return;
      }

      // Check if we have access token (successful login)
      if (!accessToken) {
        toast.error('Lỗi xác thực. Vui lòng thử lại.', {
          position: "top-center",
          autoClose: 4000
        });
        return;
      }

      // Map userId to id for frontend consistency
      const userData = {
        ...restUserData,
        id: userId, // Map backend's userId to frontend's expected id field
        userId: userId // Keep both for backward compatibility
      };

      // Success notification
      toast.success('Đăng nhập thành công!', {
        position: "top-center",
        autoClose: 2000
      });

      // Store authentication data
      loginAction(userData, accessToken);

      // Fetch complete profile data including address after successful login
      try {
        const profileResponse = await axiosInstance.get('/profile', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        // Update user data with complete profile including defaultAddress
        const completeUserData = {
          ...userData,
          ...profileResponse.data,
          id: userId, // Ensure ID consistency
          userId: userId
        };

        // Update store with complete user data
        updateUser(completeUserData);
        console.log('Profile data loaded after login:', completeUserData);
      } catch (profileError) {
        console.warn('Failed to load profile data after login:', profileError);
        // Continue with basic user data if profile fetch fails
      }

      // Set redirect flag to show loading state while navigation happens
      setShouldRedirect(true);
    } catch (error) {
      // Handle error
      let errorMessage = 'Đăng nhập thất bại. Vui lòng thử lại.';

      if (error.response) {
        // Server responded with error status
        if (error.response.data) {
          if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
          } else if (error.response.data.message) {
            errorMessage = error.response.data.message;
          }
        } else {
          // No response data, use status code
          if (error.response.status === 401) {
            errorMessage = 'Email hoặc mật khẩu không đúng';
          } else if (error.response.status === 500) {
            errorMessage = 'Lỗi hệ thống, vui lòng thử lại sau';
          } else if (error.response.status === 503) {
            errorMessage = 'Dịch vụ tạm thời không khả dụng, vui lòng thử lại sau';
          }
        }
      } else if (error.request) {
        // Request made but no response received
        errorMessage = 'Lỗi kết nối mạng, vui lòng kiểm tra lại kết nối của bạn';
      } else {
        // Something else happened
        errorMessage = error.message || 'Đã xảy ra lỗi không xác định';
      }

      const translatedError = translateErrorMessage(errorMessage);
      toast.error(translatedError, {
        position: "top-center",
        autoClose: 4000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // === RENDER UI ===

  // Hiển thị loading spinner nếu:
  // 1. Đang kiểm tra trạng thái auth ban đầu
  // 2. Đã đăng nhập thành công và đang chờ redirect
  if (isAuthLoading || (shouldRedirect && isAuthenticated)) {
    return (
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 items-center">
        <p className="text-gray-600 dark:text-gray-400">
          {shouldRedirect ? 'Đăng nhập thành công, đang chuyển hướng...' : 'Đang kiểm tra xác thực...'}
        </p>
        <div className="mt-4 w-8 h-8 border-t-2 border-b-2 border-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Hiển thị form đăng nhập
  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-white dark:bg-gray-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h1 className="text-center text-4xl font-bold text-orange-600">AtomikBooks</h1>
        <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-white">
          Đăng nhập vào tài khoản
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" onSubmit={handleSubmit} noValidate>
          {/* Email field */}
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
                placeholder="michaelcao@gmail.com"
              />
            </div>
            {validationErrors.email && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-500 flex items-center">
                <FiAlertCircle className="mr-1" /> {validationErrors.email}
              </p>
            )}
          </div>

          {/* Password field */}
          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200"
              >
                Mật khẩu
              </label>
              <div className="text-sm">
                <Link
                  href="/forgot-password"
                  className="font-semibold text-orange-600 hover:text-orange-500 dark:text-orange-400 dark:hover:text-orange-300"
                >
                  Quên mật khẩu?
                </Link>
              </div>
            </div>
            <div className="mt-2 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`block w-full rounded-md border-0 py-1.5 pl-10 pr-10 text-gray-900 shadow-sm outline-none ${validationErrors.password
                  ? 'border-2 border-red-500 focus:border-red-500 dark:border-red-500'
                  : 'border border-gray-300 dark:border-gray-600 focus:border-2 focus:border-orange-600 dark:focus:border-orange-500'
                  } placeholder:text-gray-400 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:text-white`}
                placeholder="••••••••"
              />
              {/* Toggle password visibility */}
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                {showPassword ? (
                  <FiEyeOff className="h-5 w-5" aria-label="Ẩn mật khẩu" title="Ẩn mật khẩu" />
                ) : (
                  <FiEye className="h-5 w-5" aria-label="Hiện mật khẩu" title="Hiện mật khẩu" />
                )}
              </button>
            </div>
            {validationErrors.password && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-500 flex items-center">
                <FiAlertCircle className="mr-1" /> {validationErrors.password}
              </p>
            )}
          </div>

          {/* Submit button */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full justify-center rounded-md bg-orange-600 px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-orange-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang đăng nhập...
                </>
              ) : (
                <>
                  <FiLogIn className="mr-2 h-5 w-5" />
                  Đăng nhập
                </>
              )}
            </button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm text-gray-500 dark:text-gray-400">
          Chưa có tài khoản?{' '}
          <Link
            href="/register"
            className="font-semibold leading-6 text-orange-600 hover:text-orange-500 dark:text-orange-400 dark:hover:text-orange-300"
          >
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
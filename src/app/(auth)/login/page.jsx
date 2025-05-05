// src/app/(auth)/login/page.jsx
'use client'; // Cần client component vì có form state và event handler

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation'; // Import hooks
import { useAuthStore } from '@/store/authStore'; // Import auth store
import axiosInstance from '@/lib/axiosInstance'; // Import axios instance

const LoginPage = () => {
  // State cho form input
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // State cho lỗi và trạng thái loading của form submit
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Đổi tên từ isLoading để phân biệt

  // Lấy state và actions từ Zustand store một cách riêng lẻ
  const loginAction = useAuthStore((state) => state.login);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAuthLoading = useAuthStore((state) => state.isLoading); // State loading ban đầu của store

  const router = useRouter();
  const searchParams = useSearchParams(); // Lấy query params để xử lý redirect

  // Effect để redirect nếu người dùng đã đăng nhập
   useEffect(() => {
     // Chỉ redirect khi không còn loading trạng thái auth ban đầu VÀ đã authenticated
     if (!isAuthLoading && isAuthenticated) {
       const redirectUrl = searchParams.get('redirect') || '/'; // Lấy redirect URL hoặc về trang chủ
       console.log('Login Page: Already authenticated, redirecting to:', redirectUrl);
       router.replace(redirectUrl); // Dùng replace để không lưu trang login vào history
     }
   }, [isAuthenticated, isAuthLoading, router, searchParams]); // Phụ thuộc vào cả isAuthLoading


  // Xử lý sự kiện submit form
  const handleSubmit = async (e) => {
    e.preventDefault(); // Ngăn form submit theo cách truyền thống
    setError(null); // Xóa lỗi cũ
    setIsSubmitting(true); // Bắt đầu trạng thái submit form

    try {
      console.log('Attempting login with:', { email, password });
      // Gọi API login bằng axios instance
      const response = await axiosInstance.post('/auth/login', {
        email,
        password,
      });

      console.log('Login API response:', response.data);

      // Lấy dữ liệu từ response
      const { accessToken, tokenType, ...userData } = response.data;

      if (accessToken && userData) {
        // Gọi action login của Zustand store
        loginAction(userData, accessToken);
        console.log('Login successful, state updated.');
        // Redirect sẽ được xử lý bởi useEffect ở trên khi isAuthenticated thay đổi
      } else {
         console.error('Login response missing token or user data');
         setError('Login failed: Invalid server response.'); // Lỗi không mong đợi từ server
      }

    } catch (err) {
      console.error('Login API error:', err.response || err);
      // Lấy thông báo lỗi cụ thể từ response backend
      const errorMessage = typeof err.response?.data === 'string' && err.response.data.startsWith('Error:')
                            ? err.response.data // Lấy lỗi từ backend nếu có dạng "Error: ..."
                            : 'Login failed. Please check your credentials.'; // Thông báo chung
      setError(errorMessage);
    } finally {
      setIsSubmitting(false); // Kết thúc trạng thái submit form
    }
  };

   // --- Logic Render ---

   // 1. Hiển thị loading nếu store đang kiểm tra trạng thái auth ban đầu
   if (isAuthLoading) {
       return (
         <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 items-center">
             <p className="text-gray-600 dark:text-gray-400">Checking authentication...</p>
             {/* Có thể thêm Spinner component ở đây */}
         </div>
       );
   }

   // 2. Nếu đã đăng nhập (sau khi submit thành công hoặc đã login từ trước), hiển thị redirecting
   //   (useEffect sẽ thực hiện chuyển hướng)
   if (isAuthenticated) {
        return (
         <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 items-center">
             <p className="text-gray-600 dark:text-gray-400">Redirecting...</p>
         </div>
        );
   }

  // 3. Nếu chưa đăng nhập và không loading auth state, hiển thị form login
  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        {/* Logo hoặc tên App */}
         <h1 className="text-center text-4xl font-bold text-orange-600">AtomicBooks</h1>
        <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-white">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" onSubmit={handleSubmit} noValidate> {/* Thêm noValidate để tắt validation mặc định của trình duyệt */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200"
            >
              Email address
            </label>
            <div className="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-orange-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600 dark:focus:ring-orange-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200"
              >
                Password
              </label>
              <div className="text-sm">
                <Link
                  href="/forgot-password" // Link đến trang quên mật khẩu
                  className="font-semibold text-orange-600 hover:text-orange-500 dark:text-orange-400 dark:hover:text-orange-300"
                >
                  Forgot password?
                </Link>
              </div>
            </div>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-orange-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600 dark:focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Hiển thị lỗi */}
          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-3">
                <p className="text-sm text-red-700 dark:text-red-400 text-center font-medium">{error}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isSubmitting} // Dùng state isSubmitting của form
              className="flex w-full justify-center rounded-md bg-orange-600 px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                 <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                 </>
              ) : (
                'Sign in'
              )}
            </button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm text-gray-500 dark:text-gray-400">
          Don't have an account?{' '}
          <Link
            href="/register" // Link đến trang đăng ký
            className="font-semibold leading-6 text-orange-600 hover:text-orange-500 dark:text-orange-400 dark:hover:text-orange-300"
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
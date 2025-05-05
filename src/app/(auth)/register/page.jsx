// src/app/(auth)/register/page.jsx
'use client'; // Cần client component cho form state và event handler

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore'; // Import để kiểm tra nếu đã đăng nhập
import axiosInstance from '@/lib/axiosInstance';
import { toast } from 'react-toastify';
import { FiUserPlus, FiLoader } from 'react-icons/fi';

const RegisterPage = () => {
  // State cho form inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // State cho loading và error
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({}); // Lưu lỗi validation cụ thể

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

  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setValidationErrors({}); // Xóa lỗi validation cũ
    setIsLoading(true);

    // --- Client-side Validation ---
    let errors = {};
    if (!name.trim()) errors.name = 'Name is required.';
    if (!email.trim()) errors.email = 'Email is required.';
    // Regex kiểm tra email đơn giản
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Invalid email format.';
    if (!password) errors.password = 'Password is required.';
    else if (password.length < 6) errors.password = 'Password must be at least 6 characters.';
    if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match.';

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setIsLoading(false);
      return; // Dừng lại nếu có lỗi validation client
    }
    // --- Kết thúc Client-side Validation ---

    try {
      console.log('Attempting registration with:', { name, email }); // Không log password
      const response = await axiosInstance.post('/auth/register', {
        name,
        email,
        password,
      });

      console.log('Registration API response:', response.data);
      toast.success(response.data || 'Registration successful! Please check your email to verify your account.');

      // Xóa form sau khi thành công
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');

      // Chuyển hướng đến trang login hoặc trang thông báo sau vài giây
      setTimeout(() => {
        router.push('/login');
      }, 3000); // Chờ 3 giây

    } catch (err) {
      console.error('Registration API error:', err.response || err);
      const resData = err.response?.data;

      if (err.response?.status === 409) { // Conflict - Email đã tồn tại
        setError(resData || 'Email is already registered.');
        toast.error(resData || 'Email is already registered.');
      } else if (err.response?.status === 400 && typeof resData === 'object') {
         // Lỗi Validation từ backend (thường trả về object với key là field)
         setValidationErrors(resData);
         setError('Please fix the errors below.'); // Thông báo chung
         toast.error('Registration failed. Please check the form for errors.');
      } else {
        // Lỗi khác
        const errorMessage = typeof resData === 'string' ? resData : 'Registration failed. Please try again later.';
        setError(errorMessage);
        toast.error(`Error: ${errorMessage}`);
      }
    } finally {
      setIsLoading(false);
    }
  };


  // --- Render Logic ---
   if (isAuthLoading) {
       return <div className="text-center py-10">Checking authentication...</div>;
   }
   if (isAuthenticated) {
       return <div className="text-center py-10">Redirecting...</div>;
   }

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md"> {/* Tăng max-w */}
        <h1 className="text-center text-4xl font-bold text-orange-600">AtomicBooks</h1>
        <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-white">
          Create your account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
           {/* Trường Name */}
           <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200"
            >
              Full Name
            </label>
            <div className="mt-2">
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600 ${
                   validationErrors.name ? 'ring-red-500 focus:ring-red-600 dark:focus:ring-red-500' : 'ring-gray-300 focus:ring-orange-600 dark:focus:ring-orange-500'
                }`}
              />
            </div>
            {validationErrors.name && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{validationErrors.name}</p>}
          </div>

          {/* Trường Email */}
          <div>
            <label htmlFor="email" /* ... */ >Email address</label>
            <div className="mt-2">
              <input
                id="email" name="email" type="email" autoComplete="email" required value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`block w-full ... ${ // Thêm class ring-red-500 tương tự nếu có lỗi
                   validationErrors.email ? 'ring-red-500 focus:ring-red-600 dark:focus:ring-red-500' : 'ring-gray-300 focus:ring-orange-600 dark:focus:ring-orange-500'
                }`}
              />
            </div>
             {validationErrors.email && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{validationErrors.email}</p>}
             {/* Hiển thị lỗi chung (ví dụ email tồn tại) */}
             {error && error.toLowerCase().includes('email') && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
          </div>

          {/* Trường Password */}
          <div>
            <label htmlFor="password" /* ... */ >Password</label>
            <div className="mt-2">
              <input
                id="password" name="password" type="password" autoComplete="new-password" required value={password}
                onChange={(e) => setPassword(e.target.value)}
                 className={`block w-full ... ${ // Thêm class ring-red-500 tương tự nếu có lỗi
                   validationErrors.password ? 'ring-red-500 focus:ring-red-600 dark:focus:ring-red-500' : 'ring-gray-300 focus:ring-orange-600 dark:focus:ring-orange-500'
                }`}
              />
            </div>
             {validationErrors.password && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{validationErrors.password}</p>}
          </div>

          {/* Trường Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" /* ... */ >Confirm Password</label>
            <div className="mt-2">
              <input
                id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                 className={`block w-full ... ${ // Thêm class ring-red-500 tương tự nếu có lỗi
                   validationErrors.confirmPassword ? 'ring-red-500 focus:ring-red-600 dark:focus:ring-red-500' : 'ring-gray-300 focus:ring-orange-600 dark:focus:ring-orange-500'
                }`}
              />
            </div>
            {validationErrors.confirmPassword && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{validationErrors.confirmPassword}</p>}
          </div>

            {/* Hiển thị lỗi chung không thuộc về field cụ thể */}
           {error && !error.toLowerCase().includes('email') && !validationErrors.name && !validationErrors.password && !validationErrors.confirmPassword && (
               <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-3">
                   <p className="text-sm text-red-700 dark:text-red-400 text-center font-medium">{error}</p>
               </div>
           )}


          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full justify-center rounded-md bg-orange-600 px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                 <>
                    <FiLoader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"/>
                    Creating account...
                 </>
              ) : (
                 <>
                    <FiUserPlus className="mr-2 h-5 w-5"/>
                    Create Account
                 </>
              )}
            </button>
          </div>
        </form>

        <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          Already have an account?{' '}
          <Link
            href="/login" // Link về trang đăng nhập
            className="font-semibold leading-6 text-orange-600 hover:text-orange-500 dark:text-orange-400 dark:hover:text-orange-300"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
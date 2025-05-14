// src/app/layout.jsx
'use client';
import React, { useEffect, useState } from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuthStore } from '@/store/authStore';
// *** IMPORT Toastify ***
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import CSS
import { FiLoader } from 'react-icons/fi';

const inter = Inter({ subsets: ['latin'] });

// Tách phần loading thành component riêng
function LoadingState() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <FiLoader className="animate-spin h-10 w-10 mx-auto text-orange-500 mb-4" />
        <div className="text-xl font-semibold text-gray-800 dark:text-gray-200">Đang tải AtomicBooks...</div>
      </div>
    </div>
  );
}

export default function RootLayout({ children }) {
  const [mounted, setMounted] = useState(false);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [theme, setTheme] = useState('light');

  // Xử lý mounting để tránh hydration mismatch
  useEffect(() => {
    setMounted(true);

    // Đồng thời kiểm tra auth state ngay khi mounted
    if (typeof window !== 'undefined') {
      useAuthStore.getState().checkAuthState();

      // Đảm bảo finishLoading sau một khoảng thời gian ngắn
      setTimeout(() => {
        useAuthStore.getState().finishLoading();
      }, 300);
    }
  }, []);

  // Thêm một useEffect mới để đảm bảo isLoading sẽ kết thúc
  // ngay cả khi xảy ra lỗi xác thực
  useEffect(() => {
    if (mounted && isLoading) {
      // Safety timeout để đảm bảo không bị kẹt ở trạng thái loading
      const safetyTimer = setTimeout(() => {
        console.log("Safety timeout: forcing isLoading to false");
        useAuthStore.getState().finishLoading();
      }, 2000);

      return () => clearTimeout(safetyTimer);
    }
  }, [mounted, isLoading]);

  // Xử lý dark mode
  useEffect(() => {
    if (!mounted) return;

    // Lấy theme từ localStorage hoặc ưu tiên hệ thống
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else if (prefersDark) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
  }, [mounted]);

  // Hàm chuyển đổi theme
  const toggleTheme = () => {
    console.log("Layout toggleTheme called"); // Debug
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);

    // Lưu vào localStorage và cập nhật class
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <html lang="vi" suppressHydrationWarning className={theme}>
      <head>
        <title>AtomicBooks - Hiệu Sách Trực Tuyến</title>
        <meta name="description" content="AtomicBooks - Hiệu sách trực tuyến với kho sách phong phú và đa dạng." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300`}>
        {/* *** THÊM ToastContainer GẦN BODY HOẶC TRONG PROVIDER KHÁC *** */}
        <ToastContainer
          position="top-right" // Vị trí hiển thị
          autoClose={3000} // Tự động đóng sau 3 giây
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme={theme} // Hoặc 'dark', 'colored'
        // transition: Bounce, // Hiệu ứng (cần import nếu dùng)
        />

        {/* Chỉ render nội dung khi đã mounted để tránh hydration mismatch */}
        {!mounted ? (
          <LoadingState />
        ) : isLoading ? (
          <LoadingState />
        ) : (
          <>
            <Navbar theme={theme} toggleTheme={toggleTheme} />
            <main className="flex-grow container mx-auto px-4 py-6">
              {children}
            </main>
            <Footer />
          </>
        )}
      </body>
    </html>
  );
}
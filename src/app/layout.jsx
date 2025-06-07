// src/app/layout.jsx
'use client';
import React, { useEffect, useState } from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuthStore } from '@/store/authStore';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiLoader } from 'react-icons/fi';
import ChatBubble from '@/components/chat/ChatBubble';
import ChatWindow from '@/components/chat/ChatWindow';
import BrandSpinner from '@/components/ui/BrandSpinner';

// --- [BƯỚC 1: THÊM CÁC IMPORT MỚI] ---
import AiChatBubble from '@/components/chat/AiChatBubble';
import AiChatWindow from '@/components/chat/AiChatWindow';

const inter = Inter({ subsets: ['latin'] });

// Tách phần loading thành component riêng
function LoadingState() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
      <BrandSpinner
        size="text-6xl"
        text="Đang tải AtomicBooks..."
      />
    </div>
  );
}

export default function RootLayout({ children }) {
  const [mounted, setMounted] = useState(false);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [theme, setTheme] = useState('light');

  // --- [PHẦN NÀY GIỮ NGUYÊN] ---
  // Xử lý mounting để tránh hydration mismatch
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      useAuthStore.getState().checkAuthState();
      setTimeout(() => {
        useAuthStore.getState().finishLoading();
      }, 300);
    }
  }, []);

  // Safety timeout
  useEffect(() => {
    if (mounted && isLoading) {
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
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else if (prefersDark) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
  }, [mounted]);

  // Hàm chuyển đổi theme
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };
  
  // --- [BƯỚC 2: SỬA LẠI CÁCH LẤY STATE] ---
  // Lấy từng state một để tránh lỗi infinite loop
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const user = useAuthStore(state => state.user);
  const isAdmin = user?.roles?.includes('ROLE_ADMIN');

  return (
    <html lang="vi" suppressHydrationWarning className={theme === 'dark' ? 'dark' : ''}>
      <head>
        <title>AtomikBooks - Hiệu Sách Trực Tuyến</title>
        <meta name="description" content="AtomicBooks - Hiệu sách trực tuyến với kho sách phong phú và đa dạng." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.ico" type="image/x-icon" />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300`}>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme={theme}
        />

        {!mounted || isLoading ? (
          <LoadingState />
        ) : (
          <>
            <Navbar theme={theme} toggleTheme={toggleTheme} />
            <main className="flex-grow container mx-auto px-4 py-6">
              {children}
            </main>
            <Footer />

            {/* --- [BƯỚC 3: THÊM LOGIC HIỂN THỊ CHAT] --- */}

            {/* Chat với Admin (hiển thị cho customer) */}
            {isAuthenticated && !isAdmin && (
              <>
                <ChatBubble />
                <ChatWindow />
              </>
            )}

            {/* Chat với AI (hiển thị cho tất cả user đã đăng nhập) */}
            {isAuthenticated && (
              <>
                <AiChatBubble />
                <AiChatWindow />
              </>
            )}
          </>
        )}
      </body>
    </html>
  );
}
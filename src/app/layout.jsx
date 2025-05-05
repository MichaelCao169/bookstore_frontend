// src/app/layout.jsx
'use client';
import React, { useEffect } from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuthStore } from '@/store/authStore';
// *** IMPORT Toastify ***
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import CSS

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  const isLoading = useAuthStore((state) => state.isLoading);

  return (
    <html lang="en" suppressHydrationWarning>
      <title>AtomicBooks</title>
      <body className={`${inter.className} ...`}>
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
              theme="light" // Hoặc 'dark', 'colored'
              // transition: Bounce, // Hiệu ứng (cần import nếu dùng)
          />
          {isLoading ? (
             <div className="flex items-center justify-center h-screen">
             <div className="text-xl font-semibold">Loading AtomicBooks...</div>
             {/* Hoặc một spinner đẹp hơn */}
           </div>
           ) : (
             <>
               <Navbar />
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
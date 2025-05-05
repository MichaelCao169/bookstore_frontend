// src/app/(main)/orders/my-history/page.jsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import axiosInstance from '@/lib/axiosInstance';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'react-toastify';
import { FiPackage, FiLoader, FiAlertCircle, FiCalendar, FiTag, FiDollarSign, FiInfo } from 'react-icons/fi'; // Icons
import Pagination from '@/components/ui/Pagination'; // Import Pagination

// Components Loading/Error (Có thể dùng chung)
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-10">
    <FiLoader className="animate-spin text-orange-500 text-4xl" />
  </div>
);

const ErrorMessage = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-10 text-center text-red-600">
    <FiAlertCircle size={40} className="mb-2" />
    <p>Lỗi khi tải history:</p>
    <p className="text-sm">{message}</p>
    <button
      onClick={() => window.location.reload()} // Đơn giản là tải lại trang
      className="mt-4 bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 text-sm"
    >
      Thử lại
    </button>
  </div>
);

// Component hiển thị tag trạng thái đơn hàng
const OrderStatusBadge = ({ status }) => {
    let bgColor = 'bg-gray-100 dark:bg-gray-700';
    let textColor = 'text-gray-600 dark:text-gray-300';
    let dotColor = 'bg-gray-400';

    switch (status) {
        case 'PENDING':
        case 'PENDING_PAYMENT':
            bgColor = 'bg-yellow-50 dark:bg-yellow-900/30';
            textColor = 'text-yellow-700 dark:text-yellow-300';
            dotColor = 'bg-yellow-400';
            break;
        case 'PROCESSING':
            bgColor = 'bg-blue-50 dark:bg-blue-900/30';
            textColor = 'text-blue-700 dark:text-blue-300';
            dotColor = 'bg-blue-400';
            break;
        case 'SHIPPED':
            bgColor = 'bg-indigo-50 dark:bg-indigo-900/30';
            textColor = 'text-indigo-700 dark:text-indigo-300';
            dotColor = 'bg-indigo-400';
            break;
        case 'DELIVERED':
            bgColor = 'bg-green-50 dark:bg-green-900/30';
            textColor = 'text-green-700 dark:text-green-300';
            dotColor = 'bg-green-400';
            break;
        case 'CANCELLED':
        case 'PAYMENT_FAILED':
            bgColor = 'bg-red-50 dark:bg-red-900/30';
            textColor = 'text-red-700 dark:text-red-300';
            dotColor = 'bg-red-400';
            break;
    }

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
            <span className={`w-2 h-2 mr-1.5 rounded-full ${dotColor}`}></span>
            {status.replace('_', ' ')} {/* Thay thế dấu gạch dưới bằng khoảng trắng */}
        </span>
    );
};


// Hàm format tiền tệ (ví dụ)
const formatCurrency = (amount) => {
    if (amount == null) return 'N/A';
    return `$${amount.toFixed(2)}`;
}

// Hàm format ngày (ví dụ)
const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    try {
        return new Date(isoString).toLocaleDateString('en-CA'); // Format YYYY-MM-DD
    } catch { return isoString; }
}

const OrderHistoryPage = () => {
  const [orderPage, setOrderPage] = useState(null); // Lưu toàn bộ Page object từ API
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAuthLoading = useAuthStore((state) => state.isLoading);
  const logout = useAuthStore((state) => state.logout);
  
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Lấy trang hiện tại từ URL
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = 10; // Hoặc lấy từ searchParams nếu muốn tùy chỉnh size

  // Hàm fetch dữ liệu đơn hàng
  const fetchOrders = useCallback(async (page) => {
    console.log(`Fetching order history for page: ${page}`);
    setIsLoading(true);
    setError(null);
    try {
      const params = {
        page: page - 1, // API dùng 0-based index
        size: pageSize,
        sort: 'orderDate,desc', // Luôn sắp xếp mới nhất trước
      };
      const response = await axiosInstance.get('/orders/my-history', { params });
      console.log('Order history data received:', response.data);
      setOrderPage(response.data);
    } catch (err) {
      console.error('Failed to fetch order history:', err);
      if (err.response?.status === 401) {
         toast.error("Phiên đăng nhập hết hạn.");
         logout();
         router.push('/login?redirect=/orders/my-history');
      } else {
          setError(err.response?.data?.message || err.message || 'Không thể tải lịch sử đơn hàng.');
      }
      setOrderPage(null);
    } finally {
      setIsLoading(false);
    }
  }, [pageSize, logout, router]); // Thêm logout, router

  // useEffect để fetch khi trang thay đổi hoặc khi auth state sẵn sàng
  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      fetchOrders(currentPage);
    }
     else if (!isAuthLoading && !isAuthenticated) {
        router.replace('/login?redirect=/orders/my-history');
     }
  }, [isAuthenticated, isAuthLoading, currentPage, fetchOrders, router]); // Thêm currentPage, fetchOrders, router


  // Hàm xử lý chuyển trang
   const handlePageChange = (newPage) => {
       const params = new URLSearchParams(searchParams);
       params.set('page', newPage.toString());
       router.push(`${pathname}?${params.toString()}`, { scroll: false });
       // useEffect sẽ tự động fetch lại
   };


  // --- Render Logic ---
  if (isAuthLoading) {
      return <LoadingSpinner />;
  }
  if (!isAuthenticated) {
      // Mặc dù đã có redirect, vẫn cần fallback UI
      return <div className="text-center py-10">Vui lòng đăng nhập để xem lịch sử đơn hàng.</div>;
  }
   if (isLoading && !orderPage) { // Chỉ hiển thị loading nếu chưa có dữ liệu trang trước đó
     return <LoadingSpinner />;
   }
   if (error) {
     return <ErrorMessage message={error} onRetry={() => fetchOrders(currentPage)} />;
   }
   if (!orderPage || orderPage.totalElements === 0) {
     return (
        <div className="text-center py-16 border rounded-lg bg-gray-50 dark:bg-dark-surface dark:border-gray-700">
          <FiPackage size={60} className="mx-auto text-gray-300 dark:text-gray-600" />
          <h2 className="mt-4 text-xl font-semibold text-gray-700 dark:text-dark-text">Chưa có đơn hàng nào</h2>
          <p className="mt-2 text-gray-500 dark:text-dark-text-secondary">Những đơn hàng bạn đã đặt sẽ xuất hiện ở đây.</p>
          <Link
            href="/products"
            className="mt-6 inline-block bg-orange-500 text-white px-6 py-2.5 rounded hover:bg-orange-600 transition-colors"
          >
            Bắt đầu mua sắm
          </Link>
        </div>
      );
   }

  // --- Hiển thị danh sách đơn hàng ---
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-dark-text border-b pb-3">Lịch sử Đơn hàng</h1>

      <div className="space-y-6">
        {orderPage.content.map((order) => (
          <div key={order.orderId} className="bg-white dark:bg-dark-surface p-4 sm:p-6 rounded-lg shadow border dark:border-gray-700">
            {/* Header của đơn hàng */}
            <div className="flex flex-wrap justify-between items-center border-b dark:border-gray-600 pb-3 mb-4 gap-2">
              <div className='flex flex-col sm:flex-row sm:items-center sm:gap-4'>
                <div className='flex items-center text-sm text-gray-600 dark:text-gray-400 mb-1 sm:mb-0'>
                     <FiTag className='mr-1.5'/>
                     <span>Mã đơn:</span>
                     <span className='font-medium text-gray-800 dark:text-gray-200 ml-1'>#{order.orderId}</span>
                </div>
                 <div className='flex items-center text-sm text-gray-600 dark:text-gray-400'>
                     <FiCalendar className='mr-1.5'/>
                     <span>Ngày đặt:</span>
                     <span className='font-medium text-gray-800 dark:text-gray-200 ml-1'>{formatDate(order.orderDate)}</span>
                 </div>
              </div>
               <OrderStatusBadge status={order.status} />
            </div>

             {/* Thông tin tóm tắt (có thể bỏ nếu không cần trong list) */}
             {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 text-sm">
                 <div>
                     <h4 className="font-semibold mb-1">Người nhận</h4>
                     <p>{order.shippingRecipientName}</p>
                     <p>{order.shippingPhone}</p>
                 </div>
                 <div>
                     <h4 className="font-semibold mb-1">Địa chỉ giao hàng</h4>
                     <p>{order.shippingStreet}</p>
                     <p>{order.shippingDistrict}, {order.shippingCity}</p>
                 </div>
                 <div>
                     <h4 className="font-semibold mb-1">Thanh toán</h4>
                     <p>Tổng tiền: <span className="font-bold">{formatCurrency(order.totalAmount)}</span></p>
                     <p>Phương thức: {order.paymentMethod}</p>
                 </div>
             </div> */}

             {/* Link xem chi tiết */}
             <div className='text-right'>
                 <Link
                    href={`/orders/${order.orderId}`} // Link đến trang chi tiết đơn hàng
                    className="inline-flex items-center text-sm font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
                    >
                    Xem chi tiết
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 ml-1"><path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" /></svg>
                 </Link>
             </div>

          </div>
        ))}
      </div>

      {/* Phân trang */}
      {orderPage.totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination
             currentPage={currentPage} // currentPage đã là 1-based
             totalPages={orderPage.totalPages}
             onPageChange={handlePageChange} // Dùng hàm xử lý riêng
          />
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;


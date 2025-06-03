// src/app/(main)/orders/my-history/page.jsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import axiosInstance from '@/lib/axiosInstance';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'react-toastify';
import { FiPackage, FiLoader, FiAlertCircle, FiCalendar, FiTag, FiDollarSign, FiInfo, FiUser, FiMapPin, FiCreditCard, FiTruck, FiShoppingBag, FiClock, FiCheckCircle, FiXCircle, FiArrowRight, FiRefreshCw } from 'react-icons/fi'; // Icons
import Pagination from '@/components/ui/Pagination'; // Import Pagination
import BrandSpinner from '@/components/ui/BrandSpinner';

// Components Loading/Error (Có thể dùng chung)
const LoadingSpinner = () => (
  <div className="flex flex-col justify-center items-center py-16">
    <BrandSpinner
      size="text-5xl"
      text="Đang tải lịch sử đơn hàng..."
      textColor="text-gray-600 dark:text-gray-300"
    />
  </div>
);

const ErrorMessage = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-5">
      <FiAlertCircle size={40} className="text-red-600 dark:text-red-400" />
    </div>
    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Không thể tải lịch sử đơn hàng</h3>
    <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md">{message}</p>
    <button
      onClick={() => window.location.reload()}
      className="bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 text-white px-6 py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 flex items-center gap-2 font-medium shadow-sm"
    >
      <FiRefreshCw />
      Thử lại
    </button>
  </div>
);

// Component hiển thị tag trạng thái đơn hàng
const OrderStatusBadge = ({ status }) => {
  let bgColor = 'bg-gray-100 dark:bg-gray-700';
  let textColor = 'text-gray-600 dark:text-gray-300';
  let dotColor = 'bg-gray-400';
  let icon = <FiClock className="mr-1" />;
  let statusText = status.replace(/_/g, ' ');

  switch (status) {
    case 'PENDING':
    case 'PENDING_PAYMENT':
      bgColor = 'bg-yellow-50 dark:bg-yellow-900/30';
      textColor = 'text-yellow-700 dark:text-yellow-300';
      dotColor = 'bg-yellow-400';
      icon = <FiClock className="mr-1" />;
      statusText = 'Đang chờ xử lý';
      break;
    case 'PROCESSING':
      bgColor = 'bg-blue-50 dark:bg-blue-900/30';
      textColor = 'text-blue-700 dark:text-blue-300';
      dotColor = 'bg-blue-400';
      icon = <FiPackage className="mr-1" />;
      statusText = 'Đang xử lý';
      break;
    case 'SHIPPED':
      bgColor = 'bg-indigo-50 dark:bg-indigo-900/30';
      textColor = 'text-indigo-700 dark:text-indigo-300';
      dotColor = 'bg-indigo-400';
      icon = <FiTruck className="mr-1" />;
      statusText = 'Đang giao hàng';
      break;
    case 'DELIVERED':
      bgColor = 'bg-green-50 dark:bg-green-900/30';
      textColor = 'text-green-700 dark:text-green-300';
      dotColor = 'bg-green-400';
      icon = <FiCheckCircle className="mr-1" />;
      statusText = 'Đã giao hàng';
      break;
    case 'CANCELLED':
      bgColor = 'bg-red-50 dark:bg-red-900/30';
      textColor = 'text-red-700 dark:text-red-300';
      dotColor = 'bg-red-400';
      icon = <FiXCircle className="mr-1" />;
      statusText = 'Đã hủy';
      break;
    case 'PAYMENT_FAILED':
      bgColor = 'bg-red-50 dark:bg-red-900/30';
      textColor = 'text-red-700 dark:text-red-300';
      dotColor = 'bg-red-400';
      icon = <FiXCircle className="mr-1" />;
      statusText = 'Thanh toán thất bại';
      break;
  }

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${bgColor} ${textColor} shadow-sm`}>
      {icon}
      {statusText}
    </span>
  );
};

// Hàm format tiền tệ (ví dụ)
const formatCurrency = (amount) => {
  if (amount == null) return 'N/A';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
}

// Hàm format ngày (ví dụ)
const formatDate = (isoString) => {
  if (!isoString) return 'N/A';
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
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
  }, [pageSize, logout, router]);

  // useEffect để fetch khi trang thay đổi hoặc khi auth state sẵn sàng
  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      fetchOrders(currentPage);
    }
    else if (!isAuthLoading && !isAuthenticated) {
      router.replace('/login?redirect=/orders/my-history');
    }
  }, [isAuthenticated, isAuthLoading, currentPage, fetchOrders, router]);

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
    return <div className="text-center py-10 text-gray-700 dark:text-gray-300">Vui lòng đăng nhập để xem lịch sử đơn hàng.</div>;
  }
  if (isLoading && !orderPage) { // Chỉ hiển thị loading nếu chưa có dữ liệu trang trước đó
    return <LoadingSpinner />;
  }
  if (error) {
    return <ErrorMessage message={error} />;
  }
  if (!orderPage || orderPage.totalElements === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center py-16 border rounded-xl bg-gray-50 dark:bg-gray-800 dark:border-gray-700 shadow-sm">
          <div className="bg-orange-100 dark:bg-orange-900/30 rounded-full w-24 h-24 mx-auto flex items-center justify-center mb-6">
            <FiShoppingBag size={50} className="text-orange-500 dark:text-orange-400" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-800 dark:text-white mb-3">Chưa có đơn hàng nào</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">Những đơn hàng bạn đã đặt sẽ xuất hiện ở đây. Hãy khám phá cửa hàng và đặt đơn hàng đầu tiên của bạn!</p>
          <Link
            href="/products"
            className="bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 text-white py-3 px-8 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-md hover:shadow-lg font-medium inline-flex items-center gap-2"
          >
            <FiShoppingBag />
            Bắt đầu mua sắm
          </Link>
        </div>
      </div>
    );
  }

  // --- Hiển thị danh sách đơn hàng ---
  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="bg-gradient-to-r from-orange-100 to-amber-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-sm p-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
          <span className="bg-orange-500 text-white p-2 rounded-lg"><FiPackage size={24} /></span>
          Lịch sử đơn hàng
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">Theo dõi và quản lý tất cả đơn hàng của bạn</p>
      </div>

      <div className="space-y-6">
        {orderPage.content.map((order) => (
          <div key={order.orderId}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100 dark:border-gray-700 overflow-hidden"
          >
            {/* Header của đơn hàng */}
            <div className="flex flex-wrap justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center">
                  <span className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg mr-3">
                    <FiTag className="text-orange-500 dark:text-orange-400" />
                  </span>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Mã đơn hàng</div>
                    <div className="font-medium text-gray-900 dark:text-white">#{order.orderId}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg mr-3">
                    <FiCalendar className="text-orange-500 dark:text-orange-400" />
                  </span>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Ngày đặt</div>
                    <div className="font-medium text-gray-900 dark:text-white">{formatDate(order.orderDate)}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg mr-3">
                    <FiDollarSign className="text-orange-500 dark:text-orange-400" />
                  </span>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Tổng tiền</div>
                    <div className="font-medium text-gray-900 dark:text-white">{formatCurrency(order.totalAmount)}</div>
                  </div>
                </div>
              </div>
              <div className="mt-4 sm:mt-0">
                <OrderStatusBadge status={order.status} />
              </div>
            </div>

            {/* Thông tin tóm tắt */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6 text-sm">
              <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center text-gray-700 dark:text-gray-200">
                  <FiUser className="mr-2 text-orange-500 dark:text-orange-400" />
                  Người nhận
                </h4>
                <p className="text-gray-600 dark:text-gray-300">{order.shippingRecipientName || "Chưa cập nhật"}</p>
                <p className="text-gray-600 dark:text-gray-300">{order.shippingPhone || "Chưa cập nhật"}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center text-gray-700 dark:text-gray-200">
                  <FiMapPin className="mr-2 text-orange-500 dark:text-orange-400" />
                  Địa chỉ giao hàng
                </h4>
                <p className="text-gray-600 dark:text-gray-300">{order.shippingStreet || "Chưa cập nhật"}</p>
                <p className="text-gray-600 dark:text-gray-300">
                  {order.shippingDistrict && order.shippingCity ?
                    `${order.shippingDistrict}, ${order.shippingCity}` :
                    "Chưa cập nhật"}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center text-gray-700 dark:text-gray-200">
                  <FiCreditCard className="mr-2 text-orange-500 dark:text-orange-400" />
                  Phương thức thanh toán
                </h4>
                <p className="text-gray-600 dark:text-gray-300">{order.paymentMethod || "Chưa cập nhật"}</p>
                <p className="text-gray-600 dark:text-gray-300">
                  {order.paymentStatus || "Chưa cập nhật"}
                </p>
              </div>
            </div>

            {/* Chi tiết đơn hàng & Nút hành động */}
            <div className="flex justify-between items-center pt-2">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {order.orderItems?.length || 0} sản phẩm
              </div>
              <Link
                href={`/orders/${order.orderId}`}
                className="flex items-center bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-800/30 px-4 py-2 rounded-lg transition-colors font-medium text-sm"
              >
                Xem chi tiết
                <FiArrowRight className="ml-2" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Phân trang */}
      {orderPage.totalPages > 1 && (
        <div className="mt-10 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={orderPage.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;


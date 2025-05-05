// src/components/order/OrderHelpers.jsx
import React from 'react';
import { FiInfo, FiLoader, FiPackage, FiTruck, FiCheckCircle, FiXCircle, FiDollarSign } from 'react-icons/fi'; // Thêm các icons cần thiết

// --- Order Status Badge Component ---
export const OrderStatusBadge = ({ status }) => {
    let bgColor = 'bg-gray-100 dark:bg-gray-700';
    let textColor = 'text-gray-600 dark:text-gray-300';
    let dotColor = 'bg-gray-400';
    let icon = <FiInfo size={12} className="hidden sm:inline"/>; // Default icon, ẩn trên mobile

    // Mặc định Enum từ Backend: PENDING, PENDING_PAYMENT, PROCESSING, SHIPPED, DELIVERED, CANCELLED, PAYMENT_FAILED
    switch (status) {
        case 'PENDING':
            bgColor = 'bg-yellow-50 dark:bg-yellow-900/30';
            textColor = 'text-yellow-700 dark:text-yellow-400';
            dotColor = 'bg-yellow-500';
            icon = <FiLoader size={12} className="hidden sm:inline animate-spin"/>;
            break;
        case 'PENDING_PAYMENT':
            bgColor = 'bg-orange-50 dark:bg-orange-900/30';
            textColor = 'text-orange-700 dark:text-orange-400';
            dotColor = 'bg-orange-500';
            icon = <FiDollarSign size={12} className="hidden sm:inline"/>;
            break;
        case 'PROCESSING':
            bgColor = 'bg-blue-50 dark:bg-blue-900/30';
            textColor = 'text-blue-700 dark:text-blue-400';
            dotColor = 'bg-blue-500';
            icon = <FiPackage size={12} className="hidden sm:inline"/>;
            break;
        case 'SHIPPED':
            bgColor = 'bg-indigo-50 dark:bg-indigo-900/30';
            textColor = 'text-indigo-700 dark:text-indigo-400';
            dotColor = 'bg-indigo-500';
            icon = <FiTruck size={12} className="hidden sm:inline"/>;
            break;
        case 'DELIVERED':
            bgColor = 'bg-green-50 dark:bg-green-900/30';
            textColor = 'text-green-700 dark:text-green-400';
            dotColor = 'bg-green-500';
            icon = <FiCheckCircle size={12} className="hidden sm:inline"/>;
            break;
        case 'CANCELLED':
        case 'PAYMENT_FAILED':
            bgColor = 'bg-red-50 dark:bg-red-900/30';
            textColor = 'text-red-700 dark:text-red-400';
            dotColor = 'bg-red-500';
            icon = <FiXCircle size={12} className="hidden sm:inline"/>;
            break;
        default: // Xử lý trường hợp status không khớp
            status = 'UNKNOWN';
            break;
    }

    return (
        <span className={`inline-flex items-center gap-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
            {icon}
            {/* Thay thế dấu gạch dưới và viết hoa chữ cái đầu */}
            {status.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())}
        </span>
    );
};


// --- Format Currency Function ---
export const formatCurrency = (amount, currency = 'USD', locale = 'en-US') => {
    if (amount == null || isNaN(amount)) return 'N/A';

    // Ví dụ thêm tùy chọn định dạng
    // if (currency === 'VND') {
    //     locale = 'vi-VN';
    //     // Có thể nhân tỉ giá ở đây nếu amount luôn là USD từ backend
    //     // amount = amount * 25000; // Ví dụ tỉ giá
    // }

    try {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
            // maximumFractionDigits: currency === 'VND' ? 0 : 2, // VND không cần số thập phân
        }).format(amount);
    } catch (error) {
        console.error("Error formatting currency:", error);
        return `${currency} ${amount.toFixed(2)}`; // Fallback đơn giản
    }
}


// --- Format Date Function ---
export const formatDate = (isoString, options = {}) => {
    if (!isoString) return 'N/A';

    const defaultOptions = {
        // day: '2-digit', month: '2-digit', year: 'numeric' // Định dạng ngắn gọn YYYY-MM-DD
        year: 'numeric', month: 'short', day: 'numeric', // Định dạng Jan 1, 2024
        // hour: '2-digit', minute: '2-digit' // Thêm giờ phút nếu cần
    };

    const mergedOptions = { ...defaultOptions, ...options };

    try {
        return new Date(isoString).toLocaleDateString('en-US', mergedOptions); // Dùng locale en-US hoặc vi-VN tùy ý
    } catch (error) {
        console.error("Error formatting date:", error);
        return isoString; // Trả về chuỗi gốc nếu lỗi
    }
}

// --- Format DateTime Function ---
export const formatDateTime = (isoString, options = {}) => {
     if (!isoString) return 'N/A';

    const defaultOptions = {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit', // Thêm giờ phút
        hour12: true // Dùng định dạng 12 giờ (AM/PM) hoặc false cho 24 giờ
    };

    const mergedOptions = { ...defaultOptions, ...options };

    try {
        return new Date(isoString).toLocaleString('en-US', mergedOptions); // Dùng localeString cho cả ngày và giờ
    } catch (error) {
        console.error("Error formatting date/time:", error);
        return isoString;
    }
}

// Bạn có thể thêm các hàm helper khác liên quan đến Order ở đây
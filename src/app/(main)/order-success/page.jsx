// src/app/(main)/order-success/page.jsx
'use client'; // Cần client component để đọc searchParams

import React, { Suspense } from 'react'; // Import Suspense
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FiCheckCircle, FiHome, FiClipboard } from 'react-icons/fi'; // Icons

// Component nội dung chính, tách ra để dùng Suspense
function OrderSuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId'); // Lấy orderId từ URL

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"> {/* Chiều cao tối thiểu */}
            <FiCheckCircle className="text-green-500 text-6xl sm:text-7xl mb-5 animate-pulse" /> {/* Icon thành công */}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-dark-text mb-3">
                Đặt hàng thành công!
            </h1>
            <p className="text-gray-600 dark:text-dark-text-secondary mb-4 max-w-md">
                Cảm ơn bạn đã mua hàng tại AtomikBooks. Đơn hàng của bạn đang được xử lý và sẽ sớm được giao đến bạn.
            </p>
            {orderId && ( // Chỉ hiển thị nếu có orderId
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-8">
                    Mã đơn hàng của bạn là: <strong className="text-orange-600 dark:text-orange-400">#{orderId}</strong>
                </p>
            )}

            {/* Nút điều hướng */}
            <div className="flex flex-col sm:flex-row gap-3">
                <Link
                    href="/"
                    className="inline-flex items-center justify-center gap-2 bg-orange-500 text-white px-5 py-2.5 rounded hover:bg-orange-600 transition-colors font-medium"
                >
                    <FiHome />
                    Quay về Trang chủ
                </Link>
                {orderId && ( // Chỉ hiển thị nếu có orderId
                    <Link
                        href={`/orders/${orderId}`} // Link đến trang chi tiết đơn hàng vừa tạo
                        className="inline-flex items-center justify-center gap-2 bg-white dark:bg-dark-surface border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-dark-text px-5 py-2.5 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                    >
                         <FiClipboard />
                        Xem chi tiết Đơn hàng
                    </Link>
                )}
            </div>
        </div>
    );
}


// Component trang chính, sử dụng Suspense
export default function OrderSuccessPage() {
     // Suspense giúp xử lý việc đọc searchParams trong Client Component render lần đầu
     // mà không gây lỗi hoặc cảnh báo trong một số trường hợp với Next.js mới
    return (
        <Suspense fallback={<div className="text-center py-10">Loading order confirmation...</div>}>
            <OrderSuccessContent />
        </Suspense>
    );
}
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiPackage, FiUser, FiMapPin, FiCalendar, FiDollarSign, FiInfo, FiTruck, FiLoader, FiAlertCircle, FiArrowLeft, FiXCircle } from 'react-icons/fi';
import { OrderStatusBadge, formatCurrency, formatDate, formatDateTime } from '@/components/order/OrderHelpers';
import axiosInstance from '@/lib/axiosInstance';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'react-toastify';

// Loading component
const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-300">Đang tải thông tin đơn hàng...</span>
    </div>
);

// Error message component
const ErrorMessage = ({ message, onRetry }) => (
    <div className="text-center py-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400 mb-4">
            <FiAlertCircle size={32} />
        </div>
        <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">Lỗi khi tải đơn hàng</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto">{message}</p>
        {onRetry && (
            <button
                onClick={onRetry}
                className="mt-4 inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
            >
                <FiLoader className="mr-2" />
                Thử lại
            </button>
        )}
        <div className="mt-3">
            <Link href="/orders/my-history" className="text-orange-600 dark:text-orange-400 hover:underline flex items-center justify-center gap-2">
                <FiArrowLeft /> Quay lại lịch sử đơn hàng
            </Link>
        </div>
    </div>
);

// Main component (Client Component)
export default function OrderDetailPage() {
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isCancelling, setIsCancelling] = useState(false);

    const params = useParams();
    const orderId = params.id; // Changed from params.orderId to params.id
    const router = useRouter();

    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const isAuthLoading = useAuthStore((state) => state.isLoading);
    const logout = useAuthStore((state) => state.logout);

    // Function to fetch order details
    const fetchOrderDetails = useCallback(async () => {
        if (!orderId) {
            setError("ID đơn hàng không hợp lệ.");
            setIsLoading(false);
            return;
        }

        if (!isAuthenticated) {
            // No need to fetch if not authenticated (useEffect will handle redirect)
            setIsLoading(false);
            return;
        }

        console.log(`Fetching order details for ID: ${orderId}`);
        setIsLoading(true);
        setError(null);

        try {
            // axiosInstance will automatically attach the token
            const response = await axiosInstance.get(`/orders/${orderId}`);
            console.log('Order details received:', response.data);
            setOrder(response.data); // Store OrderDTO
        } catch (err) {
            console.error(`Failed to fetch order ${orderId}:`, err);

            if (err.response?.status === 404) {
                setError("Không tìm thấy đơn hàng hoặc bạn không có quyền xem đơn hàng này.");
            } else if (err.response?.status === 401 || err.response?.status === 403) {
                toast.error("Phiên đăng nhập hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.");
                logout(); // Log out client state
                router.push(`/login?redirect=/orders/${orderId}`);
            } else {
                setError(err.response?.data?.message || err.message || 'Không thể tải thông tin đơn hàng.');
            }

            setOrder(null);
        } finally {
            setIsLoading(false);
        }
    }, [orderId, isAuthenticated, logout, router]);

    // Function to cancel order
    const handleCancelOrder = async () => {
        if (!confirm('Bạn có chắc chắn muốn hủy đơn hàng này? Hành động này không thể hoàn tác.')) {
            return;
        }

        setIsCancelling(true);
        try {
            await axiosInstance.put(`/orders/${orderId}/cancel`);
            toast.success('Đã hủy đơn hàng thành công');
            // Refresh order data to show updated status
            fetchOrderDetails();
        } catch (err) {
            console.error('Error cancelling order:', err);
            toast.error(err.response?.data?.message || 'Không thể hủy đơn hàng. Vui lòng thử lại.');
        } finally {
            setIsCancelling(false);
        }
    };

    // useEffect to fetch when component mounts or when auth state is ready
    useEffect(() => {
        if (!isAuthLoading && isAuthenticated) {
            fetchOrderDetails();
        } else if (!isAuthLoading && !isAuthenticated) {
            // Redirect if not logged in
            router.replace(`/login?redirect=/orders/${orderId}`);
        }
    }, [isAuthenticated, isAuthLoading, fetchOrderDetails, router, orderId]);

    // Check if order can be cancelled
    const canCancelOrder = order && ['PENDING', 'PENDING_PAYMENT'].includes(order.status);

    // --- Render Logic ---
    if (isAuthLoading || (isLoading && !order && !error)) {
        return <LoadingSpinner />;
    }

    if (!isAuthenticated) {
        // Fallback if redirect hasn't happened yet
        return <div className="text-center py-10 text-gray-700 dark:text-gray-300">Đang chuyển hướng đến trang đăng nhập...</div>;
    }

    if (error) {
        // Display error (including 404 errors from fetch logic)
        return <ErrorMessage message={error} onRetry={fetchOrderDetails} />;
    }

    if (!order) {
        // Case where there's no error but also no data (rare)
        return <div className="text-center py-10 text-gray-700 dark:text-gray-300">Không có dữ liệu đơn hàng.</div>;
    }

    // --- Display order details ---
    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl">
            {/* Breadcrumbs */}
            <div className="mb-6 text-sm flex items-center flex-wrap gap-1 text-gray-500 dark:text-gray-400">
                <Link href="/" className="hover:text-orange-500 dark:hover:text-orange-400">Trang chủ</Link> /
                <Link href="/orders/my-history" className="hover:text-orange-500 dark:hover:text-orange-400"> Lịch sử đơn hàng</Link> /
                <span className="font-medium text-gray-700 dark:text-gray-300"> Đơn hàng #{order.orderId || order.id}</span>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-lg shadow border dark:border-gray-700">
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b dark:border-gray-600 pb-4 mb-6 gap-3">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">Đơn hàng #{order.orderId || order.id}</h1>
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <FiCalendar className="mr-1.5" />
                            <span>Ngày đặt hàng: {formatDateTime(order.orderDate)}</span>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 items-end">
                        <OrderStatusBadge status={order.status} />
                        {canCancelOrder && (
                            <button
                                onClick={handleCancelOrder}
                                disabled={isCancelling}
                                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isCancelling ? (
                                    <>
                                        <FiLoader className="animate-spin mr-2" />
                                        Đang hủy...
                                    </>
                                ) : (
                                    <>
                                        <FiXCircle className="mr-2" />
                                        Hủy đơn hàng
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Order Detail Information (Grid Layout) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 text-sm">
                    {/* Recipient Information */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-md">
                        <h3 className="font-semibold mb-2 text-gray-700 dark:text-gray-200 flex items-center">
                            <FiUser className="mr-2 text-orange-500" />Thông tin người nhận
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300"><strong className="text-gray-700 dark:text-gray-200">Tên:</strong> {order.shippingRecipientName || order.userName}</p>
                        <p className="text-gray-600 dark:text-gray-300"><strong className="text-gray-700 dark:text-gray-200">Email:</strong> {order.userEmail}</p>
                        <p className="text-gray-600 dark:text-gray-300"><strong className="text-gray-700 dark:text-gray-200">Điện thoại:</strong> {order.shippingPhone}</p>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-md">
                        <h3 className="font-semibold mb-2 text-gray-700 dark:text-gray-200 flex items-center">
                            <FiMapPin className="mr-2 text-orange-500" />Địa chỉ giao hàng
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">{order.shippingStreet}</p>
                        <p className="text-gray-600 dark:text-gray-300">{order.shippingDistrict}, {order.shippingCity}</p>
                        <p className="text-gray-600 dark:text-gray-300">{order.shippingCountry}</p>
                    </div>

                    {/* Payment Information */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-md">
                        <h3 className="font-semibold mb-2 text-gray-700 dark:text-gray-200 flex items-center">
                            <FiDollarSign className="mr-2 text-orange-500" />Thông tin thanh toán
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300"><strong className="text-gray-700 dark:text-gray-200">Phương thức:</strong> {order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : order.paymentMethod}</p>
                        <p className="text-gray-600 dark:text-gray-300"><strong className="text-gray-700 dark:text-gray-200">Trạng thái:</strong> <span className="font-medium">{order.status === 'PENDING' ? 'Chờ xử lý' :
                            order.status === 'PENDING_PAYMENT' ? 'Chờ thanh toán' :
                                order.status === 'PROCESSING' ? 'Đang xử lý' :
                                    order.status === 'SHIPPED' ? 'Đã giao cho vận chuyển' :
                                        order.status === 'DELIVERED' ? 'Đã giao hàng' :
                                            order.status === 'CANCELLED' ? 'Đã hủy' :
                                                order.status === 'PAYMENT_FAILED' ? 'Thanh toán thất bại' :
                                                    order.status.replace('_', ' ')}</span></p>
                        <p className="text-gray-600 dark:text-gray-300"><strong className="text-gray-700 dark:text-gray-200">Tổng tiền:</strong> <span className="font-bold text-lg text-orange-600 dark:text-orange-400">{formatCurrency(order.totalAmount)}</span></p>
                    </div>

                    {/* Notes (if any) */}
                    {order.notes && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-md md:col-span-1">
                            <h3 className="font-semibold mb-2 text-yellow-800 dark:text-yellow-300 flex items-center">
                                <FiInfo className="mr-2" />Ghi chú của khách hàng
                            </h3>
                            <p className="text-yellow-700 dark:text-yellow-200">{order.notes}</p>
                        </div>
                    )}
                </div>

                {/* Product List */}
                <div>
                    <h3 className="text-lg font-semibold mb-3 border-t dark:border-gray-600 pt-4 text-gray-800 dark:text-gray-200">
                        Sản phẩm đã đặt ({order.orderItems?.length || 0})
                    </h3>
                    <div className="space-y-4">
                        {order.orderItems?.map((item) => (
                            <div key={item.orderItemId || item.id} className="flex items-center gap-4 border-b dark:border-gray-700 pb-4 last:border-b-0 last:pb-0">
                                <div className="w-16 h-20 flex-shrink-0 relative rounded overflow-hidden bg-gray-100 dark:bg-gray-700">
                                    <Image
                                        src={item.productImageUrl || '/sample_books.jpg'}
                                        alt={item.productTitle || 'Sách'}
                                        fill
                                        style={{ objectFit: 'contain' }}
                                        sizes="64px"
                                        onError={(e) => { e.target.src = '/sample_books.jpg'; }}
                                    />
                                </div>
                                <div className="flex-grow">
                                    <p className="font-medium text-sm sm:text-base text-gray-800 dark:text-gray-200 line-clamp-2">{item.productTitle}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">tác giả: {item.productAuthor || 'Không có'}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Giá: {formatCurrency(item.priceAtPurchase)}</p>
                                </div>
                                <div className="text-right text-sm">
                                    <p className="text-gray-500 dark:text-gray-400">SL: {item.quantity}</p>
                                    <p className="font-semibold mt-1 text-gray-700 dark:text-gray-300">{formatCurrency(item.priceAtPurchase * item.quantity)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Back button */}
                <div className="mt-8 text-center">
                    <Link href="/orders/my-history" className="inline-flex items-center text-orange-600 dark:text-orange-400 hover:underline gap-2">
                        <FiArrowLeft /> Quay lại lịch sử đơn hàng
                    </Link>
                </div>
            </div>
        </div>
    );
} 
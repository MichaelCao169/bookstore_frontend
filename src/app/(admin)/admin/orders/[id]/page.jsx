'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axiosInstance';
import { use } from 'react';
import { FiPackage, FiUser, FiCalendar, FiDollarSign, FiCreditCard, FiTag, FiArrowLeft, FiSave, FiLoader } from 'react-icons/fi';

export default function OrderDetail({ params }) {
    const unwrappedParams = use(params);
    const orderId = unwrappedParams.id;
    const router = useRouter();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [newStatus, setNewStatus] = useState('');

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/admin/orders/${orderId}`);
            console.log('Order detail response:', response.data);
            setOrder(response.data);
            setNewStatus(response.data.status); // Initialize with current status
        } catch (err) {
            console.error('Error fetching order details:', err);
            setError('Không thể tải thông tin đơn hàng. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrderDetails();
    }, [orderId]);

    const handleUpdateStatus = async () => {
        if (newStatus === order.status) {
            return; // No change
        }

        try {
            setUpdatingStatus(true);
            await axiosInstance.put(`/admin/orders/${orderId}/status`, {
                status: newStatus,
            });

            // Refresh order data
            fetchOrderDetails();
            alert('Cập nhật trạng thái đơn hàng thành công');
        } catch (err) {
            console.error('Error updating order status:', err);
            alert('Cập nhật trạng thái thất bại. Vui lòng thử lại.');
        } finally {
            setUpdatingStatus(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('vi-VN', options);
    };

    const formatCurrency = (amount) => {
        if (!amount) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING_PAYMENT':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
            case 'PROCESSING':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
            case 'SHIPPED':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
            case 'DELIVERED':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            case 'CANCELLED':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    const getStatusTranslation = (status) => {
        switch (status) {
            case 'PENDING_PAYMENT':
                return 'Chờ thanh toán';
            case 'PENDING':
                return 'Chờ xử lý';
            case 'PROCESSING':
                return 'Đang xử lý';
            case 'SHIPPED':
                return 'Đã gửi hàng';
            case 'DELIVERED':
                return 'Đã giao hàng';
            case 'CANCELLED':
                return 'Đã hủy';
            default:
                return status;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full p-8">
                <FiLoader className="w-6 h-6 text-orange-500 animate-spin mr-2" />
                <span className="text-gray-600 dark:text-gray-300">Đang tải thông tin đơn hàng...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8">
                <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                <button
                    onClick={() => router.push('/admin/orders')}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md flex items-center dark:bg-orange-700 dark:hover:bg-orange-800 transition-colors"
                >
                    <FiArrowLeft className="mr-2" /> Quay lại danh sách đơn hàng
                </button>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8">
                <p className="text-gray-600 dark:text-gray-400 mb-4">Không tìm thấy đơn hàng</p>
                <button
                    onClick={() => router.push('/admin/orders')}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md flex items-center dark:bg-orange-700 dark:hover:bg-orange-800 transition-colors"
                >
                    <FiArrowLeft className="mr-2" /> Quay lại danh sách đơn hàng
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 text-white p-4 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold flex items-center">
                    <FiPackage className="mr-2" /> Đơn hàng #{order.orderId}
                </h1>
                <button
                    onClick={() => router.push('/admin/orders')}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-md flex items-center transition-colors"
                >
                    <FiArrowLeft className="mr-2" /> Quay lại
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Order Overview */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow col-span-2 border border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Tổng quan đơn hàng</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                                <FiCalendar className="mr-2 text-orange-500 dark:text-orange-400" /> Ngày đặt hàng
                            </p>
                            <p className="font-medium text-gray-800 dark:text-gray-200">{formatDate(order.orderDate)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                                <FiTag className="mr-2 text-orange-500 dark:text-orange-400" /> Trạng thái
                            </p>
                            <span className={`px-2 py-1 text-xs rounded-full inline-flex items-center mt-1 ${getStatusColor(order.status)}`}>
                                {getStatusTranslation(order.status)}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                                <FiDollarSign className="mr-2 text-orange-500 dark:text-orange-400" /> Tổng tiền
                            </p>
                            <p className="font-medium text-gray-800 dark:text-gray-200">{formatCurrency(order.totalAmount)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                                <FiCreditCard className="mr-2 text-orange-500 dark:text-orange-400" /> Phương thức thanh toán
                            </p>
                            <p className="font-medium text-gray-800 dark:text-gray-200">{order.paymentMethod || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                {/* Status Management */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Cập nhật trạng thái</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Trạng thái đơn hàng
                            </label>
                            <select
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                                disabled={updatingStatus}
                            >
                                <option value="PENDING_PAYMENT">Chờ thanh toán</option>
                                <option value="PENDING">Chờ xử lý</option>
                                <option value="PROCESSING">Đang xử lý</option>
                                <option value="SHIPPED">Đã gửi hàng</option>
                                <option value="DELIVERED">Đã giao hàng</option>
                                <option value="CANCELLED">Đã hủy</option>
                            </select>
                        </div>
                        <button
                            onClick={handleUpdateStatus}
                            disabled={updatingStatus || newStatus === order.status}
                            className={`w-full px-4 py-2 bg-orange-600 text-white rounded-md flex items-center justify-center ${updatingStatus || newStatus === order.status
                                ? 'opacity-70 cursor-not-allowed'
                                : 'hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-800'
                                } transition-colors`}
                        >
                            {updatingStatus ? (
                                <>
                                    <FiLoader className="animate-spin mr-2" /> Đang cập nhật...
                                </>
                            ) : (
                                <>
                                    <FiSave className="mr-2" /> Cập nhật trạng thái
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center">
                    <FiUser className="mr-2 text-orange-500 dark:text-orange-400" /> Thông tin khách hàng
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Tên khách hàng</p>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{order.userName || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{order.userEmail || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Địa chỉ giao hàng</p>
                        <p className="font-medium text-gray-800 dark:text-gray-200">
                            {order.shippingCountry}, {order.shippingDistrict},{' '}
                            {order.shippingCity}, {order.shippingStreet}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Số điện thoại</p>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{order.shippingPhone || 'N/A'}</p>
                    </div>
                </div>
            </div>

            {/* Order Items */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Sản phẩm đặt mua</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Sản phẩm
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Giá
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Số lượng
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Tổng tiền
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {order.orderItems?.length > 0 ? (
                                order.orderItems.map((item) => (
                                    <tr key={item.orderItemId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    {item?.productImageUrl ? (
                                                        <img
                                                            className="h-10 w-10 object-cover rounded-md"
                                                            src={item.productImageUrl}
                                                            alt={item.productTitle}
                                                        />
                                                    ) : (
                                                        <div className="h-10 w-10 bg-gray-200 dark:bg-gray-600 rounded-md"></div>
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-200">
                                                        {item?.productTitle || 'Sản phẩm không xác định'}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {item?.productAuthor || ''}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-800 dark:text-gray-200">
                                            {formatCurrency(item.priceAtPurchase)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-800 dark:text-gray-200">
                                            {item.quantity}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-800 dark:text-gray-200">
                                            {formatCurrency(item.subtotal || (item.priceAtPurchase * item.quantity))}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                        Không có sản phẩm nào trong đơn hàng này
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <td colSpan="3" className="px-6 py-4 text-right text-sm font-medium text-gray-800 dark:text-gray-200">
                                    Tổng cộng:
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-gray-100">
                                    {formatCurrency(order.totalAmount)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
}
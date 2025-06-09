'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axiosInstance from '@/lib/axiosInstance';
import { FiShoppingBag, FiEye, FiLoader, FiCalendar, FiUser, FiDollarSign, FiTag, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function OrdersManagement() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const fetchOrders = async (page = 0) => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/api/admin/orders', {
                params: {
                    page
                }
            });
            console.log('Orders response:', response.data);

            if (response.data && response.data.content) {
                setOrders(response.data.content);
                setTotalPages(response.data.totalPages || 1);
                setCurrentPage(response.data.number || 0);

                // Log the first order for debugging the customer name field
                if (response.data.content.length > 0) {
                    console.log('Sample order object:', response.data.content[0]);
                }
            } else {
                setOrders(Array.isArray(response.data) ? response.data : []);
                setTotalPages(1);
                setCurrentPage(0);

                // Log the first order for debugging the customer name field
                if (Array.isArray(response.data) && response.data.length > 0) {
                    console.log('Sample order object:', response.data[0]);
                }
            }
        } catch (err) {
            console.error('Error fetching orders:', err);
            setError('Không thể tải danh sách đơn hàng. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders(currentPage);
    }, [currentPage]);

    const getStatusColor = (status) => {
        switch (status) {
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

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('vi-VN', options);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 text-white p-4 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold flex items-center">
                    <FiShoppingBag className="mr-2" /> Quản lý đơn hàng
                </h1>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                {loading ? (
                    <div className="text-center py-4 text-gray-600 dark:text-gray-400 flex justify-center items-center">
                        <FiLoader className="animate-spin mr-2" />
                        Đang tải đơn hàng...
                    </div>
                ) : error ? (
                    <div className="text-center py-4 text-red-600 dark:text-red-400">{error}</div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Mã đơn hàng
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Ngày đặt
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Khách hàng
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Tổng tiền
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Trạng thái
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Thao tác
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {orders.length > 0 ? (
                                        orders.map((order) => (
                                            <tr key={order.orderId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-200 font-medium">#{order.orderId}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-200">
                                                    <div className="flex items-center">
                                                        <FiCalendar className="mr-1 text-gray-500 dark:text-gray-400" />
                                                        {formatDate(order.orderDate)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-200">
                                                    <div className="flex items-center">
                                                        <FiUser className="mr-1 text-gray-500 dark:text-gray-400" />
                                                        {order.userName || order.customerName || 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-200">
                                                    <div className="flex items-center">

                                                        {formatCurrency(order.totalAmount || 0)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs rounded-full inline-flex items-center ${getStatusColor(order.status)}`}>
                                                        <FiTag className="mr-1" />
                                                        {getStatusTranslation(order.status)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Link
                                                        href={`/admin/orders/${order.orderId}`}
                                                        title="Xem chi tiết"
                                                        className="w-9 h-9 flex items-center justify-center rounded-full bg-orange-50 text-orange-600 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:hover:bg-orange-900/30"
                                                    >
                                                        <FiEye />
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                                Không tìm thấy đơn hàng nào
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {totalPages > 1 && (
                            <nav aria-label="Phân trang" className="flex items-center justify-center mt-6">
                                <div className="flex items-center space-x-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-1">
                                    {/* Nút Trước */}
                                    <button
                                        onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                                        disabled={currentPage === 0}
                                        className={`
                                            flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ease-in-out
                                            ${currentPage === 0
                                                ? 'cursor-not-allowed text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700/50'
                                                : 'text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:shadow-sm'
                                            }
                                            focus:outline-none focus:ring-2 focus:ring-orange-300 dark:focus:ring-orange-600 focus:ring-opacity-50
                                        `}
                                        aria-label="Trang trước"
                                    >
                                        <FiChevronLeft className="w-4 h-4 mr-1" />
                                        Trước
                                    </button>

                                    {/* Các nút số trang */}
                                    {Array.from({ length: totalPages }, (_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentPage(i)}
                                            className={`
                                                flex items-center justify-center w-10 h-10 text-sm font-medium rounded-md transition-all duration-200 ease-in-out
                                                focus:outline-none focus:ring-2 focus:ring-orange-300 dark:focus:ring-orange-600 focus:ring-opacity-50
                                                ${currentPage === i
                                                    ? 'text-white bg-orange-600 dark:bg-orange-500 shadow-md cursor-default ring-2 ring-orange-300 dark:ring-orange-600 ring-opacity-50'
                                                    : 'text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:shadow-sm'
                                                }
                                            `}
                                            aria-label={`Đi đến trang ${i + 1}`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}

                                    {/* Nút Tiếp */}
                                    <button
                                        onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                                        disabled={currentPage === totalPages - 1}
                                        className={`
                                            flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ease-in-out
                                            ${currentPage === totalPages - 1
                                                ? 'cursor-not-allowed text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700/50'
                                                : 'text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:shadow-sm'
                                            }
                                            focus:outline-none focus:ring-2 focus:ring-orange-300 dark:focus:ring-orange-600 focus:ring-opacity-50
                                        `}
                                        aria-label="Trang tiếp"
                                    >
                                        Tiếp
                                        <FiChevronRight className="w-4 h-4 ml-1" />
                                    </button>
                                </div>

                                {/* Thông tin trang hiện tại */}
                                <div className="ml-4 text-sm text-gray-600 dark:text-gray-400">
                                    Trang <span className="font-medium text-orange-600 dark:text-orange-400">{currentPage + 1}</span> / <span className="font-medium">{totalPages}</span>
                                </div>
                            </nav>
                        )}
                    </>
                )}
            </div>
        </div>
    );
} 
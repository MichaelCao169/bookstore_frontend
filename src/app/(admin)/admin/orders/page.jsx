'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axiosInstance from '@/lib/axiosInstance';
import { FiShoppingBag, FiEye, FiLoader, FiCalendar, FiUser, FiDollarSign, FiTag, FiChevronLeft, FiChevronRight, FiSearch, FiFilter } from 'react-icons/fi';

export default function OrdersManagement() {
    const [allOrders, setAllOrders] = useState([]); // Lưu tất cả orders từ server
    const [filteredOrders, setFilteredOrders] = useState([]); // Orders sau khi filter
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const itemsPerPage = 10; // Client-side pagination

    // Filter states
    const [filters, setFilters] = useState({
        orderId: '',
        status: '',
        startDate: '',
        endDate: ''
    });
    const [showFilters, setShowFilters] = useState(false);

    // Tất cả trạng thái đơn hàng có thể có
    const ORDER_STATUSES = [
        { value: '', label: 'Tất cả trạng thái' },
        { value: 'PENDING', label: 'Chờ xử lý' },
        { value: 'PROCESSING', label: 'Đang xử lý' },
        { value: 'SHIPPED', label: 'Đã gửi hàng' },
        { value: 'DELIVERED', label: 'Đã giao hàng' },
        { value: 'CANCELLED', label: 'Đã hủy' }
    ];

    // Fetch tất cả orders từ server (không filter)
    const fetchAllOrders = async () => {
        try {
            setLoading(true);
            const allOrdersData = [];
            let page = 0;
            let hasMore = true;

            // Fetch tất cả pages để có toàn bộ dữ liệu cho client-side filtering
            while (hasMore) {
                const response = await axiosInstance.get('/api/admin/orders', {
                    params: { page, size: 50 } // Lấy 50 items mỗi lần để giảm số request
                });

                if (response.data && response.data.content) {
                    allOrdersData.push(...response.data.content);
                    hasMore = page < response.data.totalPages - 1;
                    page++;
                } else {
                    hasMore = false;
                }
            }

            console.log('Fetched all orders:', allOrdersData.length);
            setAllOrders(allOrdersData);

        } catch (err) {
            console.error('Error fetching orders:', err);
            setError('Không thể tải danh sách đơn hàng. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    // Client-side filtering function
    const applyClientSideFilters = () => {
        let filtered = [...allOrders];

        // Filter by orderId
        if (filters.orderId.trim()) {
            filtered = filtered.filter(order =>
                order.orderId.toLowerCase().includes(filters.orderId.toLowerCase())
            );
        }

        // Filter by status
        if (filters.status) {
            filtered = filtered.filter(order => order.status === filters.status);
        }

        // Filter by date range
        if (filters.startDate) {
            const startDate = new Date(filters.startDate);
            filtered = filtered.filter(order => {
                const orderDate = new Date(order.orderDate);
                return orderDate >= startDate;
            });
        }

        if (filters.endDate) {
            const endDate = new Date(filters.endDate);
            endDate.setHours(23, 59, 59, 999); // End of day
            filtered = filtered.filter(order => {
                const orderDate = new Date(order.orderDate);
                return orderDate <= endDate;
            });
        }

        console.log('Filtered orders:', filtered.length, 'from', allOrders.length);
        setFilteredOrders(filtered);
        setCurrentPage(0); // Reset về trang đầu
        setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    };

    // Load data khi component mount
    useEffect(() => {
        fetchAllOrders();
    }, []);

    // Apply filters khi allOrders hoặc filters thay đổi
    useEffect(() => {
        if (allOrders.length > 0) {
            applyClientSideFilters();
        }
    }, [allOrders, filters]);

    // Xử lý thay đổi filter
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    // Reset filters
    const resetFilters = () => {
        setFilters({
            orderId: '',
            status: '',
            startDate: '',
            endDate: ''
        });
    };

    // Get orders for current page
    const getCurrentPageOrders = () => {
        const startIndex = currentPage * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredOrders.slice(startIndex, endIndex);
    };

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

    // Hàm rút gọn ID đơn hàng
    const getTruncatedOrderId = (orderId) => {
        return orderId ? orderId.substring(0, 6) : '';
    };

    const currentOrders = getCurrentPageOrders();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 text-white p-4 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold flex items-center">
                    <FiShoppingBag className="mr-2" /> Quản lý đơn hàng
                </h1>
                <div className="flex items-center space-x-3">
                    {filteredOrders.length !== allOrders.length && (
                        <span className="text-sm bg-white/20 px-2 py-1 rounded">
                            {filteredOrders.length}/{allOrders.length} đơn hàng
                        </span>
                    )}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-md flex items-center transition-colors"
                    >
                        <FiFilter className="mr-2" />
                        {showFilters ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
                    </button>
                </div>
            </div>

            {/* Filters Section */}
            {showFilters && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Bộ lọc đơn hàng</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Lọc theo mã đơn hàng */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Mã đơn hàng
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={filters.orderId}
                                    onChange={(e) => handleFilterChange('orderId', e.target.value)}
                                    placeholder="Nhập mã đơn hàng..."
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                                <FiSearch className="absolute left-3 top-3 text-gray-400" />
                            </div>
                        </div>

                        {/* Lọc theo trạng thái */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Trạng thái
                            </label>
                            <select
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                {ORDER_STATUSES.map(status => (
                                    <option key={status.value} value={status.value}>
                                        {status.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Lọc theo ngày bắt đầu */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Từ ngày
                            </label>
                            <input
                                type="date"
                                value={filters.startDate}
                                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>

                        {/* Lọc theo ngày kết thúc */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Đến ngày
                            </label>
                            <input
                                type="date"
                                value={filters.endDate}
                                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Filter Actions */}
                    <div className="flex items-center justify-end space-x-3 mt-4">
                        <button
                            onClick={resetFilters}
                            className="px-4 py-2 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
                        >
                            Đặt lại
                        </button>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Tự động áp dụng khi nhập
                        </span>
                    </div>
                </div>
            )}

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
                                    {currentOrders.length > 0 ? (
                                        currentOrders.map((order) => (
                                            <tr key={order.orderId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-200 font-medium">
                                                    <span
                                                        title={order.orderId}
                                                    >
                                                        {getTruncatedOrderId(order.orderId)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-200">
                                                    <div className="flex items-center">
                                                        <FiCalendar className="mr-1 text-gray-500 dark:text-gray-400" />
                                                        {formatDate(order.orderDate)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-200">
                                                    {formatCurrency(order.totalAmount || 0)}
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
                                            <td colSpan="5" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                                {filteredOrders.length === 0 && allOrders.length > 0
                                                    ? 'Không tìm thấy đơn hàng phù hợp với bộ lọc'
                                                    : 'Không có đơn hàng nào'
                                                }
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
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

                                    {/* Hiển thị số trang */}
                                    <div className="flex items-center space-x-1">
                                        {Array.from({ length: totalPages }, (_, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setCurrentPage(index)}
                                                className={`
                                                    px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ease-in-out
                                                    ${currentPage === index
                                                        ? 'bg-orange-500 text-white shadow-md'
                                                        : 'text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                                                    }
                                                    focus:outline-none focus:ring-2 focus:ring-orange-300 dark:focus:ring-orange-600 focus:ring-opacity-50
                                                `}
                                                aria-label={`Trang ${index + 1}`}
                                            >
                                                {index + 1}
                                            </button>
                                        ))}
                                    </div>

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
                            </nav>
                        )}
                    </>
                )}
            </div>
        </div>
    );
} 
'use client';

import { useEffect, useState } from 'react';
import axiosInstance from '@/lib/axiosInstance';
import DashboardCard from '@/components/layout/DashboardCard';
import { FiShoppingBag, FiPackage, FiUsers, FiDollarSign, FiActivity, FiStar, FiTrendingUp, FiAlertCircle, FiLoader } from 'react-icons/fi';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalProducts: 0,
        totalUsers: 0,
        totalRevenue: 0,
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Demo data to use as fallback
    const demoStats = {
        totalOrders: 152,
        totalProducts: 76,
        totalUsers: 98,
        totalRevenue: 15689500,
    };

    const demoOrders = [
        { orderId: 1, orderDate: new Date(), customerName: 'Nguyễn Văn A', totalAmount: 750000, status: 'PENDING' },
        { orderId: 2, orderDate: new Date(Date.now() - 86400000), customerName: 'Trần Thị B', totalAmount: 1250000, status: 'PROCESSING' },
        { orderId: 3, orderDate: new Date(Date.now() - 172800000), customerName: 'Lê Văn C', totalAmount: 450000, status: 'DELIVERED' },
        { orderId: 4, orderDate: new Date(Date.now() - 259200000), customerName: 'Phạm Thị D', totalAmount: 950000, status: 'SHIPPED' },
        { orderId: 5, orderDate: new Date(Date.now() - 345600000), customerName: 'Hoàng Văn E', totalAmount: 550000, status: 'CANCELLED' },
    ];

    const demoProducts = [
        { id: 1, title: 'Nhà Giả Kim', author: 'Paulo Coelho', price: 79000, soldCount: 158 },
        { id: 2, title: 'Đắc Nhân Tâm', author: 'Dale Carnegie', price: 85000, soldCount: 145 },
        { id: 3, title: 'Tôi Tài Giỏi, Bạn Cũng Thế', author: 'Adam Khoo', price: 92000, soldCount: 132 },
        { id: 4, title: 'Đời Ngắn Đừng Ngủ Dài', author: 'Robin Sharma', price: 72000, soldCount: 120 },
        { id: 5, title: 'Hành Trình Về Phương Đông', author: 'Baird T. Spalding', price: 88000, soldCount: 118 },
    ];

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                let hasError = false;
                let errorDetails = [];

                // Xác định token xác thực từ store
                const token = useAuthStore?.getState()?.accessToken;
                if (!token) {
                    console.error('Không tìm thấy access token');
                    hasError = true;
                    errorDetails.push('Chưa xác thực');
                }

                try {
                    // Thử dùng token trong header thay vì dựa vào interceptor
                    console.log("Đang gọi API dashboard stats...");
                    const statsResponse = await axiosInstance.get('/api/admin/dashboard/stats', {
                        headers: token ? { Authorization: `Bearer ${token}` } : {}
                    });
                    console.log("Kết quả API dashboard stats:", statsResponse.data);
                    setStats(statsResponse.data);
                } catch (err) {
                    console.error('Error fetching dashboard stats:', err);
                    errorDetails.push(`Dashboard stats: ${err.message}`);
                    if (err.response) {
                        console.error('API Response:', err.response.status, err.response.data);
                        errorDetails.push(`Status: ${err.response.status}, Data: "${JSON.stringify(err.response.data)}"`);
                    }
                    // Nếu có lỗi, thử dùng dữ liệu mẫu
                    setStats(demoStats);
                    hasError = true;
                }

                try {
                    // Fetch recent orders với token rõ ràng
                    console.log("Đang gọi API orders...");
                    const ordersResponse = await axiosInstance.get('/api/admin/orders', {
                        params: { page: 0, size: 5 },
                        headers: token ? { Authorization: `Bearer ${token}` } : {}
                    });
                    console.log("Kết quả API orders:", ordersResponse.data);

                    // Map dữ liệu API về định dạng mong muốn
                    const formattedOrders = ordersResponse.data.content ? ordersResponse.data.content.map(order => ({
                        id: order.id || order.orderId,
                        orderId: order.id || order.orderId,
                        orderDate: order.createdAt || order.orderDate || new Date(),
                        customerName: order.user?.name || order.userName || 'Khách hàng',
                        totalAmount: order.total || order.totalAmount || 0,
                        status: order.status || 'PENDING'
                    })) : [];

                    setRecentOrders(formattedOrders);
                } catch (err) {
                    console.error('Error fetching recent orders:', err);
                    errorDetails.push(`Orders: ${err.message}`);
                    if (err.response) {
                        console.error('API Response:', err.response.status, err.response.data);
                        errorDetails.push(`Status: ${err.response.status}, Data: "${JSON.stringify(err.response.data)}"`);
                    }
                    // Nếu có lỗi, dùng dữ liệu mẫu
                    const mockDemoOrders = demoOrders.map((order, idx) => ({
                        ...order,
                        id: `demo-order-${idx + 1}`
                    }));
                    setRecentOrders(mockDemoOrders);
                    hasError = true;
                }

                try {
                    // Fetch top products với token rõ ràng
                    console.log("Đang gọi API top products...");
                    const productsResponse = await axiosInstance.get('/api/products/top-selling', {
                        headers: token ? { Authorization: `Bearer ${token}` } : {}
                    });
                    console.log("Kết quả API top products:", productsResponse.data);

                    // Đảm bảo dữ liệu có định dạng nhất quán
                    const formattedProducts = productsResponse.data.map(product => ({
                        id: product.id,
                        title: product.title,
                        author: product.author || 'Tác giả',
                        price: product.price || 0,
                        soldCount: product.soldCount || 0
                    }));

                    setTopProducts(formattedProducts);
                } catch (err) {
                    console.error('Error fetching top products:', err);
                    errorDetails.push(`Top products: ${err.message}`);
                    if (err.response) {
                        console.error('API Response:', err.response.status, err.response.data);
                        errorDetails.push(`Status: ${err.response.status}, Data: "${JSON.stringify(err.response.data)}"`);
                    }
                    // Nếu có lỗi, dùng dữ liệu mẫu
                    setTopProducts(demoProducts);
                    hasError = true;
                }

                if (hasError) {
                    setError(`⚠️ ĐANG HIỂN THỊ DỮ LIỆU MẪU: Không thể tải dữ liệu thực từ server. Lỗi: ${errorDetails.join(' | ')}`);
                } else {
                    setError(null);
                }

                setLoading(false);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                setError(`⚠️ ĐANG HIỂN THỊ DỮ LIỆU MẪU: Lỗi chung khi tải dữ liệu: ${error.message}`);
                setStats(demoStats);
                setRecentOrders(demoOrders.map((order, idx) => ({ ...order, id: `demo-order-${idx + 1}` })));
                setTopProducts(demoProducts);
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('vi-VN', options);
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

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full py-24">
                <div className="text-center">
                    <FiLoader size={40} className="animate-spin text-orange-500 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 text-white p-4 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold flex items-center">
                    <FiActivity className="mr-2" /> Bảng điều khiển
                </h1>
                <span className="text-sm text-white/90">Chào mừng đến với trang quản trị</span>
            </div>

            {error && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 mb-4 rounded-md">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <FiAlertCircle className="h-5 w-5 text-yellow-400" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-yellow-700 dark:text-yellow-300">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardCard
                    title="Tổng đơn hàng"
                    value={stats.totalOrders}
                    color="bg-orange-100"
                    darkColor="bg-orange-900/30"
                    iconComponent={<FiShoppingBag className="text-orange-600 dark:text-orange-400" />}
                />
                <DashboardCard
                    title="Tổng sản phẩm"
                    value={stats.totalProducts}
                    color="bg-green-100"
                    darkColor="bg-green-900/30"
                    iconComponent={<FiPackage className="text-green-600 dark:text-green-400" />}
                />
                <DashboardCard
                    title="Tổng người dùng"
                    value={stats.totalUsers}
                    color="bg-blue-100"
                    darkColor="bg-blue-900/30"
                    iconComponent={<FiUsers className="text-blue-600 dark:text-blue-400" />}
                />
                <DashboardCard
                    title="Tổng doanh thu"
                    value={formatCurrency(stats.totalRevenue)}
                    color="bg-purple-100"
                    darkColor="bg-purple-900/30"
                    iconComponent={<FiDollarSign className="text-purple-600 dark:text-purple-400" />}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                            <FiShoppingBag className="mr-2 text-orange-500" /> Đơn hàng gần đây
                        </h2>
                        <Link href="/admin/orders" className="text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300">
                            Xem tất cả
                        </Link>
                    </div>

                    {recentOrders && recentOrders.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Mã
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Ngày
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Tổng tiền
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Trạng thái
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {recentOrders.map((order) => (
                                        <tr key={order.id || order.orderId || `order-${Math.random()}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <Link href={`/admin/orders/${order.id || order.orderId}`} className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 font-medium">
                                                    #{order.id || order.orderId}
                                                </Link>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-gray-600 dark:text-gray-300 text-sm">
                                                {formatDate(order.orderDate)}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-gray-600 dark:text-gray-300 text-sm">
                                                {formatCurrency(order.totalAmount)}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs rounded-full inline-flex items-center ${getStatusColor(order.status)}`}>
                                                    {getStatusTranslation(order.status)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500 dark:text-gray-400">Chưa có đơn hàng nào</p>
                        </div>
                    )}
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                            <FiTrendingUp className="mr-2 text-orange-500" /> Sản phẩm bán chạy
                        </h2>
                        <Link href="/admin/products" className="text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300">
                            Xem tất cả
                        </Link>
                    </div>

                    {topProducts && topProducts.length > 0 ? (
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {topProducts.map((product, index) => (
                                <div key={product.id} className="py-3 flex items-center space-x-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${index < 3 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <Link href={`/admin/products/edit/${product.id}`} className="text-gray-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 font-medium truncate">
                                            {product.title}
                                        </Link>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                            {product.author}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-gray-900 dark:text-white font-medium">
                                            {formatCurrency(product.price)}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-end">
                                            <FiStar className="text-yellow-400 mr-1" /> {product.soldCount || 0} đã bán
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500 dark:text-gray-400">Chưa có dữ liệu sản phẩm bán chạy</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 
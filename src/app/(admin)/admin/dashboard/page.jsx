'use client';

import { useEffect, useState } from 'react';
import axiosInstance from '@/lib/axiosInstance';
import DashboardCard from '@/components/layout/DashboardCard';
import { FiShoppingBag, FiPackage, FiUsers, FiDollarSign, FiActivity, FiStar, FiTrendingUp, FiAlertCircle, FiLoader, FiMessageCircle } from 'react-icons/fi';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import BrandSpinner from '@/components/ui/BrandSpinner';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalProducts: 0,
        totalUsers: 0,
        totalRevenue: 0,
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [recentChats, setRecentChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [recalculating, setRecalculating] = useState(false);

    // Trong TH chưa có dữ liệu từ server, sẽ sử dụng dữ liệu mẫu này
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
                // Fetch recent orders với token 
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
                // Fetch top products với token rõ ràng - sử dụng admin endpoint
                console.log("Đang gọi API admin top products...");
                const productsResponse = await axiosInstance.get('/api/admin/dashboard/top-products', {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                });
                console.log("Kết quả API admin top products:", productsResponse.data);                    // Đảm bảo dữ liệu có định dạng nhất quán
                const formattedProducts = productsResponse.data.map(product => ({
                    productId: product.productId,
                    title: product.title,
                    author: product.author || 'Tác giả',
                    currentPrice: product.currentPrice || 0,
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

            try {
                // Fetch recent chats với token rõ ràng
                console.log("Đang gọi API recent chats...");
                const chatsResponse = await axiosInstance.get('/api/chat/admin/conversations', {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                });
                console.log("Kết quả API recent chats:", chatsResponse.data);

                // Format chat data and get only the 5 most recent
                const formattedChats = chatsResponse.data
                    .sort((a, b) => new Date(b.lastMessageTimestamp || b.updatedAt) - new Date(a.lastMessageTimestamp || a.updatedAt))
                    .slice(0, 5)
                    .map(chat => ({
                        id: chat.id,
                        userName: chat.customerName || chat.user?.name || 'Người dùng',
                        userAvatar: chat.customerAvatar || '/default-avatar.png',
                        lastMessage: chat.lastMessageContent || 'Không có tin nhắn',
                        timestamp: chat.lastMessageTimestamp || chat.updatedAt || new Date(),
                        isRead: chat.unreadCountAdmin === 0,
                        isOnline: chat.isCustomerOnline || false
                    }));

                setRecentChats(formattedChats);
            } catch (err) {
                console.error('Error fetching recent chats:', err);
                errorDetails.push(`Recent chats: ${err.message}`);
                if (err.response) {
                    console.error('API Response:', err.response.status, err.response.data);
                    errorDetails.push(`Status: ${err.response.status}, Data: "${JSON.stringify(err.response.data)}"`);
                }
                // Nếu có lỗi, để trống danh sách chat
                setRecentChats([]);
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
            setRecentChats([]);
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('vi-VN', options);
    };

    const formatChatTime = (timestamp) => {
        const now = new Date();
        const chatTime = new Date(timestamp);
        const diffInMinutes = Math.floor((now - chatTime) / (1000 * 60));

        if (diffInMinutes < 1) return 'Vừa xong';
        if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} giờ trước`;

        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays} ngày trước`;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING_PAYMENT':
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
            case 'PAID':
                return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
            case 'PROCESSING':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
            case 'SHIPPED':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
            case 'DELIVERED':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            case 'CANCELLED':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
            case 'PAYMENT_FAILED':
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
            case 'PAID':
                return 'Đã thanh toán';
            case 'PROCESSING':
                return 'Đang xử lý';
            case 'SHIPPED':
                return 'Đã gửi hàng';
            case 'DELIVERED':
                return 'Đã giao hàng';
            case 'CANCELLED':
                return 'Đã hủy';
            case 'PAYMENT_FAILED':
                return 'Thanh toán thất bại';
            default:
                return status;
        }
    };

    const handleRecalculateSoldCount = async () => {
        try {
            setRecalculating(true);
            const response = await axiosInstance.post('/api/admin/dashboard/recalculate-sold-count');
            console.log('Recalculate response:', response.data);

            // Refresh the dashboard data after recalculation
            fetchDashboardData();

            alert('Đã cập nhật thành công số lượng bán cho tất cả sản phẩm!');
        } catch (error) {
            console.error('Error recalculating sold count:', error);
            alert('Có lỗi xảy ra khi cập nhật số lượng bán. Vui lòng thử lại.');
        } finally {
            setRecalculating(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full py-24">
                <div className="text-center">
                    <BrandSpinner size="lg" className="mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 text-white p-4 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold flex items-center">
                    <FiActivity className="mr-2" /> Trang chủ
                </h1>
                
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
                />
                <DashboardCard
                    title="Tổng sản phẩm"
                    value={stats.totalProducts}
                    color="bg-green-100"
                    darkColor="bg-green-900/30"
                />
                <DashboardCard
                    title="Tổng người dùng"
                    value={stats.totalUsers}
                    color="bg-blue-100"
                    darkColor="bg-blue-900/30"
                />
                <DashboardCard
                    title="Tổng doanh thu"
                    value={formatCurrency(stats.totalRevenue)}
                    color="bg-purple-100"
                    darkColor="bg-purple-900/30"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
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
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Mã đơn hàng
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Ngày đặt
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Tổng tiền
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-32">
                                            Trạng thái
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {recentOrders.map((order) => (
                                        <tr key={order.id || order.orderId || `order-${Math.random()}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Link
                                                    href={`/admin/orders/${order.id || order.orderId}`}
                                                    className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 font-medium"
                                                    title={order.id || order.orderId}
                                                >
                                                    {String(order.id || order.orderId).substring(0, 6)}...
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300 text-sm">
                                                {formatDate(order.orderDate)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300 text-sm">
                                                {formatCurrency(order.totalAmount)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 text-xs rounded-full inline-flex items-center whitespace-nowrap ${getStatusColor(order.status)}`}>
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

                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                            <FiMessageCircle className="mr-2 text-orange-500" /> Chat gần đây
                        </h2>
                        <Link href="/admin/chat" className="text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300">
                            Xem tất cả
                        </Link>
                    </div>

                    {recentChats && recentChats.length > 0 ? (
                        <div className="space-y-4">
                            {recentChats.map((chat) => (
                                <Link
                                    key={chat.id}
                                    href={`/admin/chat?conversation=${chat.id}`}
                                    className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-100 dark:border-gray-600 hover:border-orange-200 dark:hover:border-orange-700"
                                >
                                    <div className="relative flex-shrink-0">
                                        <div className="w-12 h-12 rounded-full overflow-hidden">
                                            <img
                                                src={chat.userAvatar}
                                                alt={chat.userName}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.src = '/default-avatar.png';
                                                }}
                                            />
                                        </div>
                                        {chat.isOnline && (
                                            <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-white dark:ring-gray-800"></span>
                                        )}
                                        {!chat.isRead && (
                                            <span className="absolute -top-1 -right-1 block h-4 w-4 rounded-full bg-orange-500 ring-2 ring-white dark:ring-gray-800"></span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className={`text-sm font-medium truncate ${!chat.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                                                {chat.userName}
                                            </p>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                                                {formatChatTime(chat.timestamp)}
                                            </span>
                                        </div>
                                        <p className={`text-sm truncate ${!chat.isRead ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}>
                                            {chat.lastMessage}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <FiMessageCircle className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">Chưa có tin nhắn nào</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Top Products Section - Moved Below */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                        <FiTrendingUp className="mr-2 text-orange-500" /> Sản phẩm bán chạy
                    </h2>
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={handleRecalculateSoldCount}
                            disabled={recalculating}
                            className="px-3 py-1.5 text-xs bg-orange-100 hover:bg-orange-200 dark:bg-orange-900/30 dark:hover:bg-orange-900/50 text-orange-700 dark:text-orange-300 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            {recalculating ? (
                                <>
                                    <FiLoader className="animate-spin mr-1" />
                                    Đang cập nhật...
                                </>
                            ) : (
                                <>
                                    <FiActivity className="mr-1" />
                                    Cập nhật số liệu
                                </>
                            )}
                        </button>
                        <Link href="/admin/products" className="text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300">
                            Xem tất cả
                        </Link>
                    </div>
                </div>

                {topProducts && topProducts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                        {topProducts.map((product, index) => (
                            <div key={product.productId} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow">
                                <div className="flex items-center space-x-3 mb-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${index < 3 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <Link href={`/admin/products/edit/${product.productId}`} className="text-gray-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 font-medium truncate block">
                                            {product.title}
                                        </Link>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate mb-2">
                                    {product.author}
                                </p>
                                <div className="flex items-center justify-between">
                                    <p className="text-gray-900 dark:text-white font-medium">
                                        {formatCurrency(product.currentPrice)}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                                        <FiStar className="text-yellow-400 mr-1" /> {product.soldCount || 0}
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
    );
}
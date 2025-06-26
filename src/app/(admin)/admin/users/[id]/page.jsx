'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axiosInstance';
import { use } from 'react';
import { FiUser, FiMail, FiCalendar, FiLoader, FiArrowLeft, FiShoppingBag, FiEye, FiTag } from 'react-icons/fi';
import { PiMoneyWavyLight } from 'react-icons/pi';
import Image from 'next/image';
import Link from 'next/link';
import UserAvatar from '@/components/ui/UserAvatar';

export default function UserDetail({ params }) {
    const unwrappedParams = use(params);
    const userId = unwrappedParams.id;
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [avatarError, setAvatarError] = useState(false);

    // Order history states
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [ordersError, setOrdersError] = useState(null);
    const [currentOrderPage, setCurrentOrderPage] = useState(0);
    const [totalOrderPages, setTotalOrderPages] = useState(0);

    const fetchUserDetails = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`admin/users/${userId}`);
            setUser(response.data);
        } catch (err) {
            console.error('Error fetching user details:', err);
            setError('Không thể tải thông tin người dùng. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const fetchUserOrders = async (page = 0) => {
        try {
            setOrdersLoading(true);
            // Using the general orders endpoint instead of a user-specific one
            const response = await axiosInstance.get('/api/admin/orders', {
                params: {
                    page,
                    size: 10
                }
            });

            if (response.data && response.data.content) {
                // Filter orders by user ID on the client side
                const userOrders = response.data.content.filter(order =>
                    order.userId === userId ||
                    String(order.userId) === String(userId)
                );

                setOrders(userOrders);

                // For now, we'll just disable pagination for user orders since we're filtering client-side
                setTotalOrderPages(1);
                setCurrentOrderPage(0);

                // Log for debugging
                console.log(`Found ${userOrders.length} orders for user ID ${userId}`);
            } else {
                setOrders([]);
                setTotalOrderPages(1);
                setCurrentOrderPage(0);
            }
        } catch (err) {
            console.error('Error fetching user orders:', err);
            setOrdersError('Không thể tải lịch sử đơn hàng. Vui lòng thử lại.');
        } finally {
            setOrdersLoading(false);
        }
    };

    useEffect(() => {
        fetchUserDetails();
        fetchUserOrders(0);
    }, [userId]);

    const toggleUserStatus = async () => {
        try {
            setUpdatingStatus(true);
            await axiosInstance.put(`/admin/users/${userId}/status`, {
                enabled: !user.enabled
            });

            // Refresh user data
            fetchUserDetails();
            alert(`Người dùng đã được ${!user.enabled ? 'kích hoạt' : 'vô hiệu hóa'} thành công`);
        } catch (err) {
            console.error('Error updating user status:', err);
            alert('Không thể cập nhật trạng thái người dùng. Vui lòng thử lại.');
        } finally {
            setUpdatingStatus(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('vi-VN', options);
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
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

    const getRoleBadgeClass = (roleName) => {
        switch (roleName) {
            case 'ROLE_ADMIN':
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
            case 'ROLE_CUSTOMER':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    const getRoleTranslation = (roleName) => {
        switch (roleName) {
            case 'ROLE_ADMIN':
                return 'Quản trị viên';
            case 'ROLE_CUSTOMER':
                return 'Khách hàng';
            default:
                return roleName.replace('ROLE_', '');
        }
    };

    // Hàm kiểm tra và định dạng URL của avatar
    const getProfileImageUrl = () => {
        // Kiểm tra tất cả các trường có thể chứa URL avatar
        const avatarUrl = user?.avatarUrl || user?.avatar || user?.profileImage || user?.imageUrl;

        if (avatarUrl) {
            // Kiểm tra nếu avatarUrl đã là URL đầy đủ
            if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
                return avatarUrl;
            }

            // Nếu là đường dẫn tương đối hoặc API path, thêm URL gốc
            if (avatarUrl.startsWith('/api/')) {
                return `http://localhost:8080${avatarUrl}`;
            }

            return avatarUrl;
        }

        // Trả về ảnh mặc định nếu không có avatar
        return '/default-avatar.png';
    };    // Render user avatar
    const renderUserAvatar = () => {
        return (
            <UserAvatar
                name={user?.name || 'User'}
                avatarUrl={!avatarError ? getProfileImageUrl() : null}
                size="xl"
                className="w-20 h-20"
            />
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full py-24">
                <div className="text-center">
                    <FiLoader size={40} className="animate-spin text-orange-500 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Đang tải thông tin người dùng...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                    onClick={() => router.push('/admin/users')}
                    className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 flex items-center"
                >
                    <FiArrowLeft className="mr-2" /> Quay lại danh sách người dùng
                </button>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <p className="text-gray-600 dark:text-gray-400 mb-4">Không tìm thấy người dùng</p>
                <button
                    onClick={() => router.push('/admin/users')}
                    className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 flex items-center"
                >
                    <FiArrowLeft className="mr-2" /> Quay lại danh sách người dùng
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Thông tin người dùng</h1>
                <button
                    onClick={() => router.push('/admin/users')}
                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 flex items-center"
                >
                    <FiArrowLeft className="mr-2" /> Quay lại danh sách người dùng
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* User Profile */}
                <div className="md:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <div className="flex items-start space-x-4 mb-6">
                        {renderUserAvatar()}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{user.name}</h2>
                            <p className="text-gray-600 dark:text-gray-400 flex items-center">
                                <FiMail className="mr-1" /> {user.email}
                            </p>
                            <div className="flex mt-2 space-x-2">
                                {user.roles?.map((role) => (
                                    <span
                                        key={role}
                                        className={`px-2 py-1 text-xs rounded-full ${getRoleBadgeClass(role)}`}
                                    >
                                        {getRoleTranslation(role)}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">ID người dùng</p>
                            <p className="font-medium text-gray-900 dark:text-white">{user.id}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Trạng thái</p>
                            <p className="font-medium">
                                <span
                                    className={`px-2 py-1 text-xs rounded-full ${user.enabled ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                        }`}
                                >
                                    {user.enabled ? 'Đang hoạt động' : 'Đã vô hiệu hóa'}
                                </span>
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Ngày tạo</p>
                            <p className="font-medium text-gray-900 dark:text-white flex items-center">
                                <FiCalendar className="mr-1 text-gray-400" /> {formatDate(user.createdAt)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Cập nhật lần cuối</p>
                            <p className="font-medium text-gray-900 dark:text-white flex items-center">
                                <FiCalendar className="mr-1 text-gray-400" /> {formatDate(user.updatedAt)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* User Actions */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Thao tác người dùng</h2>
                    <div className="space-y-4">
                        <button
                            onClick={toggleUserStatus}
                            disabled={updatingStatus}
                            className={`w-full px-4 py-2 rounded-md ${user.enabled
                                ? 'bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800'
                                : 'bg-green-600 text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800'
                                } ${updatingStatus ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {updatingStatus
                                ? 'Đang cập nhật...'
                                : user.enabled
                                    ? 'Vô hiệu hóa người dùng'
                                    : 'Kích hoạt người dùng'}
                        </button>
                    </div>
                </div>
            </div>

            {/* User Order History */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <FiShoppingBag className="mr-2 text-orange-500 dark:text-orange-400" /> Lịch sử đơn hàng
                </h2>

                {ordersLoading ? (
                    <div className="text-center py-4 text-gray-600 dark:text-gray-400 flex justify-center items-center">
                        <FiLoader className="animate-spin mr-2" />
                        Đang tải lịch sử đơn hàng...
                    </div>
                ) : ordersError ? (
                    <div className="text-center py-4 text-red-600 dark:text-red-400">{ordersError}</div>
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
                                    {orders.length > 0 ? (
                                        orders.map((order) => (
                                            <tr key={order.orderId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-200 font-medium">#{order.orderId}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-200">
                                                    <div className="flex items-center">
                                                        <FiCalendar className="mr-1 text-gray-500 dark:text-gray-400" />
                                                        {formatDateTime(order.orderDate)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-200">
                                                    <div className="flex items-center">
                                                        <PiMoneyWavyLight className="mr-1 text-gray-500 dark:text-gray-400" />
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
                                            <td colSpan="5" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                                Không tìm thấy đơn hàng nào của người dùng này
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {orders.length > 0 && (
                            <div className="text-center mt-4 text-sm text-gray-500 dark:text-gray-400">
                                Hiển thị tất cả {orders.length} đơn hàng của người dùng này
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
} 
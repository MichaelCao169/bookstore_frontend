'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { FiHome, FiBook, FiFolder, FiPackage, FiUsers, FiLogOut, FiTool } from 'react-icons/fi';
import axiosInstance from '@/lib/axiosInstance';
import { toast } from 'react-toastify';

const navItems = [
    { name: 'Trang chủ Admin', href: '/admin/dashboard', icon: <FiHome className="w-5 h-5" /> },
    { name: 'Sản phẩm', href: '/admin/products', icon: <FiBook className="w-5 h-5" /> },
    { name: 'Danh mục', href: '/admin/categories', icon: <FiFolder className="w-5 h-5" /> },
    { name: 'Đơn hàng', href: '/admin/orders', icon: <FiPackage className="w-5 h-5" /> },
    { name: 'Người dùng', href: '/admin/users', icon: <FiUsers className="w-5 h-5" /> },
    { name: 'Kiểm tra API', href: '/admin/dashboard/debug', icon: <FiTool className="w-5 h-5" /> },
];

export default function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuthStore();

    const handleLogout = async () => {
        try {
            // Gọi API logout để vô hiệu hóa refresh token ở phía server
            await axiosInstance.post('/auth/logout');

            // Cập nhật trạng thái trong store
            logout();

            // Hiển thị thông báo
            toast.success('Đăng xuất thành công!');

            // Chuyển hướng đến trang đăng nhập
            router.push('/login');
        } catch (error) {
            console.error('Logout error:', error);

            // Vẫn thực hiện logout phía client nếu API thất bại
        logout();

            // Hiển thị thông báo lỗi
            toast.warning('Đã có lỗi xảy ra, nhưng bạn đã được đăng xuất khỏi phiên này.');

            // Chuyển hướng đến trang đăng nhập
            router.push('/login');
        }
    };

    return (
        <div className="w-64 bg-white dark:bg-gray-800 shadow-md dark:shadow-gray-700/30 flex flex-col h-full border-r border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-xl font-bold text-orange-600 dark:text-orange-500 flex items-center">
                    📚 BookStore Admin
                </h1>
            </div>

            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold">
                        {user?.name?.charAt(0) || 'A'}
                    </div>
                    <div>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{user?.name || 'Admin'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email || 'admin@example.com'}</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center space-x-3 px-4 py-2.5 rounded-md transition-colors ${isActive
                                ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 font-medium'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                                }`}
                        >
                            <span className={isActive ? 'text-orange-500' : 'text-gray-500 dark:text-gray-400'}>
                                {item.icon}
                            </span>
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 px-4 py-2.5 w-full text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                >
                    <FiLogOut className="w-5 h-5" />
                    <span>Đăng xuất</span>
                </button>
            </div>
        </div>
    );
} 
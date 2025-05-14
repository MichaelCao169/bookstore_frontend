'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axiosInstance from '@/lib/axiosInstance';
import { FiUsers, FiSearch, FiEdit, FiEye, FiCheck, FiX, FiLoader } from 'react-icons/fi';

export default function UsersManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [updatingUserId, setUpdatingUserId] = useState(null);

    const fetchUsers = async (page = 0, keyword = '') => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/admin/users', {
                params: {
                    page,
                    size: 10,
                    keyword,
                },
            });
            setUsers(response.data.content);
            setTotalPages(response.data.totalPages);
            setCurrentPage(response.data.number);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Không thể tải danh sách người dùng. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers(currentPage, searchTerm);
    }, [currentPage]);

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(0);
        fetchUsers(0, searchTerm);
    };

    const toggleUserStatus = async (userId, currentStatus) => {
        try {
            setUpdatingUserId(userId);
            await axiosInstance.put(`/admin/users/${userId}/status`, {
                enabled: !currentStatus
            });

            // Refresh users list
            fetchUsers(currentPage, searchTerm);

            alert(`Người dùng đã được ${!currentStatus ? 'kích hoạt' : 'vô hiệu hóa'} thành công`);
        } catch (err) {
            console.error('Error updating user status:', err);
            alert('Không thể cập nhật trạng thái người dùng. Vui lòng thử lại.');
        } finally {
            setUpdatingUserId(null);
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

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 text-white p-4 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold flex items-center">
                    <FiUsers className="mr-2" /> Quản lý người dùng
                </h1>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                <form onSubmit={handleSearch} className="flex mb-6">
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên hoặc email..."
                        className="flex-1 px-4 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 bg-orange-600 text-white rounded-r-md hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 flex items-center"
                    >
                        <FiSearch className="mr-1" /> Tìm kiếm
                    </button>
                </form>

                {loading ? (
                    <div className="text-center py-4 text-gray-600 dark:text-gray-400 flex justify-center items-center">
                        <FiLoader className="animate-spin mr-2" />
                        Đang tải người dùng...
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
                                            ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Tên
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Vai trò
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
                                    {users.length > 0 ? (
                                        users.map((user) => (
                                            <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-200">{user.id}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-200">{user.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-200">{user.email}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-wrap gap-1">
                                                        {user.roles?.map((role) => (
                                                            <span
                                                                key={role}
                                                                className={`px-2 py-1 text-xs rounded-full ${getRoleBadgeClass(role)}`}
                                                            >
                                                                {role.replace('ROLE_', '') === 'ADMIN' ? 'Quản trị viên' : 'Khách hàng'}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`px-2 py-1 text-xs rounded-full ${user.enabled
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                            }`}
                                                    >
                                                        {user.enabled ? 'Đang hoạt động' : 'Đã vô hiệu hóa'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => toggleUserStatus(user.id, user.enabled)}
                                                            disabled={updatingUserId === user.id}
                                                            title={user.enabled ? 'Vô hiệu hóa người dùng' : 'Kích hoạt người dùng'}
                                                            className={`w-9 h-9 flex items-center justify-center rounded-full ${user.enabled
                                                                ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30'
                                                                : 'bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30'
                                                                } ${updatingUserId === user.id ? 'opacity-50 cursor-not-allowed' : ''} relative group`}
                                                        >
                                                            {updatingUserId === user.id ? (
                                                                <FiLoader className="animate-spin" />
                                                            ) : user.enabled ? (
                                                                <FiX />
                                                            ) : (
                                                                <FiCheck />
                                                            )}
                                                            <span className="absolute z-10 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs rounded py-1 px-2 bottom-full -mb-1 left-1/2 transform -translate-x-1/2 w-max pointer-events-none">
                                                                {user.enabled ? 'Vô hiệu hóa người dùng' : 'Kích hoạt người dùng'}
                                                                <svg className="absolute text-gray-800 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255">
                                                                    <polygon className="fill-current" points="0,0 127.5,127.5 255,0" />
                                                                </svg>
                                                            </span>
                                                        </button>
                                                        <Link
                                                            href={`/admin/users/${user.id}`}
                                                            title="Xem chi tiết người dùng"
                                                            className="w-9 h-9 flex items-center justify-center rounded-full bg-orange-50 text-orange-600 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:hover:bg-orange-900/30 relative group"
                                                        >
                                                            <FiEye />
                                                            <span className="absolute z-10 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs rounded py-1 px-2 bottom-full -mb-1 left-1/2 transform -translate-x-1/2 w-max pointer-events-none">
                                                                Xem chi tiết người dùng
                                                                <svg className="absolute text-gray-800 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255">
                                                                    <polygon className="fill-current" points="0,0 127.5,127.5 255,0" />
                                                                </svg>
                                                            </span>
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                                Không tìm thấy người dùng nào
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {totalPages > 1 && (
                            <div className="flex justify-center mt-6">
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                                        disabled={currentPage === 0}
                                        className={`px-3 py-1 rounded ${currentPage === 0
                                            ? 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                                            : 'bg-orange-100 text-orange-600 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:hover:bg-orange-800/40'
                                            }`}
                                    >
                                        Trang trước
                                    </button>
                                    {Array.from({ length: totalPages }, (_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentPage(i)}
                                            className={`px-3 py-1 rounded ${currentPage === i
                                                ? 'bg-orange-600 text-white dark:bg-orange-500'
                                                : 'bg-orange-100 text-orange-600 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:hover:bg-orange-800/40'
                                                }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                                        disabled={currentPage === totalPages - 1}
                                        className={`px-3 py-1 rounded ${currentPage === totalPages - 1
                                            ? 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                                            : 'bg-orange-100 text-orange-600 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:hover:bg-orange-800/40'
                                            }`}
                                    >
                                        Trang tiếp
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
} 
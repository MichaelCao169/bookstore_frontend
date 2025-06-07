'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axiosInstance from '@/lib/axiosInstance';
import { FiPlusCircle, FiSearch, FiEdit2, FiTrash2, FiLoader, FiInfo } from 'react-icons/fi';
import { formatCurrency } from '@/components/order/OrderHelpers';
import BrandSpinner from '@/components/ui/BrandSpinner';

// Hàm rút gọn UUID để hiển thị
const truncateUUID = (uuid, visibleChars = 8) => {
    if (!uuid) return '';
    // Hiển thị 8 ký tự đầu và dấu ...
    return `${uuid.substring(0, visibleChars)}...`;
};

export default function ProductsManagement() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchProducts = async (page = 0, keyword = '') => {
        try {
            setLoading(true);
            console.log('Fetching products...');
            // Sửa đường dẫn API thêm prefix /api/
            const response = await axiosInstance.get('/api/products', {
                params: {
                    page,
                    size: 10,
                    keyword,
                },
            });
            console.log('Products response:', response.data);

            // Kiểm tra định dạng phản hồi
            if (response.data && response.data.content) {
                setProducts(response.data.content);
                setTotalPages(response.data.totalPages || 1);
                setCurrentPage(response.data.number || 0);
            } else {
                // Nếu phản hồi là mảng thay vì đối tượng phân trang
                setProducts(Array.isArray(response.data) ? response.data : []);
                setTotalPages(1);
                setCurrentPage(0);
            }
        } catch (err) {
            console.error('Error fetching products:', err);
            setError('Không thể tải danh sách sản phẩm. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts(currentPage, searchTerm);
    }, [currentPage, searchTerm]);

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(0);
        fetchProducts(0, searchTerm);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
            return;
        }

        try {
            // Sửa đường dẫn API thêm prefix /api/
            await axiosInstance.delete(`/api/products/admin/${id}`);
            // Refresh products list
            fetchProducts(currentPage, searchTerm);
            alert('Đã xóa sản phẩm thành công');
        } catch (err) {
            console.error('Error deleting product:', err);
            alert('Không thể xóa sản phẩm. Vui lòng thử lại.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Quản lý Sản phẩm</h1>
                <Link
                    href="/admin/products/new"
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md flex items-center transition-colors dark:bg-orange-500 dark:hover:bg-orange-600"
                >
                    <FiPlusCircle className="mr-1" /> Thêm sản phẩm mới
                </Link>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                <form onSubmit={handleSearch} className="flex mb-6">
                    <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm..."
                        className="flex-1 px-4 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-orange-500 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 bg-orange-600 text-white rounded-r-md hover:bg-orange-700 flex items-center dark:bg-orange-500 dark:hover:bg-orange-600"
                    >
                        <FiSearch className="mr-1" /> Tìm
                    </button>
                </form>

                {loading ? (
                    <div className="text-center py-4 text-gray-600 dark:text-gray-300 flex justify-center items-center">
                        <BrandSpinner size="sm" className="mr-2" /> Đang tải sản phẩm...
                    </div>
                ) : error ? (
                    <div className="text-center py-4 text-red-600 dark:text-red-400">{error}</div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Tên sản phẩm
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Giá tiền
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Tồn kho
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Danh mục
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Thao tác
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {products.length > 0 ? (products.map((product) => (
                                        <tr key={product.productId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">
                                                <div className="flex items-center">
                                                    <span className="font-mono">{truncateUUID(product.productId)}</span>
                                                    <span className="group relative ml-1 cursor-pointer">
                                                        <FiInfo className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" size={16} />
                                                        <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 w-64 shadow-lg z-10">
                                                            <div className="font-mono break-all">{product.productId}</div>
                                                            <div className="absolute w-2 h-2 bg-gray-800 transform rotate-45 left-2 -bottom-1"></div>
                                                        </div>
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{product.title}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{formatCurrency(product.currentPrice, 'VND', 'vi-VN')}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{product.quantity}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">
                                                {product.categories && product.categories.length > 0
                                                    ? product.categories.map(cat => cat.name).join(', ')
                                                    : product.category?.name || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap space-x-2">
                                                <Link
                                                    href={`/admin/products/edit/${product.productId}`}
                                                    className="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300 inline-flex items-center"
                                                >
                                                    <FiEdit2 className="mr-1" /> Sửa
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(product.productId)}
                                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 inline-flex items-center ml-3"
                                                >
                                                    <FiTrash2 className="mr-1" /> Xóa
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                                Không tìm thấy sản phẩm nào
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
                                        className={`px-3 py-1 rounded flex items-center ${currentPage === 0
                                            ? 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                                            : 'bg-orange-100 text-orange-600 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:hover:bg-orange-900/50'
                                            }`}
                                    >
                                        Trước
                                    </button>
                                    {Array.from({ length: totalPages }, (_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentPage(i)}
                                            className={`px-3 py-1 rounded ${currentPage === i
                                                ? 'bg-orange-600 text-white dark:bg-orange-500'
                                                : 'bg-orange-100 text-orange-600 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:hover:bg-orange-900/50'
                                                }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                                        disabled={currentPage === totalPages - 1}
                                        className={`px-3 py-1 rounded flex items-center ${currentPage === totalPages - 1
                                            ? 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                                            : 'bg-orange-100 text-orange-600 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:hover:bg-orange-900/50'
                                            }`}
                                    >
                                        Tiếp
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
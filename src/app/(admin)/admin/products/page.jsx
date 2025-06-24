'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axiosInstance from '@/lib/axiosInstance';
import { FiPlusCircle, FiSearch, FiEdit2, FiTrash2, FiLoader, FiChevronLeft, FiChevronRight, FiBook } from 'react-icons/fi';
import BrandSpinner from '@/components/ui/BrandSpinner';

// Hàm rút gọn ID sản phẩm để hiển thị (giống đơn hàng)
const getTruncatedProductId = (productId) => {
    return productId ? productId.substring(0, 6) : '';
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

                // Kiểm tra cấu trúc response mới với nested page object
                if (response.data.page) {
                    setTotalPages(response.data.page.totalPages || 1);
                    setCurrentPage(response.data.page.number || 0);
                } else {
                    // Legacy format
                    setTotalPages(response.data.totalPages || 1);
                    setCurrentPage(response.data.number || 0);
                }
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
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
                                    <FiBook className="mr-2 text-orange-500" /> Quản lý sản phẩm
                </h1>
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
                        <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" style={{ width: '150px' }}>
                                            ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Tên sản phẩm
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" style={{ width: '150px' }}>
                                            Thao tác
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {products.length > 0 ? (products.map((product) => (
                                        <tr key={product.productId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100 font-medium" style={{ width: '150px' }}>
                                                <span
                                                    title={product.productId}
                                                >
                                                    {getTruncatedProductId(product.productId)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-900 dark:text-gray-100">
                                                <div title={product.title}>
                                                    {product.title}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap space-x-2" style={{ width: '150px' }}>
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
                                            <td colSpan="3" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                                Không tìm thấy sản phẩm nào
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

                                    {/* Hiển thị các trang */}
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageIndex;
                                        if (totalPages <= 5) {
                                            pageIndex = i;
                                        } else if (currentPage <= 2) {
                                            pageIndex = i;
                                        } else if (currentPage >= totalPages - 3) {
                                            pageIndex = totalPages - 5 + i;
                                        } else {
                                            pageIndex = currentPage - 2 + i;
                                        }

                                        if (pageIndex < 0 || pageIndex >= totalPages) return null;

                                        return (
                                            <button
                                                key={pageIndex}
                                                onClick={() => setCurrentPage(pageIndex)}
                                                className={`
                                                    flex items-center justify-center w-10 h-10 text-sm font-medium rounded-md transition-all duration-200 ease-in-out
                                                    focus:outline-none focus:ring-2 focus:ring-orange-300 dark:focus:ring-orange-600 focus:ring-opacity-50
                                                    ${currentPage === pageIndex
                                                        ? 'text-white bg-orange-600 dark:bg-orange-500 shadow-md cursor-default ring-2 ring-orange-300 dark:ring-orange-600 ring-opacity-50'
                                                        : 'text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:shadow-sm'
                                                    }
                                                `}
                                                aria-label={`Đi đến trang ${pageIndex + 1}`}
                                            >
                                                {pageIndex + 1}
                                            </button>
                                        );
                                    })}

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
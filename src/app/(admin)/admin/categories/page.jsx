'use client';

import { useState, useEffect } from 'react';
import axiosInstance from '@/lib/axiosInstance';
import { FiFolder, FiEdit2, FiTrash2, FiPlus, FiSave, FiX, FiLoader, FiAlertCircle, FiInfo } from 'react-icons/fi';
import BrandSpinner from '@/components/ui/BrandSpinner';

export default function CategoriesManagement() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [editingCategoryId, setEditingCategoryId] = useState(null);
    const [formErrors, setFormErrors] = useState({});
    const [formSubmitting, setFormSubmitting] = useState(false);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('categories');
            setCategories(response.data);
        } catch (err) {
            console.error('Error fetching categories:', err);
            setError('Không thể tải danh mục. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Clear error for this field when user starts typing
        if (formErrors[name]) {
            setFormErrors({ ...formErrors, [name]: null });
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.name) errors.name = 'Vui lòng nhập tên danh mục';
        if (!formData.description) errors.description = 'Vui lòng nhập mô tả danh mục';

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setFormSubmitting(true);

        try {
            if (editingCategoryId) {
                // Update existing category
                await axiosInstance.put(`/admin/categories/${editingCategoryId}`, formData);
                alert('Cập nhật danh mục thành công');
            } else {
                // Create new category
                await axiosInstance.post('/admin/categories', formData);
                alert('Tạo danh mục thành công');
            }

            // Reset form and refresh categories
            setFormData({ name: '', description: '' });
            setEditingCategoryId(null);
            fetchCategories();
        } catch (err) {
            console.error('Error saving category:', err);
            alert(`Không thể ${editingCategoryId ? 'cập nhật' : 'tạo'} danh mục. Vui lòng thử lại.`);
        } finally {
            setFormSubmitting(false);
        }
    };

    const handleEdit = (category) => {
        setFormData({
            name: category.name,
            description: category.description,
        });
        setEditingCategoryId(category.id);
    };

    const handleCancelEdit = () => {
        setFormData({ name: '', description: '' });
        setEditingCategoryId(null);
        setFormErrors({});
    };

    const handleDelete = async (categoryId) => {
        if (!confirm('Bạn có chắc chắn muốn xóa danh mục này? Thao tác này không thể hoàn tác.')) {
            return;
        }

        try {
            await axiosInstance.delete(`/admin/categories/${categoryId}`);
            alert('Xóa danh mục thành công');
            fetchCategories();
        } catch (err) {
            console.error('Error deleting category:', err);
            alert('Không thể xóa danh mục. Vui lòng thử lại.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
                    <FiFolder className="mr-2 text-orange-500" /> Quản lý Danh mục
                </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Categories List */}
                <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center">
                        <FiFolder className="mr-2 text-orange-500" /> Tất cả Danh mục
                    </h2>

                    {loading ? (<div className="text-center py-4 text-gray-600 dark:text-gray-300 flex justify-center items-center">
                        <BrandSpinner size="sm" className="mr-2" /> Đang tải danh mục...
                    </div>
                    ) : error ? (
                        <div className="text-center py-4 text-red-600 dark:text-red-400 flex justify-center items-center">
                            <FiAlertCircle className="mr-2" /> {error}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Tên danh mục
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Mô tả
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Thao tác
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {categories.length > 0 ? (
                                        categories.map((category) => (
                                            <tr key={category.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{category.id}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100 font-medium">{category.name}</td>
                                                <td className="px-6 py-4 text-gray-900 dark:text-gray-100">{category.description}</td>
                                                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                                                    <button
                                                        onClick={() => handleEdit(category)}
                                                        className="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300 inline-flex items-center"
                                                    >
                                                        <FiEdit2 className="mr-1" /> Sửa
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(category.id)}
                                                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 inline-flex items-center ml-3"
                                                    >
                                                        <FiTrash2 className="mr-1" /> Xóa
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                                Không tìm thấy danh mục nào
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Category Form */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center">
                        {editingCategoryId ? (
                            <>
                                <FiEdit2 className="mr-2 text-orange-500" /> Chỉnh sửa Danh mục
                            </>
                        ) : (
                            <>
                                <FiPlus className="mr-2 text-orange-500" /> Thêm Danh mục mới
                            </>
                        )}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                                <FiFolder className="mr-1 text-orange-500 dark:text-orange-400" /> Tên danh mục *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${formErrors.name
                                    ? 'border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400'
                                    : 'border-gray-300 dark:border-gray-600 focus:ring-orange-500 dark:focus:ring-orange-400'
                                    }`}
                                placeholder="Nhập tên danh mục"
                            />
                            {formErrors.name && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                                    <FiAlertCircle className="mr-1" /> {formErrors.name}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                                <FiInfo className="mr-1 text-orange-500 dark:text-orange-400" /> Mô tả *
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows="4"
                                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${formErrors.description
                                    ? 'border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400'
                                    : 'border-gray-300 dark:border-gray-600 focus:ring-orange-500 dark:focus:ring-orange-400'
                                    }`}
                                placeholder="Nhập mô tả danh mục"
                            ></textarea>
                            {formErrors.description && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                                    <FiAlertCircle className="mr-1" /> {formErrors.description}
                                </p>
                            )}
                        </div>

                        <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                            {editingCategoryId && (
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    className="px-4 py-2 flex items-center text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md"
                                    disabled={formSubmitting}
                                >
                                    <FiX className="mr-1" /> Hủy
                                </button>
                            )}
                            <button
                                type="submit"
                                className={`flex-1 px-4 py-2 flex items-center justify-center text-white rounded-md ${formSubmitting
                                    ? 'bg-orange-400 dark:bg-orange-600 cursor-not-allowed'
                                    : 'bg-orange-600 dark:bg-orange-500 hover:bg-orange-700 dark:hover:bg-orange-600'
                                    }`}
                                disabled={formSubmitting}
                            >
                                {formSubmitting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Đang xử lý...
                                    </>
                                ) : editingCategoryId ? (
                                    <>
                                        <FiSave className="mr-1" /> Cập nhật Danh mục
                                    </>
                                ) : (
                                    <>
                                        <FiPlus className="mr-1" /> Tạo Danh mục
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
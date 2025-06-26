'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axiosInstance';
import RichTextEditor from '@/components/ui/RichTextEditor';
import { use } from 'react';
import { FiSave, FiX, FiArrowLeft, FiBookOpen, FiGrid, FiPackage, FiBarChart2, FiLink, FiUser, FiInfo, FiLoader, FiAlertCircle, FiTag, FiPlus, FiImage, FiBookmark, FiFileText } from 'react-icons/fi';
import { PiMoneyWavyLight } from 'react-icons/pi';

export default function EditProduct({ params }) {
    const unwrappedParams = use(params);
    const productId = unwrappedParams.id;
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [loadingProduct, setLoadingProduct] = useState(true);
    const [categories, setCategories] = useState([]); const [formData, setFormData] = useState({
        title: '',
        description: '',
        currentPrice: '',
        originalPrice: '',
        quantity: '',
        coverLink: '',
        author: '',
        publisher: '',
        pages: '',
        categoryId: '',
        categoryIds: [],
    });
    const [errors, setErrors] = useState({});
    const [previewImage, setPreviewImage] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoadingProduct(true);

                // Fetch product details
                const productResponse = await axiosInstance.get(`/api/products/${productId}`);
                const product = productResponse.data;

                // Fetch categories
                const categoriesResponse = await axiosInstance.get('/api/categories');
                setCategories(categoriesResponse.data);                // Set image preview
                setPreviewImage(product.coverLink || '');

                // Set form data from product
                setFormData({
                    title: product.title || '',
                    description: product.description || '',
                    currentPrice: product.currentPrice?.toString() || '',
                    originalPrice: product.originalPrice?.toString() || '',
                    quantity: product.quantity?.toString() || '',
                    coverLink: product.coverLink || '',
                    author: product.author || '',
                    publisher: product.publisher || '',
                    pages: product.pages?.toString() || '',
                    categoryId: product.category?.id?.toString() || '',
                    // Get category IDs from product.categories if it exists
                    categoryIds: product.categories ? product.categories.map(cat => cat.id) :
                        (product.category ? [product.category.id] : []),
                });
            } catch (err) {
                console.error('Error fetching data:', err);
                alert('Không thể tải dữ liệu sản phẩm. Vui lòng thử lại.');
            } finally {
                setLoadingProduct(false);
            }
        };

        fetchData();
    }, [productId]); const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Update image preview if coverLink changes
        if (name === 'coverLink') {
            setPreviewImage(value);
        }

        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors({ ...errors, [name]: null });
        }
    };

    // Handle selection of multiple categories
    const handleCategoryChange = (e) => {
        const selectedId = Number(e.target.value);

        // If user selects default empty option, do nothing
        if (!selectedId) return;

        // Check if the category is already selected
        if (!formData.categoryIds.includes(selectedId)) {
            const newCategoryIds = [...formData.categoryIds, selectedId];
            setFormData({
                ...formData,
                categoryIds: newCategoryIds,
                // Set the first selected category as the primary category if not already set
                categoryId: formData.categoryId || newCategoryIds[0].toString()
            });

            // Clear categories error if selections were made
            if (errors.categoryIds) {
                setErrors({ ...errors, categoryIds: null });
            }
        }

        // Reset dropdown to default value
        e.target.value = '';
    };

    // Remove a selected category
    const removeCategory = (categoryId) => {
        const newCategoryIds = formData.categoryIds.filter(id => id !== categoryId);
        setFormData({
            ...formData,
            categoryIds: newCategoryIds,
            // Update primary category if removed
            categoryId: newCategoryIds.length > 0 ?
                (categoryId.toString() === formData.categoryId ? newCategoryIds[0].toString() : formData.categoryId) :
                ''
        });
    };

    // Get category name from ID
    const getCategoryName = (categoryId) => {
        const category = categories.find(cat => cat.id === categoryId);
        return category ? category.name : '';
    }; const validate = () => {
        const newErrors = {};
        if (!formData.title) newErrors.title = 'Tiêu đề là bắt buộc';

        // Kiểm tra mô tả sản phẩm (rich text HTML content)
        if (!formData.description || formData.description.trim() === '' || formData.description === '<p></p>') {
            newErrors.description = 'Mô tả là bắt buộc';
        }

        if (!formData.currentPrice) newErrors.currentPrice = 'Giá hiện tại là bắt buộc';
        else if (isNaN(formData.currentPrice) || Number(formData.currentPrice) <= 0)
            newErrors.currentPrice = 'Giá hiện tại phải là số dương';
        if (formData.originalPrice && (isNaN(formData.originalPrice) || Number(formData.originalPrice) <= 0))
            newErrors.originalPrice = 'Giá gốc phải là số dương';
        if (!formData.quantity) newErrors.quantity = 'Số lượng tồn kho là bắt buộc';
        else if (isNaN(formData.quantity) || Number(formData.quantity) < 0)
            newErrors.quantity = 'Số lượng tồn kho phải là số không âm';
        if (formData.categoryIds.length === 0) newErrors.categoryIds = 'Vui lòng chọn ít nhất một danh mục';
        if (!formData.author) newErrors.author = 'Tên tác giả là bắt buộc';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }; const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        try {
            setLoading(true);            // Convert string values to numbers where appropriate
            const productData = {
                ...formData,
                currentPrice: Number(formData.currentPrice),
                originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
                quantity: Number(formData.quantity),
                pages: formData.pages ? Number(formData.pages) : null,
                publisher: formData.publisher || '',
                categoryId: Number(formData.categoryId),
                categoryIds: formData.categoryIds,
            };

            console.log('Sending update with data:', productData);
            await axiosInstance.put(`/api/products/admin/${productId}`, productData);

            alert('Cập nhật sản phẩm thành công!');
            router.push('/admin/products');
        } catch (err) {
            console.error('Error updating product:', err);
            if (err.response?.data?.message) {
                alert(`Lỗi: ${err.response.data.message}`);
            } else {
                alert('Không thể cập nhật sản phẩm. Vui lòng thử lại.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header - Updated to match create product styling */}
            <div className="flex items-center justify-between bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 text-white p-4 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold flex items-center">
                    <FiBookOpen className="mr-2" /> Chỉnh sửa sản phẩm
                </h1>
                <div className="flex items-center space-x-2">
                    <span className="text-xs bg-white/20 px-2 py-1 rounded">ID: {productId}</span>
                    <button
                        onClick={() => router.push('/admin/products')}
                        className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-md transition-colors duration-200 flex items-center"
                    >
                        <FiX className="mr-1" /> Hủy
                    </button>
                </div>
            </div>

            {/* Product Edit Form */}
            {loadingProduct ? (
                <div className="flex justify-center items-center h-full py-20">
                    <div className="text-center">
                        <FiLoader size={40} className="animate-spin text-orange-500 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">Đang tải dữ liệu sản phẩm...</p>
                    </div>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                                <FiBookmark className="mr-1 text-orange-500 dark:text-orange-400" /> Tên sản phẩm *
                            </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.title
                                        ? 'border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400'
                                        : 'border-gray-300 dark:border-gray-600 focus:ring-orange-500 dark:focus:ring-orange-400'
                                        }`}
                                    placeholder="Nhập tên sách/sản phẩm"
                                />
                                {errors.title && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                                        <FiAlertCircle className="mr-1" /> {errors.title}
                                    </p>
                                )}
                            </div>                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                                    <FiUser className="mr-1 text-orange-500 dark:text-orange-400" /> Tác giả *
                                </label>
                                <input
                                    type="text"
                                    name="author"
                                    value={formData.author}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.author
                                        ? 'border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400'
                                        : 'border-gray-300 dark:border-gray-600 focus:ring-orange-500 dark:focus:ring-orange-400'
                                        }`}
                                    placeholder="Nhập tên tác giả"
                                />
                                {errors.author && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                                        <FiAlertCircle className="mr-1" /> {errors.author}
                                    </p>
                                )}
                            </div>

                            {/* Publisher */}
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                                    <FiUser className="mr-1 text-orange-500 dark:text-orange-400" /> Nhà xuất bản
                                </label>
                                <input
                                    type="text"
                                    name="publisher"
                                    value={formData.publisher}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="Tên nhà xuất bản"
                                />
                            </div>

                            {/* Pages */}
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                                    <FiBookOpen className="mr-1 text-orange-500 dark:text-orange-400" /> Số trang
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    name="pages"
                                    value={formData.pages}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="Số trang của sách"
                                />
                            </div>                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                                    <PiMoneyWavyLight className="mr-1 text-orange-500 dark:text-orange-400" /> Giá hiện tại (VNĐ) *
                                </label>
                                <input
                                    type="number"
                                    step="any"
                                    min="0"
                                    name="currentPrice"
                                    value={formData.currentPrice}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.currentPrice
                                        ? 'border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400'
                                        : 'border-gray-300 dark:border-gray-600 focus:ring-orange-500 dark:focus:ring-orange-400'
                                        }`}
                                    placeholder="Ví dụ: 169150.50"
                                />
                                {errors.currentPrice && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                                        <FiAlertCircle className="mr-1" /> {errors.currentPrice}
                                    </p>
                                )}
                            </div>                            {/* Original Price */}
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                                    <FiTag className="mr-1 text-orange-500 dark:text-orange-400" /> Giá gốc (VNĐ)
                                </label>
                                <input
                                    type="number"
                                    step="any"
                                    min="0"
                                    name="originalPrice"
                                    value={formData.originalPrice}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.originalPrice
                                        ? 'border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400'
                                        : 'border-gray-300 dark:border-gray-600 focus:ring-orange-500 dark:focus:ring-orange-400'
                                        }`}
                                    placeholder="Ví dụ: 200000.00"
                                />
                                {errors.originalPrice && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                                        <FiAlertCircle className="mr-1" /> {errors.originalPrice}
                                    </p>
                                )}
                            </div>                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                                    <FiGrid className="mr-1 text-orange-500 dark:text-orange-400" /> Danh mục *
                                </label>

                                {/* Selected Categories as Tags */}
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {formData.categoryIds.map((categoryId) => (
                                        <div
                                            key={categoryId}
                                            className="flex items-center bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 px-3 py-1 rounded-full text-sm"
                                        >
                                            <FiTag className="mr-1 flex-shrink-0" />
                                            <span>{getCategoryName(categoryId)}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeCategory(categoryId)}
                                                className="ml-1 text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-200"
                                            >
                                                <FiX size={16} />
                                            </button>
                                        </div>
                                    ))}

                                    {formData.categoryIds.length === 0 && (
                                        <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                                            Chưa có danh mục nào được chọn
                                        </div>
                                    )}
                                </div>

                                {/* Category Dropdown */}
                                <div className="relative flex">
                                    <select
                                        name="categorySelect"
                                        value=""
                                        onChange={handleCategoryChange}
                                        className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.categoryIds
                                            ? 'border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400'
                                            : 'border-gray-300 dark:border-gray-600 focus:ring-orange-500 dark:focus:ring-orange-400'
                                            }`}
                                    >
                                        <option value="">Chọn danh mục...</option>
                                        {categories.map((category) => (
                                            <option
                                                key={category.id}
                                                value={category.id}
                                                className="dark:bg-gray-700 py-1"
                                                disabled={formData.categoryIds.includes(category.id)}
                                            >
                                                {category.name}
                                            </option>
                                        ))}                                    </select>
                                </div>

                                {errors.categoryIds && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                                        <FiAlertCircle className="mr-1" /> {errors.categoryIds}
                                    </p>
                                )}                            </div>                            {/* Image Preview */}
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                                    <FiImage className="mr-1 text-orange-500 dark:text-orange-400" /> URL Hình ảnh
                                </label>
                                <input
                                    type="text" name="coverLink"
                                    value={formData.coverLink}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="https://example.com/image.jpg"
                                />

                                {/* Image Preview */}
                                <div className="mt-3 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Xem trước ảnh:</p>
                                    <div className="h-36 bg-white dark:bg-gray-800 rounded-md border border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden">
                                        {previewImage ? (
                                            <img
                                                src={previewImage}
                                                alt="Preview"
                                                className="max-h-full max-w-full object-contain"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = '/placeholder.jpg';
                                                }}
                                            />
                                        ) : (
                                            <div className="text-gray-400 dark:text-gray-500 text-center p-4">
                                                <FiImage size={24} className="mx-auto mb-2" />
                                                <div>Không có ảnh</div>
                                            </div>)}                                </div>
                                </div>
                            </div>
                        </div><div>                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                            <FiInfo className="mr-1 text-orange-500 dark:text-orange-400" /> Mô tả sản phẩm *
                        </label>
                            <div className={`${errors.description ? 'border border-red-500 dark:border-red-400 rounded-md' : ''}`}>
                                <RichTextEditor
                                    content={formData.description}
                                    onChange={(html) => {
                                        setFormData({ ...formData, description: html });
                                        if (errors.description) {
                                            setErrors({ ...errors, description: null });
                                        }
                                    }}
                                    placeholder="Nhập mô tả sản phẩm..."
                                    editable={true}
                                    className={errors.description ? 'border-red-500 dark:border-red-400' : ''}
                                />
                            </div>
                            {errors.description && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                                    <FiAlertCircle className="mr-1" /> {errors.description}
                                </p>
                            )}
                        </div>

                        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <button
                                type="button"
                                onClick={() => router.push('/admin/products')}
                                className="px-4 py-2 flex items-center text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors duration-200"
                            >
                                <FiX className="mr-1" /> Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`px-4 py-2 flex items-center text-white rounded-md transition-colors duration-200 ${loading
                                    ? 'bg-orange-400 dark:bg-orange-600 cursor-not-allowed'
                                    : 'bg-orange-600 dark:bg-orange-500 hover:bg-orange-700 dark:hover:bg-orange-600'
                                    }`}
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Đang xử lý...
                                    </>
                                ) : (
                                    <>
                                        <FiSave className="mr-1" /> Lưu thay đổi
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
} 
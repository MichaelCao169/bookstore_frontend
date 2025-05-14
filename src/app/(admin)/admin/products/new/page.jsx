'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axiosInstance';
import { FiSave, FiX, FiBookOpen, FiDollarSign, FiPackage, FiImage, FiGrid, FiUser, FiCalendar, FiHash, FiBookmark, FiAlertCircle, FiCheckCircle, FiTag, FiPlus } from 'react-icons/fi';

export default function NewProduct() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        stockQuantity: '',
        imageUrl: '',
        isbn: '',
        author: '',
        publisher: '',
        publicationYear: '',
        categoryIds: [],
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axiosInstance.get('categories');
                setCategories(response.data);
            } catch (err) {
                console.error('Error fetching categories:', err);
            }
        };

        fetchCategories();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Xử lý đặc biệt cho trường giá tiền
        if (name === 'price') {
            // Chỉ cho phép số và dấu chấm/phẩy
            const cleanValue = value.replace(/[^\d.,]/g, '');
            setFormData({ ...formData, [name]: cleanValue });
        } else {
            setFormData({ ...formData, [name]: value });
        }

        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors({ ...errors, [name]: null });
        }
    };

    // Xử lý lựa chọn nhiều danh mục
    const handleCategoryChange = (e) => {
        const selectedId = Number(e.target.value);

        // Nếu người dùng chọn giá trị mặc định (rỗng), không thực hiện gì cả
        if (!selectedId) return;

        // Kiểm tra xem danh mục đã được chọn chưa
        if (!formData.categoryIds.includes(selectedId)) {
            const newCategoryIds = [...formData.categoryIds, selectedId];
            setFormData({
                ...formData,
                categoryIds: newCategoryIds,
                // Set the first selected category as the primary category if not already set
                categoryId: formData.categoryId || newCategoryIds[0].toString()
            });

            // Clear error when user selects categories
            if (errors.categoryIds) {
                setErrors({ ...errors, categoryIds: null });
            }
        }

        // Reset dropdown to default value
        e.target.value = '';
    };

    // Xóa danh mục đã chọn
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

    // Lấy tên danh mục từ ID
    const getCategoryName = (categoryId) => {
        const category = categories.find(cat => cat.id === categoryId);
        return category ? category.name : '';
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.title) newErrors.title = 'Vui lòng nhập tên sản phẩm';
        if (!formData.description) newErrors.description = 'Vui lòng nhập mô tả sản phẩm';

        // Kiểm tra giá trị price đặc biệt
        if (!formData.price) {
            newErrors.price = 'Vui lòng nhập giá sản phẩm';
        } else {
            // Chuyển đổi chuỗi price thành số, loại bỏ dấu phân cách hàng nghìn
            const priceValue = Number(formData.price.replace(/\./g, '').replace(/,/g, '.'));
            if (isNaN(priceValue) || priceValue <= 0) {
                newErrors.price = 'Giá sản phẩm phải là số dương';
            }
        }

        if (!formData.stockQuantity) newErrors.stockQuantity = 'Vui lòng nhập số lượng tồn kho';
        else if (isNaN(formData.stockQuantity) || Number(formData.stockQuantity) < 0)
            newErrors.stockQuantity = 'Số lượng tồn kho phải là số không âm';
        if (!formData.categoryIds || formData.categoryIds.length === 0) newErrors.categoryIds = 'Vui lòng chọn ít nhất một danh mục';
        if (!formData.author) newErrors.author = 'Vui lòng nhập tên tác giả';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        try {
            setLoading(true);

            // Convert string values to numbers where appropriate
            const productData = {
                title: formData.title,
                description: formData.description,
                price: Number(formData.price),
                stockQuantity: Number(formData.stockQuantity),
                imageUrl: formData.imageUrl || '',
                isbn: formData.isbn || '',
                author: formData.author,
                // API backend có thể cần categoryId (số ít) thay vì categoryIds (số nhiều)
                // Hoặc cần cả hai tùy theo thiết kế. Sử dụng cả hai để đảm bảo tương thích
                categoryId: formData.categoryIds.length > 0 ? formData.categoryIds[0] : null,
                categoryIds: formData.categoryIds,
            };

            console.log('Sending product data:', productData);

            // Thử gửi request và log thông tin chi tiết
            try {
                const response = await axiosInstance.post('/products/admin', productData);
                console.log('Success response:', response.data);
                alert('Tạo sản phẩm thành công!');
                router.push('/admin/products');
            } catch (apiError) {
                console.error('API Error Details:', {
                    status: apiError.response?.status,
                    statusText: apiError.response?.statusText,
                    data: apiError.response?.data,
                    message: apiError.message,
                    errorJSON: JSON.stringify(apiError.response?.data || {})
                });

                // Hiển thị chi tiết lỗi
                const errorMessage = apiError.response?.data?.message ||
                    apiError.response?.data?.error ||
                    apiError.message ||
                    'Không thể tạo sản phẩm. Vui lòng thử lại.';

                alert(`Lỗi: ${errorMessage}`);
            }
        } catch (err) {
            console.error('Error in overall process:', err);
            alert('Có lỗi xảy ra khi xử lý yêu cầu. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 text-white p-4 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold flex items-center">
                    <FiBookOpen className="mr-2" /> Thêm sản phẩm mới
                </h1>
                <button
                    onClick={() => router.push('/admin/products')}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-md transition-colors duration-200 flex items-center"
                >
                    <FiX className="mr-1" /> Hủy
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
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
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
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

                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                                <FiDollarSign className="mr-1 text-orange-500 dark:text-orange-400" /> Giá (VNĐ) *
                            </label>
                            <input
                                type="number"
                                step="any"
                                min="0"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.price
                                    ? 'border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400'
                                    : 'border-gray-300 dark:border-gray-600 focus:ring-orange-500 dark:focus:ring-orange-400'
                                    }`}
                                placeholder="Ví dụ: 169150.50"
                            />
                            {errors.price && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                                    <FiAlertCircle className="mr-1" /> {errors.price}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                                <FiPackage className="mr-1 text-orange-500 dark:text-orange-400" /> Số lượng tồn kho *
                            </label>
                            <input
                                type="number"
                                min="0"
                                name="stockQuantity"
                                value={formData.stockQuantity}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.stockQuantity
                                    ? 'border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400'
                                    : 'border-gray-300 dark:border-gray-600 focus:ring-orange-500 dark:focus:ring-orange-400'
                                    }`}
                                placeholder="0"
                            />
                            {errors.stockQuantity && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                                    <FiAlertCircle className="mr-1" /> {errors.stockQuantity}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
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
                                    ))}
                                </select>
                                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500 dark:text-gray-400">
                                    <FiPlus size={16} />
                                </div>
                            </div>

                            {errors.categoryIds && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                                    <FiAlertCircle className="mr-1" /> {errors.categoryIds}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                                <FiHash className="mr-1 text-orange-500 dark:text-orange-400" /> Mã ISBN
                            </label>
                            <input
                                type="text"
                                name="isbn"
                                value={formData.isbn}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="Mã ISBN"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                                <FiImage className="mr-1 text-orange-500 dark:text-orange-400" /> URL Hình ảnh
                            </label>
                            <input
                                type="text"
                                name="imageUrl"
                                value={formData.imageUrl}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                            <FiBookOpen className="mr-1 text-orange-500 dark:text-orange-400" /> Mô tả sản phẩm *
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${errors.description
                                ? 'border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400'
                                : 'border-gray-300 dark:border-gray-600 focus:ring-orange-500 dark:focus:ring-orange-400'
                                }`}
                            placeholder="Nhập mô tả sản phẩm"
                        ></textarea>
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
                                    <FiSave className="mr-1" /> Tạo sản phẩm
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 
// src/app/(main)/checkout/page.jsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axiosInstance';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'react-toastify';
import { FiShoppingCart, FiMapPin, FiPhone, FiUser, FiCreditCard, FiLoader, FiAlertCircle, FiCheckCircle, FiSave, FiHome, FiEdit3 } from 'react-icons/fi';
import { formatCurrency } from '@/components/order/OrderHelpers';
import BrandSpinner from '@/components/ui/BrandSpinner';
import { cities, getDistrictsByCity } from '@/data/vietnamLocations';
import { vnpayService } from '@/services/vnpayService';
import { useCartStore } from '@/store/cartStore';

// Components Loading/Error
const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-10">
        <BrandSpinner size="text-4xl" />
    </div>
);

const ErrorMessage = ({ message }) => (
    <div className="flex flex-col items-center justify-center py-10 text-center text-red-600">
        <FiAlertCircle size={40} className="mb-2" />
        <p>Lỗi khi checkout:</p>
        <p className="text-sm">{message}</p>
        <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 text-sm"
        >
            Thử lại
        </button>
    </div>
);

const CheckoutPage = () => {
    // State cho giỏ hàng và form
    const [cartData, setCartData] = useState(null);
    const [isLoadingCart, setIsLoadingCart] = useState(true);
    const [cartError, setCartError] = useState(null);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [orderError, setOrderError] = useState(null);

    // State cho form địa chỉ
    const [recipientName, setRecipientName] = useState('');
    const [phone, setPhone] = useState('');
    const [street, setStreet] = useState('');
    const [district, setDistrict] = useState('');
    const [city, setCity] = useState('');
    const [country, setCountry] = useState('Việt Nam');
    const [notes, setNotes] = useState('');
    const [formErrors, setFormErrors] = useState({});
    const [paymentMethod, setPaymentMethod] = useState('COD');

    // State cho dropdown địa chỉ
    const [availableDistricts, setAvailableDistricts] = useState([]);

    // Auth state và router
    const user = useAuthStore((state) => state.user);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const isAuthLoading = useAuthStore((state) => state.isLoading);
    const logout = useAuthStore((state) => state.logout);
    const router = useRouter();

    // Cart store
    const clearCartCount = useCartStore((state) => state.clearCartCount);

    // Update các quận/huyện khi chọn tỉnh/thành phố
    useEffect(() => {
        if (city) {
            const districts = getDistrictsByCity(city);
            setAvailableDistricts(districts);
            // Reset district if it's not available in the new city
            if (district && !districts.includes(district)) {
                setDistrict('');
            }
        } else {
            setAvailableDistricts([]);
            setDistrict('');
        }
    }, [city, district]);

    // Fetch thông tin người dùng và giỏ hàng
    const fetchUserProfile = useCallback(async () => {
        const currentUser = user;
        if (!currentUser || !currentUser.id) return;

        try {
            const response = await axiosInstance.get('/profile');
            const profileData = response.data;

            if (profileData) {
                setRecipientName(profileData.name || currentUser.name || '');
                setPhone(profileData.phone || '');

                if (profileData.defaultAddress) {
                    setStreet(profileData.defaultAddress.street || '');
                    setDistrict(profileData.defaultAddress.district || '');
                    setCity(profileData.defaultAddress.city || '');
                    setCountry(profileData.defaultAddress.country || 'Việt Nam');
                }
            }
        } catch (err) {
            console.error('Failed to fetch user profile:', err);
        }
    }, []);

    // Fetch giỏ hàng
    const fetchCart = useCallback(async () => {
        console.log('Checkout Page: Fetching cart data...');
        setIsLoadingCart(true);
        setCartError(null);
        try {
            const response = await axiosInstance.get('/cart');
            setCartData(response.data);
            if (!response.data || !response.data.items || response.data.items.length === 0) {
                toast.info("Giỏ hàng của bạn đang trống.");
                router.replace('/cart');
                return;
            }
        } catch (err) {
            console.error('Failed to fetch cart for checkout:', err);
            if (err.response?.status === 401) {
                toast.error("Phiên đăng nhập hết hạn.");
                logout();
                router.push('/login?redirect=/checkout');
            } else {
                setCartError(err.response?.data?.message || err.message || 'Không thể tải thông tin giỏ hàng.');
            }
            setCartData(null);
        } finally {
            setIsLoadingCart(false);
        }
    }, [router, logout]);

    useEffect(() => {
        if (!isAuthLoading && isAuthenticated) {
            fetchCart();
        } else if (!isAuthLoading && !isAuthenticated) {
            router.replace('/login?redirect=/checkout');
        }
    }, [isAuthenticated, isAuthLoading, fetchCart, router]);

    useEffect(() => {
        if (user && user.id) {
            fetchUserProfile();
        }
    }, [user]);

    // Xác thực form
    const validateForm = () => {
        const errors = {};
        if (!recipientName.trim()) errors.recipientName = 'Vui lòng nhập tên người nhận.';
        if (!phone.trim()) errors.phone = 'Vui lòng nhập số điện thoại.';
        if (!street.trim()) errors.street = 'Vui lòng nhập địa chỉ giao hàng.';
        if (!district.trim()) errors.district = 'Vui lòng chọn quận/huyện.';
        if (!city.trim()) errors.city = 'Vui lòng chọn tỉnh/thành phố.';
        if (!country.trim()) errors.country = 'Vui lòng nhập quốc gia.';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handlePlaceOrder = async () => {
        setOrderError(null);
        setFormErrors({});

        if (!validateForm()) {
            toast.warn("Vui lòng điền đầy đủ thông tin giao hàng.");
            return;
        }

        if (!cartData || cartData.items.length === 0) {
            toast.error("Giỏ hàng trống, không thể đặt hàng.");
            router.push('/cart');
            return;
        }

        setIsPlacingOrder(true);

        const addressData = {
            recipientName,
            phone,
            street,
            district,
            city,
            country,
        };

        const orderRequest = {
            shippingAddress: addressData,
            paymentMethod: paymentMethod,
            notes: notes,
        };

        try {
            console.log('Placing order with data:', orderRequest);
            const response = await axiosInstance.post('/orders', orderRequest);

            // Nếu là VNPay, response sẽ chứa paymentUrl
            if (paymentMethod === 'VNPAY' && response.data.paymentUrl) {
                console.log('Redirecting to VNPay payment:', response.data);
                toast.info('Đang chuyển hướng đến trang thanh toán VNPay...');
                vnpayService.redirectToPayment(response.data.paymentUrl);
                return;
            }

            // Nếu là COD hoặc thanh toán khác
            const createdOrder = response.data;
            console.log('Order placed successfully:', createdOrder);
            toast.success(`Đơn hàng #${createdOrder.orderId} đã được đặt thành công!`);

            // Clear cart store để cập nhật icon giỏ hàng ngay lập tức
            clearCartCount();

            router.push(`/order-success?orderId=${createdOrder.orderId}`);

        } catch (error) {
            console.error('Failed to place order:', error.response?.data || error.message);
            const errorMessage = error.response?.data?.message || error.response?.data || 'Đặt hàng thất bại. Vui lòng thử lại.';
            setOrderError(errorMessage);
            toast.error(`Lỗi: ${errorMessage}`);
        } finally {
            setIsPlacingOrder(false);
        }
    };

    // Render logic
    if (isAuthLoading || isLoadingCart) {
        return <LoadingSpinner />;
    }
    if (!isAuthenticated) {
        return <div className="text-center py-10">Redirecting to login...</div>;
    }
    if (cartError) {
        return <ErrorMessage message={cartError} onRetry={fetchCart} />;
    }
    if (!cartData || cartData.items.length === 0) {
        return (
            <div className="text-center py-16">
                <h2 className="text-xl font-semibold">Giỏ hàng trống</h2>
                <p className="mt-2 text-gray-500">Không có sản phẩm nào để thanh toán.</p>
                <Link href="/products" className="mt-6 inline-block bg-orange-500 text-white px-6 py-2.5 rounded hover:bg-orange-600">
                    Tiếp tục mua sắm
                </Link>
            </div>
        );
    }

    // Hiển thị trang Checkout 
    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full mb-6 shadow-lg">
                        <FiShoppingCart className="text-white text-4xl" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
                        Thanh toán đơn hàng
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300">
                        Vui lòng kiểm tra thông tin giao hàng và hoàn tất đơn hàng
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Form Thông tin - Chiếm 2 cột */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Thông tin giao hàng */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
                            <div className="p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
                                        <FiMapPin className="mr-3 text-orange-500" />
                                        Thông tin giao hàng
                                    </h3>
                                    <div className="flex items-center text-orange-500">
                                        <FiEdit3 className="mr-1" />
                                        <span className="text-sm">Chỉnh sửa</span>
                                    </div>
                                </div>

                                <form className="space-y-6">
                                    {/* Thông tin người nhận */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                <FiUser className="inline mr-2 text-orange-500" />
                                                Tên người nhận
                                            </label>
                                            <input
                                                type="text"
                                                value={recipientName}
                                                onChange={e => setRecipientName(e.target.value)}
                                                className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition-all duration-200 ${formErrors.recipientName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                                                placeholder="Nhập tên người nhận"
                                            />
                                            {formErrors.recipientName && (
                                                <p className="text-red-500 text-sm mt-1">{formErrors.recipientName}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                <FiPhone className="inline mr-2 text-orange-500" />
                                                Số điện thoại
                                            </label>
                                            <input
                                                type="tel"
                                                value={phone}
                                                onChange={e => setPhone(e.target.value)}
                                                className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition-all duration-200 ${formErrors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                                                placeholder="Nhập số điện thoại"
                                            />
                                            {formErrors.phone && (
                                                <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Địa chỉ chi tiết */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            <FiHome className="inline mr-2 text-orange-500" />
                                            Địa chỉ chi tiết
                                        </label>
                                        <input
                                            type="text"
                                            value={street}
                                            onChange={e => setStreet(e.target.value)}
                                            className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition-all duration-200 ${formErrors.street ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                                            placeholder="Số nhà, tên đường, phường/xã"
                                        />
                                        {formErrors.street && (
                                            <p className="text-red-500 text-sm mt-1">{formErrors.street}</p>
                                        )}
                                    </div>

                                    {/* Dropdown Tỉnh/Thành phố và Quận/Huyện */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Tỉnh / Thành phố
                                            </label>
                                            <select
                                                value={city}
                                                onChange={e => setCity(e.target.value)}
                                                className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition-all duration-200 ${formErrors.city ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                                            >
                                                <option value="">Chọn tỉnh/thành phố</option>
                                                {cities.map(cityName => (
                                                    <option key={cityName} value={cityName}>{cityName}</option>
                                                ))}
                                            </select>
                                            {formErrors.city && (
                                                <p className="text-red-500 text-sm mt-1">{formErrors.city}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Quận / Huyện
                                            </label>
                                            <select
                                                value={district}
                                                onChange={e => setDistrict(e.target.value)}
                                                disabled={!city}
                                                className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition-all duration-200 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed ${formErrors.district ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                                            >
                                                <option value="">
                                                    {city ? 'Chọn quận/huyện' : 'Vui lòng chọn tỉnh/thành phố trước'}
                                                </option>
                                                {availableDistricts.map(districtName => (
                                                    <option key={districtName} value={districtName}>{districtName}</option>
                                                ))}
                                            </select>
                                            {formErrors.district && (
                                                <p className="text-red-500 text-sm mt-1">{formErrors.district}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Quốc gia */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Quốc gia
                                        </label>
                                        <input
                                            type="text"
                                            value={country}
                                            onChange={e => setCountry(e.target.value)}
                                            className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition-all duration-200 ${formErrors.country ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                                            placeholder="Việt Nam"
                                        />
                                        {formErrors.country && (
                                            <p className="text-red-500 text-sm mt-1">{formErrors.country}</p>
                                        )}
                                    </div>

                                    {/* Ghi chú */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Ghi chú đơn hàng (tùy chọn)
                                        </label>
                                        <textarea
                                            value={notes}
                                            onChange={e => setNotes(e.target.value)}
                                            rows="3"
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:outline-none transition-all duration-200"
                                            placeholder="Ghi chú về thời gian giao hàng, địa chỉ cụ thể..."
                                        />
                                    </div>


                                </form>
                            </div>
                        </div>

                        {/* Phương thức thanh toán */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
                            <div className="p-8">
                                <h3 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center mb-6">
                                    <FiCreditCard className="mr-3 text-orange-500" />
                                    Phương thức thanh toán
                                </h3>

                                <div className="space-y-4">
                                    {/* COD Option */}
                                    <div className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${paymentMethod === 'COD'
                                        ? 'border-orange-300 dark:border-orange-700 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20'
                                        : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 hover:border-orange-200 dark:hover:border-orange-600'
                                        }`} onClick={() => setPaymentMethod('COD')}>
                                        <label className="flex items-center cursor-pointer">
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="COD"
                                                checked={paymentMethod === 'COD'}
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                                className="h-5 w-5 text-orange-600 border-gray-300 focus:ring-orange-500 dark:border-gray-600"
                                            />
                                            <div className="ml-4">
                                                <span className={`block text-lg font-semibold ${paymentMethod === 'COD'
                                                    ? 'text-orange-800 dark:text-orange-200'
                                                    : 'text-gray-700 dark:text-gray-300'
                                                    }`}>
                                                    Thanh toán khi nhận hàng (COD)
                                                </span>
                                                <p className={`text-sm mt-1 ${paymentMethod === 'COD'
                                                    ? 'text-orange-600 dark:text-orange-300'
                                                    : 'text-gray-500 dark:text-gray-400'
                                                    }`}>
                                                    Bạn sẽ thanh toán bằng tiền mặt cho nhân viên giao hàng khi nhận được sản phẩm
                                                </p>
                                            </div>
                                        </label>
                                    </div>

                                    {/* VNPay Option */}
                                    <div className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${paymentMethod === 'VNPAY'
                                        ? 'border-blue-300 dark:border-blue-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20'
                                        : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 hover:border-blue-200 dark:hover:border-blue-600'
                                        }`} onClick={() => setPaymentMethod('VNPAY')}>
                                        <label className="flex items-center cursor-pointer">
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="VNPAY"
                                                checked={paymentMethod === 'VNPAY'}
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                                className="h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500 dark:border-gray-600"
                                            />
                                            <div className="ml-4 flex-grow">
                                                <div className="flex items-center">
                                                    <span className={`block text-lg font-semibold ${paymentMethod === 'VNPAY'
                                                        ? 'text-blue-800 dark:text-blue-200'
                                                        : 'text-gray-700 dark:text-gray-300'
                                                        }`}>
                                                        Thanh toán online qua VNPay
                                                    </span>
                                                    <div className="ml-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs font-medium">
                                                        An toàn
                                                    </div>
                                                </div>
                                                <p className={`text-sm mt-1 ${paymentMethod === 'VNPAY'
                                                    ? 'text-blue-600 dark:text-blue-300'
                                                    : 'text-gray-500 dark:text-gray-400'
                                                    }`}>
                                                    Thanh toán bằng thẻ ATM, thẻ tín dụng, ví điện tử qua cổng VNPay
                                                </p>
                                                <div className="flex items-center mt-2 space-x-2">
                                                    <span className="text-xs text-gray-500">Hỗ trợ:</span>
                                                    <div className="flex space-x-1">
                                                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Visa</span>
                                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Mastercard</span>
                                                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">ATM</span>
                                                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">QR Code</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tóm tắt đơn hàng - Chiếm 1 cột */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 sticky top-24">
                            <div className="p-8">
                                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
                                    Tóm tắt đơn hàng
                                </h3>

                                {/* Danh sách sản phẩm */}
                                <div className="space-y-4 max-h-64 overflow-y-auto mb-6">
                                    {cartData.items.map(item => (
                                        <div key={item.cartItemId} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <div className="bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300 rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold">
                                                    {item.quantity}
                                                </div>
                                                <span className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-2">
                                                    {item.productTitle}
                                                </span>
                                            </div>
                                            <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                                                {formatCurrency(item.subtotal)}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Tổng tiền */}
                                <div className="space-y-3 border-t border-gray-200 dark:border-gray-700 pt-6">
                                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                        <span>Tạm tính ({cartData.totalItems} sản phẩm)</span>
                                        <span>{formatCurrency(cartData.totalPrice)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                        <span>Phí vận chuyển</span>
                                        <span className="text-green-600 dark:text-green-400 font-semibold">Miễn phí</span>
                                    </div>
                                    <div className="flex justify-between text-xl font-bold text-gray-800 dark:text-gray-100 pt-3 border-t border-gray-200 dark:border-gray-700">
                                        <span>Tổng cộng</span>
                                        <span className="text-orange-600 dark:text-orange-400">{formatCurrency(cartData.totalPrice)}</span>
                                    </div>
                                </div>

                                {/* Hiển thị lỗi */}
                                {orderError && (
                                    <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                        <p className="text-sm text-red-600 dark:text-red-400 text-center">{orderError}</p>
                                    </div>
                                )}

                                {/* Nút đặt hàng */}
                                <button
                                    onClick={handlePlaceOrder}
                                    disabled={isPlacingOrder}
                                    className={`mt-8 w-full text-white px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 ${paymentMethod === 'VNPAY'
                                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600'
                                        : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600'
                                        }`}
                                >
                                    {isPlacingOrder ? (
                                        <>
                                            <BrandSpinner size="sm" className="mr-3" />
                                            {paymentMethod === 'VNPAY' ? 'Đang tạo thanh toán...' : 'Đang xử lý...'}
                                        </>
                                    ) : (
                                        <>
                                            {paymentMethod === 'VNPAY' ? 'Thanh toán với VNPay' : 'Đặt hàng ngay'}
                                        </>
                                    )}
                                </button>

                                {/* Chính sách */}
                                <div className="mt-6 text-center">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Bằng cách đặt hàng, bạn đồng ý với{' '}
                                        <Link href="/terms" className="text-orange-500 hover:underline">
                                            Điều khoản dịch vụ
                                        </Link>{' '}
                                        của chúng tôi
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
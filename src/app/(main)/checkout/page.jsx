// src/app/(main)/checkout/page.jsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axiosInstance';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'react-toastify';
import { FiShoppingCart, FiMapPin, FiPhone, FiUser, FiCreditCard, FiLoader, FiAlertCircle, FiCheckCircle, FiSave } from 'react-icons/fi';
import { formatCurrency } from '@/components/order/OrderHelpers'; // Import hàm format tiền tệ
import BrandSpinner from '@/components/ui/BrandSpinner';

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
            onClick={() => window.location.reload()} // Đơn giản là tải lại trang
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
    const [isPlacingOrder, setIsPlacingOrder] = useState(false); // State khi đang đặt hàng
    const [orderError, setOrderError] = useState(null); // Lỗi khi đặt hàng

    // State cho form địa chỉ
    const [recipientName, setRecipientName] = useState('');
    const [phone, setPhone] = useState('');
    const [street, setStreet] = useState('');
    const [district, setDistrict] = useState('');
    const [city, setCity] = useState('');
    const [country, setCountry] = useState('Việt Nam'); // Mặc định
    const [notes, setNotes] = useState('');
    const [formErrors, setFormErrors] = useState({}); // Lỗi validation form
    const [saveAddress, setSaveAddress] = useState(false); // State cho checkbox lưu địa chỉ mặc định

    // Auth state và router
    const user = useAuthStore((state) => state.user);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const isAuthLoading = useAuthStore((state) => state.isLoading);
    const logout = useAuthStore((state) => state.logout);
    const router = useRouter();

    // ---- Fetch User Profile and Cart Data ----
    const fetchUserProfile = useCallback(async () => {
        if (!user || !user.id) return;

        try {
            const response = await axiosInstance.get('/users/profile');
            const profileData = response.data;

            // Pre-fill with user profile data if available
            if (profileData) {
                setRecipientName(profileData.name || user.name || '');
                setPhone(profileData.phone || '');

                // Pre-fill address if saved
                if (profileData.defaultAddress) {
                    setStreet(profileData.defaultAddress.street || '');
                    setDistrict(profileData.defaultAddress.district || '');
                    setCity(profileData.defaultAddress.city || '');
                    setCountry(profileData.defaultAddress.country || 'Việt Nam');
                }
            }
        } catch (err) {
            console.error('Failed to fetch user profile:', err);
            // Don't show error for profile fetch, just log it
        }
    }, [user]);

    // ---- Fetch Cart Data ----
    const fetchCart = useCallback(async () => {
        console.log('Checkout Page: Fetching cart data...');
        setIsLoadingCart(true);
        setCartError(null);
        try {
            const response = await axiosInstance.get('/cart');
            setCartData(response.data);
            // Nếu giỏ hàng trống, chuyển hướng về trang giỏ hàng (hoặc trang chủ)
            if (!response.data || !response.data.items || response.data.items.length === 0) {
                toast.info("Giỏ hàng của bạn đang trống.");
                router.replace('/cart'); // Hoặc '/'
            }

            // Fetch user profile to pre-fill address
            await fetchUserProfile();

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
    }, [router, logout, fetchUserProfile]); // Remove user dependency, use fetchUserProfile

    // useEffect để fetch cart và kiểm tra auth
    useEffect(() => {
        if (!isAuthLoading && isAuthenticated) {
            fetchCart();
        } else if (!isAuthLoading && !isAuthenticated) {
            router.replace('/login?redirect=/checkout');
        }
    }, [isAuthenticated, isAuthLoading, fetchCart, router]);

    // ---- Place Order Logic ----
    const validateForm = () => {
        const errors = {};
        if (!recipientName.trim()) errors.recipientName = 'Vui lòng nhập tên người nhận.';
        if (!phone.trim()) errors.phone = 'Vui lòng nhập số điện thoại.';
        // Thêm regex kiểm tra số điện thoại Việt Nam nếu cần
        // else if (!/^(0[3|5|7|8|9])+([0-9]{8})\b/.test(phone)) errors.phone = 'Số điện thoại không hợp lệ.';
        if (!street.trim()) errors.street = 'Vui lòng nhập địa chỉ giao hàng.';
        if (!district.trim()) errors.district = 'Vui lòng nhập quận/huyện.';
        if (!city.trim()) errors.city = 'Vui lòng nhập tỉnh/thành phố.';
        if (!country.trim()) errors.country = 'Vui lòng nhập quốc gia.';
        setFormErrors(errors);
        return Object.keys(errors).length === 0; // true nếu không có lỗi
    };


    const handlePlaceOrder = async () => {
        setOrderError(null); // Xóa lỗi cũ
        setFormErrors({}); // Xóa lỗi form cũ

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

        // Prepare the address object
        const addressData = {
            recipientName,
            phone,
            street,
            district,
            city,
            country,
        };

        // Prepare order request
        const orderRequest = {
            shippingAddress: addressData,
            paymentMethod: 'COD', // Mặc định là COD cho phiên bản này
            notes: notes,
            saveAddressAsDefault: saveAddress, // Add flag to save address
        };

        try {
            console.log('Placing order with data:', orderRequest);
            const response = await axiosInstance.post('/orders', orderRequest);
            const createdOrder = response.data; // OrderDTO
            console.log('Order placed successfully:', createdOrder);
            toast.success(`Đơn hàng #${createdOrder.orderId} đã được đặt thành công!`);

            // Save address as default if requested
            if (saveAddress) {
                try {
                    await axiosInstance.post('/users/default-address', addressData);
                    console.log('Default address saved');
                } catch (addressError) {
                    console.error('Failed to save default address:', addressError);
                    // Don't block order process if saving address fails
                }
            }

            // Chuyển hướng đến trang thông báo thành công hoặc chi tiết đơn hàng
            // router.push(`/orders/${createdOrder.orderId}`);
            router.push(`/order-success?orderId=${createdOrder.orderId}`); // Redirect đến trang thành công

        } catch (error) {
            console.error('Failed to place order:', error.response?.data || error.message);
            const errorMessage = error.response?.data?.message || error.response?.data || 'Đặt hàng thất bại. Vui lòng thử lại.';
            setOrderError(errorMessage); // Set lỗi để hiển thị trên trang
            toast.error(`Lỗi: ${errorMessage}`);
        } finally {
            setIsPlacingOrder(false);
        }
    };


    // --- Render Logic ---
    if (isAuthLoading || isLoadingCart) {
        return <LoadingSpinner />;
    }
    if (!isAuthenticated) {
        return <div className="text-center py-10">Redirecting to login...</div>;
    }
    if (cartError) {
        return <ErrorMessage message={cartError} onRetry={fetchCart} />;
    }
    // Giỏ hàng trống đã được xử lý redirect trong fetchCart
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

    // --- Hiển thị trang Checkout ---
    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-gray-100 border-b pb-3 dark:border-gray-700">Thanh toán</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">

                {/* Cột Thông tin Giao hàng & Thanh toán */}
                <div className="lg:col-span-2">
                    {/* Form Địa chỉ Giao hàng */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border dark:border-gray-700 mb-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800 dark:text-gray-200">
                            <FiMapPin className="mr-2 text-orange-500" />Địa chỉ Giao hàng
                        </h2>
                        <form className="space-y-4">
                            {/* Tên người nhận */}
                            <div>
                                <label htmlFor="recipientName" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Tên người nhận</label>
                                <input type="text" id="recipientName" value={recipientName} onChange={e => setRecipientName(e.target.value)} required
                                    className={`input-field ${formErrors.recipientName ? 'input-error' : ''}`} />
                                {formErrors.recipientName && <p className="input-error-message">{formErrors.recipientName}</p>}
                            </div>
                            {/* Số điện thoại */}
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Số điện thoại</label>
                                <input type="tel" id="phone" value={phone} onChange={e => setPhone(e.target.value)} required
                                    className={`input-field ${formErrors.phone ? 'input-error' : ''}`} />
                                {formErrors.phone && <p className="input-error-message">{formErrors.phone}</p>}
                            </div>
                            {/* Địa chỉ đường */}
                            <div>
                                <label htmlFor="street" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Địa chỉ (Số nhà, tên đường)</label>
                                <input type="text" id="street" value={street} onChange={e => setStreet(e.target.value)} required
                                    className={`input-field ${formErrors.street ? 'input-error' : ''}`} />
                                {formErrors.street && <p className="input-error-message">{formErrors.street}</p>}
                            </div>
                            {/* Quận/Huyện & Tỉnh/Thành phố */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="district" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Quận / Huyện</label>
                                    <input type="text" id="district" value={district} onChange={e => setDistrict(e.target.value)} required
                                        className={`input-field ${formErrors.district ? 'input-error' : ''}`} />
                                    {formErrors.district && <p className="input-error-message">{formErrors.district}</p>}
                                </div>
                                <div>
                                    <label htmlFor="city" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Tỉnh / Thành phố</label>
                                    <input type="text" id="city" value={city} onChange={e => setCity(e.target.value)} required
                                        className={`input-field ${formErrors.city ? 'input-error' : ''}`} />
                                    {formErrors.city && <p className="input-error-message">{formErrors.city}</p>}
                                </div>
                            </div>
                            {/* Quốc gia */}
                            <div>
                                <label htmlFor="country" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Quốc gia</label>
                                <input type="text" id="country" value={country} onChange={e => setCountry(e.target.value)} required
                                    className={`input-field ${formErrors.country ? 'input-error' : ''}`} />
                                {formErrors.country && <p className="input-error-message">{formErrors.country}</p>}
                            </div>
                            {/* Ghi chú */}
                            <div>
                                <label htmlFor="notes" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Ghi chú (Tùy chọn)</label>
                                <textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} rows="3"
                                    className="input-field"></textarea>
                            </div>
                            {/* Checkbox lưu địa chỉ mặc định */}
                            <div className="flex items-center mt-4">
                                <input
                                    type="checkbox"
                                    id="saveAddress"
                                    checked={saveAddress}
                                    onChange={e => setSaveAddress(e.target.checked)}
                                    className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500 dark:border-gray-600 dark:focus:ring-orange-400"
                                />
                                <label htmlFor="saveAddress" className="ml-2 block text-sm text-gray-700 dark:text-gray-300 flex items-center">
                                    <FiSave className="mr-1 text-orange-500" /> Lưu làm địa chỉ mặc định
                                </label>
                            </div>
                        </form>
                    </div>

                    {/* Phương thức thanh toán */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border dark:border-gray-700">
                        <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800 dark:text-gray-200">
                            <FiCreditCard className="mr-2 text-orange-500" />Phương thức Thanh toán
                        </h2>
                        {/* Hiện tại chỉ hỗ trợ COD */}
                        <div className="border rounded-md p-4 border-orange-300 bg-orange-50 dark:border-orange-700 dark:bg-orange-900/20">
                            <label htmlFor="cod" className="flex items-center cursor-pointer">
                                <input id="cod" name="paymentMethod" type="radio" className="h-4 w-4 text-orange-600 border-gray-300 focus:ring-orange-500 dark:border-gray-600" checked readOnly />
                                <span className="ml-3 block text-sm font-medium text-orange-800 dark:text-orange-200">
                                    Thanh toán khi nhận hàng (COD)
                                </span>
                            </label>
                            <p className="ml-7 text-xs text-orange-600 dark:text-orange-300 mt-1">Bạn sẽ thanh toán bằng tiền mặt cho nhân viên giao hàng khi nhận được sản phẩm.</p>
                        </div>
                        {/* TODO: Thêm các lựa chọn thanh toán khác (VNPAY) ở đây sau */}
                    </div>

                </div>

                {/* Cột Tóm tắt Đơn hàng */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border dark:border-gray-700 sticky top-24">
                        <h2 className="text-xl font-semibold mb-4 border-b pb-2 dark:border-gray-600 text-gray-800 dark:text-gray-200">Tóm tắt Đơn hàng</h2>
                        {/* Danh sách sản phẩm tóm tắt */}
                        <div className="space-y-3 max-h-60 overflow-y-auto mb-4 pr-2 text-gray-700 dark:text-gray-300"> {/* Scroll nếu nhiều sản phẩm */}
                            {cartData.items.map(item => (
                                <div key={item.cartItemId} className="flex justify-between items-center text-sm">
                                    <div className='flex items-center gap-2'>
                                        <span className='font-medium bg-gray-100 dark:bg-gray-700 rounded px-1.5 py-0.5 text-xs'>
                                            {item.quantity}x
                                        </span>
                                        <span className='truncate max-w-[150px]'>{item.productTitle}</span>
                                    </div>
                                    <span>{formatCurrency(item.subtotal)}</span>
                                </div>
                            ))}
                        </div>
                        {/* Tổng tiền */}
                        <div className="space-y-2 border-t pt-4 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                            <div className="flex justify-between text-sm">
                                <span>Tạm tính ({cartData.totalItems} items)</span>
                                <span>{formatCurrency(cartData.totalPrice)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Phí vận chuyển</span>
                                <span className="text-green-600 dark:text-green-400">FREE</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg pt-2 border-t dark:border-gray-600 mt-2 text-gray-800 dark:text-gray-100">
                                <span>Tổng cộng</span>
                                <span>{formatCurrency(cartData.totalPrice)}</span>
                            </div>
                        </div>

                        {/* Hiển thị lỗi đặt hàng */}
                        {orderError && (
                            <p className="mt-4 text-sm text-red-600 dark:text-red-400 text-center">{orderError}</p>
                        )}

                        {/* Nút Đặt hàng */}
                        <button
                            onClick={handlePlaceOrder}
                            disabled={isPlacingOrder}
                            className="mt-6 w-full bg-orange-600 text-white px-6 py-3 rounded font-semibold hover:bg-orange-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"                        >
                            {isPlacingOrder ? (
                                <BrandSpinner size="sm" className="mr-2" />
                            ) : (
                                <FiCheckCircle className="mr-2" />
                            )}
                            {isPlacingOrder ? 'Đang xử lý...' : 'Đặt hàng (COD)'}
                        </button>
                    </div>
                </div>

            </div>
            {/* Thêm CSS cho input error */}
            <style jsx>{`
         .input-field {
            display: block;
            width: 100%;
            border-radius: 0.375rem; /* rounded-md */
            border-width: 0;
            padding: 0.5rem 0.75rem; /* py-2 px-3 */
            color: #111827; /* text-gray-900 */
            background-color: #f9fafb; /* bg-gray-50 */
            box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); /* shadow-sm */
            ring-width: 1px;
            ring-color: #d1d5db; /* ring-gray-300 */
            ring-inset: inset;
         }
         .dark .input-field {
             background-color: #374151; /* dark:bg-gray-700 */
             color: #f3f4f6; /* dark:text-gray-100 */
             ring-color: #4b5563; /* dark:ring-gray-600 */
         }
          .input-field:focus {
              ring-width: 2px;
              ring-color: #f97316; /* focus:ring-orange-600 */
              outline: none;
          }
          .dark .input-field:focus {
               ring-color: #fb923c; /* dark:focus:ring-orange-500 */
          }

         .input-error {
             ring-color: #ef4444 !important; /* ring-red-500 */
         }
          .dark .input-error {
             ring-color: #f87171 !important; /* dark:ring-red-400 */
          }
          .input-error:focus {
               ring-color: #dc2626 !important; /* focus:ring-red-600 */
          }
           .dark .input-error:focus {
               ring-color: #ef4444 !important; /* dark:focus:ring-red-500 */
          }
         .input-error-message {
             margin-top: 0.25rem; /* mt-1 */
             font-size: 0.75rem; /* text-xs */
             color: #dc2626; /* text-red-600 */
         }
          .dark .input-error-message {
              color: #f87171; /* dark:text-red-400 */
          }
       `}</style>
        </div>
    );
};

export default CheckoutPage;
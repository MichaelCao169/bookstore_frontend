// src/app/(main)/orders/[orderId]/page.jsx
'use client'; // *** CONVERTED TO CLIENT COMPONENT ***

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiPackage, FiUser, FiMapPin, FiCalendar, FiDollarSign, FiInfo, FiTruck, FiLoader, FiAlertCircle } from 'react-icons/fi';
import { OrderStatusBadge, formatCurrency, formatDate, formatDateTime } from '@/components/order/OrderHelpers';
import axiosInstance from '@/lib/axiosInstance';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'react-toastify';

// Loading component
const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-300">Loading order details...</span>
    </div>
);

// Error message component
const ErrorMessage = ({ message, onRetry }) => (
    <div className="text-center py-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-500 mb-4">
            <FiAlertCircle size={32} />
        </div>
        <h1 className="text-2xl font-bold text-red-600">Error Loading Order</h1>
        <p className="text-gray-500 mt-2 max-w-md mx-auto">{message}</p>
        {onRetry && (
            <button
                onClick={onRetry}
                className="mt-4 inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            >
                <FiLoader className="mr-2" />
                Try Again
            </button>
        )}
        <div className="mt-3">
            <Link href="/orders/my-history" className="text-orange-600 hover:underline">
                ← Back to Order History
            </Link>
        </div>
    </div>
);

// Main component (Client Component)
export default function OrderDetailPage() {
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const params = useParams();
    const orderId = params.orderId;
    const router = useRouter();

    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const isAuthLoading = useAuthStore((state) => state.isLoading);
    const logout = useAuthStore((state) => state.logout);

    // Function to fetch order details
    const fetchOrderDetails = useCallback(async () => {
        if (!orderId || isNaN(parseInt(orderId, 10))) {
            setError("Invalid Order ID.");
            setIsLoading(false);
            return;
        }

        if (!isAuthenticated) {
            // No need to fetch if not authenticated (useEffect will handle redirect)
            setIsLoading(false);
            return;
        }

        console.log(`Fetching order details for ID: ${orderId}`);
        setIsLoading(true);
        setError(null);

        try {
            // axiosInstance will automatically attach the token
            const response = await axiosInstance.get(`/orders/${orderId}`);
            console.log('Order details received:', response.data);
            setOrder(response.data); // Store OrderDTO
        } catch (err) {
            console.error(`Failed to fetch order ${orderId}:`, err);

            if (err.response?.status === 404) {
                setError("Order not found or you don't have permission to view it.");
            } else if (err.response?.status === 401 || err.response?.status === 403) {
                toast.error("Session expired or invalid. Please log in again.");
                logout(); // Log out client state
                router.push(`/login?redirect=/orders/${orderId}`);
            } else {
                setError(err.response?.data?.message || err.message || 'Could not load order details.');
            }

            setOrder(null);
        } finally {
            setIsLoading(false);
        }
    }, [orderId, isAuthenticated, logout, router]);

    // useEffect to fetch when component mounts or when auth state is ready
    useEffect(() => {
        if (!isAuthLoading && isAuthenticated) {
            fetchOrderDetails();
        } else if (!isAuthLoading && !isAuthenticated) {
            // Redirect if not logged in
            router.replace(`/login?redirect=/orders/${orderId}`);
        }
    }, [isAuthenticated, isAuthLoading, fetchOrderDetails, router, orderId]);

    // --- Render Logic ---
    if (isAuthLoading || (isLoading && !order && !error)) {
        return <LoadingSpinner />;
    }

    if (!isAuthenticated) {
        // Fallback if redirect hasn't happened yet
        return <div className="text-center py-10">Redirecting to login...</div>;
    }

    if (error) {
        // Display error (including 404 errors from fetch logic)
        return <ErrorMessage message={error} onRetry={fetchOrderDetails} />;
    }

    if (!order) {
        // Case where there's no error but also no data (rare)
        return <div className="text-center py-10">Order data is not available.</div>;
    }

    // --- Display order details ---
    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl">
            {/* Breadcrumbs */}
            <div className="mb-6 text-sm flex items-center flex-wrap gap-1 text-gray-500 dark:text-dark-text-secondary">
                <Link href="/" className="hover:text-orange-500">Home</Link> /
                <Link href="/orders/my-history" className="hover:text-orange-500"> Order History</Link> /
                <span className="font-medium text-gray-700 dark:text-dark-text"> Order #{order.orderId}</span>
            </div>

            <div className="bg-white dark:bg-dark-surface p-6 sm:p-8 rounded-lg shadow border dark:border-gray-700">
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b dark:border-gray-600 pb-4 mb-6 gap-3">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-dark-text">Order #{order.orderId}</h1>
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <FiCalendar className="mr-1.5" />
                            <span>Placed on: {formatDateTime(order.orderDate)}</span>
                        </div>
                    </div>
                    <OrderStatusBadge status={order.status} />
                </div>

                {/* Order Detail Information (Grid Layout) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 text-sm">
                    {/* Recipient Information */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-md">
                        <h3 className="font-semibold mb-2 text-gray-700 dark:text-gray-200 flex items-center">
                            <FiUser className="mr-2" />Recipient Information
                        </h3>
                        <p><strong>Name:</strong> {order.shippingRecipientName || order.userName}</p>
                        <p><strong>Email:</strong> {order.userEmail}</p>
                        <p><strong>Phone:</strong> {order.shippingPhone}</p>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-md">
                        <h3 className="font-semibold mb-2 text-gray-700 dark:text-gray-200 flex items-center">
                            <FiMapPin className="mr-2" />Shipping Address
                        </h3>
                        <p>{order.shippingStreet}</p>
                        <p>{order.shippingDistrict}, {order.shippingCity}</p>
                        <p>{order.shippingCountry}</p>
                    </div>

                    {/* Payment Information */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-md">
                        <h3 className="font-semibold mb-2 text-gray-700 dark:text-gray-200 flex items-center">
                            <FiDollarSign className="mr-2" />Payment Summary
                        </h3>
                        <p><strong>Method:</strong> {order.paymentMethod}</p>
                        <p><strong>Status:</strong> <span className="font-medium">{order.status.replace('_', ' ')}</span></p>
                        <p><strong>Total:</strong> <span className="font-bold text-lg text-orange-600">{formatCurrency(order.totalAmount)}</span></p>
                    </div>

                    {/* Notes (if any) */}
                    {order.notes && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-md md:col-span-1">
                            <h3 className="font-semibold mb-2 text-yellow-800 dark:text-yellow-300 flex items-center">
                                <FiInfo className="mr-2" />Customer Notes
                            </h3>
                            <p className="text-yellow-700 dark:text-yellow-200">{order.notes}</p>
                        </div>
                    )}
                </div>

                {/* Product List */}
                <div>
                    <h3 className="text-lg font-semibold mb-3 border-t dark:border-gray-600 pt-4">
                        Items Ordered ({order.orderItems?.length || 0})
                    </h3>
                    <div className="space-y-4">
                        {order.orderItems?.map((item) => (
                            <div key={item.orderItemId} className="flex items-center gap-4 border-b dark:border-gray-700 pb-4 last:border-b-0 last:pb-0">
                                <div className="w-16 h-20 flex-shrink-0 relative rounded overflow-hidden bg-gray-100 dark:bg-gray-700">
                                    <Image
                                        src={ '/sample_books.jpg'}
                                        alt={item.productTitle || 'Book'}
                                        fill
                                        style={{ objectFit: 'contain' }}
                                        sizes="64px"
                                        onError={(e) => { e.target.src = '/sample_books.jpg'; }}
                                    />
                                </div>
                                <div className="flex-grow">
                                    <p className="font-medium text-sm sm:text-base dark:text-dark-text line-clamp-2">{item.productTitle}</p>
                                    <p className="text-xs text-gray-500 dark:text-dark-text-secondary">by {item.productAuthor || 'N/A'}</p>
                                    <p className="text-xs text-gray-500 dark:text-dark-text-secondary mt-1">Price: {formatCurrency(item.priceAtPurchase)}</p>
                                </div>
                                <div className="text-right text-sm">
                                    <p className="text-gray-500 dark:text-dark-text-secondary">Qty: {item.quantity}</p>
                                    <p className="font-semibold mt-1">{formatCurrency(item.subtotal)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Back button */}
                <div className="mt-8 text-center">
                    <Link href="/orders/my-history" className="text-orange-600 hover:underline">
                        ← Back to Order History
                    </Link>
                </div>
            </div>
        </div>
    );
}
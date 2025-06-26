'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { vnpayService } from '@/services/vnpayService';
import { useCartStore } from '@/store/cartStore';

export default function PaymentResultPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [paymentResult, setPaymentResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const clearCartCount = useCartStore(state => state.clearCartCount);

    useEffect(() => {
        const processPaymentResult = async () => {
            try {
                // Lấy parameters từ URL
                const vnpResponseCode = searchParams.get('vnp_ResponseCode');
                const vnpTxnRef = searchParams.get('vnp_TxnRef');
                const vnpAmount = searchParams.get('vnp_Amount');
                const vnpOrderInfo = searchParams.get('vnp_OrderInfo');
                const vnpTransactionNo = searchParams.get('vnp_TransactionNo');
                const vnpBankCode = searchParams.get('vnp_BankCode');
                const vnpPayDate = searchParams.get('vnp_PayDate');

                if (!vnpResponseCode || !vnpTxnRef) {
                    throw new Error('Thiếu thông tin thanh toán');
                }

                // Validate response code
                const result = vnpayService.validateResponseCode(vnpResponseCode);

                // Kiểm tra kết quả từ backend
                const backendResult = await vnpayService.checkPaymentResult(vnpTxnRef, vnpResponseCode);

                setPaymentResult({
                    ...result,
                    txnRef: vnpTxnRef,
                    amount: vnpAmount ? (parseInt(vnpAmount) / 100) : null,
                    orderInfo: vnpOrderInfo,
                    transactionNo: vnpTransactionNo,
                    bankCode: vnpBankCode,
                    payDate: vnpPayDate,
                    backendMessage: backendResult
                });

                // Nếu thanh toán thành công, xóa giỏ hàng count
                if (result.success) {
                    clearCartCount();
                }

            } catch (error) {
                console.error('Error processing payment result:', error);
                setPaymentResult({
                    success: false,
                    message: 'Có lỗi xảy ra khi xử lý kết quả thanh toán',
                    error: error.message
                });
            } finally {
                setLoading(false);
            }
        };

        processPaymentResult();
    }, [searchParams, clearCartCount]);

    const handleGoToOrders = () => {
        router.push('/orders');
    };

    const handleGoHome = () => {
        router.push('/');
    };

    const handleTryAgain = () => {
        router.push('/cart');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Đang xử lý kết quả thanh toán...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="bg-white rounded-lg shadow-md p-8">
                    {/* Icon và tiêu đề */}
                    <div className="text-center mb-6">
                        {paymentResult?.success ? (
                            <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                            </div>
                        ) : (
                            <div className="mx-auto h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                                <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </div>
                        )}

                        <h2 className={`text-2xl font-bold ${paymentResult?.success ? 'text-green-800' : 'text-red-800'}`}>
                            {paymentResult?.success ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
                        </h2>
                    </div>

                    {/* Thông tin chi tiết */}
                    <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600 mb-2">Thông báo:</p>
                            <p className={`font-medium ${paymentResult?.success ? 'text-green-700' : 'text-red-700'}`}>
                                {paymentResult?.message}
                            </p>
                        </div>

                        {paymentResult?.txnRef && (
                            <div className="border-t pt-4">
                                <dl className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <dt className="text-gray-600">Mã giao dịch:</dt>
                                        <dd className="font-medium">{paymentResult.transactionNo || 'N/A'}</dd>
                                    </div>

                                    {paymentResult.amount && (
                                        <div className="flex justify-between">
                                            <dt className="text-gray-600">Số tiền:</dt>
                                            <dd className="font-medium">{paymentResult.amount.toLocaleString('vi-VN')} VNĐ</dd>
                                        </div>
                                    )}

                                    {paymentResult.bankCode && (
                                        <div className="flex justify-between">
                                            <dt className="text-gray-600">Ngân hàng:</dt>
                                            <dd className="font-medium">{paymentResult.bankCode}</dd>
                                        </div>
                                    )}

                                    {paymentResult.payDate && (
                                        <div className="flex justify-between">
                                            <dt className="text-gray-600">Thời gian:</dt>
                                            <dd className="font-medium">
                                                {new Date(
                                                    paymentResult.payDate.substring(0, 4) + '-' +
                                                    paymentResult.payDate.substring(4, 6) + '-' +
                                                    paymentResult.payDate.substring(6, 8) + 'T' +
                                                    paymentResult.payDate.substring(8, 10) + ':' +
                                                    paymentResult.payDate.substring(10, 12) + ':' +
                                                    paymentResult.payDate.substring(12, 14)
                                                ).toLocaleString('vi-VN')}
                                            </dd>
                                        </div>
                                    )}
                                </dl>
                            </div>
                        )}
                    </div>

                    {/* Buttons */}
                    <div className="mt-8 space-y-3">
                        {paymentResult?.success ? (
                            <>
                                <button
                                    onClick={handleGoToOrders}
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                >
                                    Xem đơn hàng của tôi
                                </button>
                                <button
                                    onClick={handleGoHome}
                                    className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                >
                                    Về trang chủ
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={handleTryAgain}
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                >
                                    Thử lại
                                </button>
                                <button
                                    onClick={handleGoHome}
                                    className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                >
                                    Về trang chủ
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
} 
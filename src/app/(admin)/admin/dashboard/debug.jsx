'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import axiosInstance from '@/lib/axiosInstance';
import { useAuthStore } from '@/store/authStore';
import { FiCheckCircle, FiAlertCircle, FiClock, FiArrowRight, FiInfo } from 'react-icons/fi';

export default function ApiDebugPage() {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const { accessToken, user } = useAuthStore();

    const apiEndpoints = [
        { name: 'Public Test', url: '/api/test/hello-public', method: 'GET', expectAuth: false },
        { name: 'Dashboard Stats', url: '/api/admin/dashboard/stats', method: 'GET', expectAuth: true },
        { name: 'Orders List', url: '/api/admin/orders', method: 'GET', expectAuth: true, params: { page: 0, size: 5 } },
        { name: 'Products List', url: '/api/admin/products', method: 'GET', expectAuth: true, params: { page: 0, size: 5 } },
        { name: 'Top Products', url: '/api/admin/products/top-selling', method: 'GET', expectAuth: true },
        { name: 'Users List', url: '/api/admin/users', method: 'GET', expectAuth: true, params: { page: 0, size: 5 } },
    ];

    const testEndpoints = async () => {
        setLoading(true);
        setResults([]);

        for (const endpoint of apiEndpoints) {
            try {
                console.log(`Kiểm tra endpoint: ${endpoint.name} (${endpoint.url})`);
                const startTime = Date.now();

                const response = await axiosInstance({
                    method: endpoint.method,
                    url: endpoint.url,
                    params: endpoint.params || {}
                });

                const endTime = Date.now();
                const responseTime = endTime - startTime;

                console.log(`Kết quả: ${endpoint.name}`, response.data);

                setResults(prev => [...prev, {
                    name: endpoint.name,
                    url: endpoint.url,
                    status: 'success',
                    statusCode: response.status,
                    responseTime,
                    responseData: response.data,
                    expectAuth: endpoint.expectAuth
                }]);
            } catch (error) {
                console.error(`Lỗi với endpoint ${endpoint.name}:`, error);

                setResults(prev => [...prev, {
                    name: endpoint.name,
                    url: endpoint.url,
                    status: 'error',
                    statusCode: error.response?.status || 'unknown',
                    errorMessage: error.message,
                    errorDetail: error.response?.data || {},
                    expectAuth: endpoint.expectAuth
                }]);
            }
        }

        setLoading(false);
    };

    useEffect(() => {
        // Tự động chạy test khi trang được tải
        testEndpoints();
    }, []);

    return (
        <div className="p-6 space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Kiểm tra API Endpoint</h1>

                <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <h2 className="text-lg font-semibold mb-2">Thông tin xác thực</h2>
                    <p><strong>Có token:</strong> {accessToken ? '✅ Có' : '❌ Không'}</p>
                    {accessToken && (
                        <p className="text-xs font-mono mt-1 text-gray-600 dark:text-gray-400">
                            {accessToken.substring(0, 20)}...
                        </p>
                    )}
                    <p><strong>User:</strong> {user?.name || 'Không đăng nhập'}</p>
                    <p><strong>Quyền admin:</strong> {user?.roles?.includes('ROLE_ADMIN') ? '✅ Có' : '❌ Không'}</p>
                </div>

                <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-lg">
                    <h2 className="text-lg font-semibold mb-2 flex items-center">
                        <FiInfo className="mr-2" />
                        Cấu hình API
                    </h2>
                    <p><strong>Base URL:</strong> {axiosInstance.defaults.baseURL}</p>
                    <p className="mt-2"><strong>Cấu trúc endpoint:</strong></p>
                    <ul className="mt-1 pl-6 list-disc">
                        <li>Public: <code className="bg-blue-100 dark:bg-blue-900/30 px-1 rounded">/api/products</code>, <code className="bg-blue-100 dark:bg-blue-900/30 px-1 rounded">/api/categories</code></li>
                        <li>Admin: <code className="bg-blue-100 dark:bg-blue-900/30 px-1 rounded">/api/admin/*</code> (yêu cầu xác thực ROLE_ADMIN)</li>
                    </ul>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        ⚠️ <strong>Lưu ý:</strong> Tất cả các API đều yêu cầu tiền tố <code className="bg-gray-200 dark:bg-gray-800 px-1 rounded">/api/</code>
                    </p>
                </div>

                <button
                    onClick={testEndpoints}
                    disabled={loading}
                    className={`px-4 py-2 rounded-md ${loading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-orange-600 hover:bg-orange-700'
                        } text-white`}
                >
                    {loading ? 'Đang kiểm tra...' : 'Kiểm tra lại'}
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Kết quả kiểm tra</h2>

                {loading ? (
                    <div className="flex items-center justify-center p-8">
                        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="ml-2">Đang kiểm tra...</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {results.map((result, index) => (
                            <div
                                key={index}
                                className={`p-4 rounded-lg border ${result.status === 'success'
                                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                                    }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-bold flex items-center">
                                            {result.status === 'success' ? (
                                                <FiCheckCircle className="mr-1 text-green-500" />
                                            ) : (
                                                <FiAlertCircle className="mr-1 text-red-500" />
                                            )}
                                            {result.name}
                                        </h3>
                                        <p className="text-sm font-mono">{result.method || 'GET'} {result.url}</p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs rounded-full ${result.status === 'success'
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                        }`}>
                                        {result.status === 'success' ? `${result.statusCode} OK` : `${result.statusCode} Error`}
                                    </span>
                                </div>

                                {result.status === 'success' && (
                                    <div className="mt-2">
                                        <p className="text-xs flex items-center text-gray-500 dark:text-gray-400">
                                            <FiClock className="mr-1" /> Thời gian phản hồi: {result.responseTime}ms
                                        </p>
                                        <details className="mt-2">
                                            <summary className="cursor-pointer text-sm text-orange-600 dark:text-orange-400">
                                                Xem dữ liệu phản hồi
                                            </summary>
                                            <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs overflow-auto max-h-40">
                                                {JSON.stringify(result.responseData, null, 2)}
                                            </pre>
                                        </details>
                                    </div>
                                )}

                                {result.status === 'error' && (
                                    <div className="mt-2">
                                        <p className="text-sm text-red-600 dark:text-red-400">
                                            {result.errorMessage}
                                        </p>
                                        {Object.keys(result.errorDetail).length > 0 && (
                                            <details className="mt-2">
                                                <summary className="cursor-pointer text-sm text-orange-600 dark:text-orange-400">
                                                    Xem chi tiết lỗi
                                                </summary>
                                                <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs overflow-auto max-h-40">
                                                    {JSON.stringify(result.errorDetail, null, 2)}
                                                </pre>
                                            </details>
                                        )}
                                    </div>
                                )}

                                {result.expectAuth && (
                                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                        <FiArrowRight className="inline mr-1" />
                                        Endpoint này cần quyền xác thực
                                    </div>
                                )}
                            </div>
                        ))}

                        {results.length === 0 && !loading && (
                            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                                Chưa có kết quả kiểm tra nào
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
} 
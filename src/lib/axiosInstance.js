// src/lib/axiosInstance.js
import axios from 'axios';
import { useAuthStore } from '@/store/authStore'; // *** IMPORT AUTH STORE ***

// Sử dụng URL đầy đủ thay vì biến môi trường
// const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
const apiBaseUrl = 'http://localhost:8080';  // Quay lại URL gốc, không thêm /api

// IMPORTANT: Set this to true to bypass authentication completely for API calls
// This should match the same setting in admin layout
const FORCE_BYPASS_AUTH = false; // Set to false in production

const axiosInstance = axios.create({
  baseURL: apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // Gửi cookies với các request cross-domain
});

// Thêm hàm debug cho requests API
const DEBUG_API = true; // Đặt thành false để tắt log
function logApiCall(method, url, headers, data = null) {
  if (!DEBUG_API) return;
  
  console.group(`🌐 API Call (${method}): ${url}`);
  console.log('📝 Headers:', headers);
  if (data) console.log('📦 Data:', data);
  
  const token = headers?.Authorization;
  if (token) {
    console.log('🔑 Token present:', token.substring(0, 15) + '...');
    try {
      // Log phần payload của token để debug
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        console.log('👤 Token payload:', payload);
        
        // Kiểm tra hết hạn
        if (payload.exp) {
          const expiryDate = new Date(payload.exp * 1000);
          const now = new Date();
          console.log(`⏱️ Token expires: ${expiryDate.toLocaleString()} (${expiryDate > now ? 'Valid' : 'EXPIRED'})`);
        }
      }
    } catch (e) {
      console.log('Could not decode token:', e);
    }
  } else {
    console.log('⚠️ No token present in request');
  }
  
  console.groupEnd();
}

// --- Request Interceptor ---
axiosInstance.interceptors.request.use(
  (config) => {
    // Tự động thêm prefix /api/ vào các URL nếu chưa có
    if (config.url && !config.url.startsWith('/api/') && !config.url.startsWith('http')) {
      console.log(`Interceptor: Adding /api prefix to route: ${config.url}`);
      config.url = `/api${config.url.startsWith('/') ? '' : '/'}${config.url}`;
    }
    
    // For admin routes in bypass mode, use a demo token or skip authentication
    if (FORCE_BYPASS_AUTH && config.url && 
        (config.url.includes('/admin/') || 
         config.url.includes('/users/') || 
         config.url.includes('/products/') ||
         config.url.includes('/orders/') ||
         config.url.includes('/dashboard/'))) {
      console.log(`Interceptor: Bypassing authentication for admin route: ${config.url}`);
      // Either skip token completely or use a mock token
      // config.headers['Authorization'] = 'Bearer mock-token-for-development';
      return config;
    }
    
    // Normal auth flow - only add token for non-refresh endpoints
    const token = useAuthStore.getState().accessToken;
    if (token && config.url) {
      console.log(`Adding auth token to request: ${config.url}`);
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Log request details
    logApiCall(config.method.toUpperCase(), config.url, config.headers, config.data);
    
    return config;
  },
  (error) => {
    console.error('Request Error Interceptor:', error);
    return Promise.reject(error);
  }
);

// --- Response Interceptor ---
// Biến để tránh vòng lặp refresh vô hạn
let isRefreshing = false;
// Hàng đợi chứa các request bị lỗi 401 trong khi đang refresh token
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Hàm chuyển hướng đến trang login
const redirectToLogin = () => {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    // Store the current URL to redirect back after login (optional)
    const currentPath = window.location.pathname;
    if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
      sessionStorage.setItem('redirectAfterLogin', currentPath);
    }
    
    // Redirect to login page
    window.location.href = '/login';
  }
};

axiosInstance.interceptors.response.use(
  (response) => response, // Trả về response nếu thành công (status 2xx)
  async (error) => {
    const originalRequest = error.config;
    
    // If in bypass mode and accessing admin routes, return mock successful response
    if (FORCE_BYPASS_AUTH && originalRequest.url && 
        (originalRequest.url.includes('/admin/') || 
         originalRequest.url.includes('/users/') || 
         originalRequest.url.includes('/products/') ||
         originalRequest.url.includes('/orders/') ||
         originalRequest.url.includes('/dashboard/'))) {
      console.log(`Interceptor: Using mock response for bypassed route: ${originalRequest.url}`);
      
      // Create a mock successful response based on the request URL
      // This prevents 401/403 errors during development when backend authentication is not working
      return Promise.resolve({
        data: getMockResponseData(originalRequest.url),
        status: 200,
        statusText: 'OK (MOCK)',
        headers: {},
        config: originalRequest
      });
    }

    // Xử lý lỗi 401 (Unauthorized) hoặc 403 (Forbidden) do token hết hạn
    if ((error.response?.status === 401 || error.response?.status === 403) 
        && !originalRequest._retry 
        && originalRequest.url !== '/api/auth/refresh') {
      console.log('Token expired or invalid. Attempting to refresh...');

      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          // When token is refreshed, retry with new token
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      // Mark as retrying and refreshing
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Trước khi refresh, kiểm tra xem người dùng đã đăng nhập chưa
        const user = useAuthStore.getState().user;
        if (!user) {
          console.error('Cannot refresh token: No user logged in');
          throw new Error('No user logged in');
        }

        // Call the refresh endpoint
        const response = await axiosInstance.post('/api/auth/refresh');
        const newToken = response.data.accessToken;
        
        // Update token in store
        useAuthStore.getState().setAccessToken(newToken);
        
        // Update auth header
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        
        // Process queued requests
        processQueue(null, newToken);
        
        // Retry original request
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Log the error
        console.error('Failed to refresh token:', refreshError);
        
        // Process queued requests with error
        processQueue(refreshError);
        
        // Logout user
        useAuthStore.getState().logout();
        
        // Redirect to login
        redirectToLogin();
        
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    // Trả về lỗi cho các trường hợp khác
    return Promise.reject(error);
  }
);

// Helper function to generate mock data based on request URL
function getMockResponseData(url) {
  // Dashboard stats
  if (url.includes('/dashboard/stats')) {
    return {
      totalProducts: 156,
      totalOrders: 74,
      totalUsers: 42,
      totalRevenue: 15750000,
      recentOrders: [
        { id: 'mock-1', orderId: 'mock-1', total: 250000, status: 'COMPLETED', createdAt: new Date().toISOString() },
        { id: 'mock-2', orderId: 'mock-2', total: 180000, status: 'PROCESSING', createdAt: new Date().toISOString() }
      ]
    };
  }
  
  // Orders list
  if (url.includes('/admin/orders') || url.includes('/orders')) {
    return {
      content: Array(5).fill().map((_, index) => ({
        id: `mock-order-${index + 1}`,
        orderId: `mock-order-${index + 1}`,
        orderNumber: `ORD-${10000 + index}`,
        total: 100000 + (index * 50000),
        totalAmount: 100000 + (index * 50000),
        status: ['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'][Math.floor(Math.random() * 4)],
        createdAt: new Date(Date.now() - (index * 86400000)).toISOString(),
        orderDate: new Date(Date.now() - (index * 86400000)).toISOString(),
        user: { name: 'Khách hàng mẫu', email: `customer${index + 1}@example.com` },
        customerName: 'Khách hàng mẫu',
        items: [{ quantity: 2, product: { title: 'Sách mẫu', price: 50000 } }]
      })),
      totalPages: 1,
      totalElements: 5,
      size: 10,
      number: 0
    };
  }
  
  // Products list
  if (url.includes('/admin/products') || url.includes('/products')) {
    const mockProducts = Array(5).fill().map((_, index) => ({
      id: `mock-product-${index + 1}`,
      title: `Sách mẫu ${index + 1}`,
      author: `Tác giả mẫu ${index + 1}`,
      price: 100000 + (index * 20000),
      imageUrl: '/product-placeholder.jpg',
      stock: 10 + index,
      stockQuantity: 10 + index,
      soldCount: 50 + (index * 10),
      createdAt: new Date(Date.now() - (index * 86400000)).toISOString()
    }));
    
    // If top-selling endpoint, return the array directly
    if (url.includes('/top-selling')) {
      return mockProducts;
    }
    
    // Otherwise return paginated format
    return {
      content: mockProducts,
      totalPages: 1,
      totalElements: 5,
      size: 10,
      number: 0
    };
  }
  
  // Users list
  if (url.includes('/admin/users') || url.includes('/users')) {
    return {
      content: Array(5).fill().map((_, index) => ({
        id: `mock-user-${index + 1}`,
        name: `Người dùng mẫu ${index + 1}`,
        email: `user${index + 1}@example.com`,
        roles: index === 0 ? ['ROLE_ADMIN', 'ROLE_USER'] : ['ROLE_USER'],
        createdAt: new Date(Date.now() - (index * 86400000)).toISOString()
      })),
      totalPages: 1,
      totalElements: 5,
      size: 10,
      number: 0
    };
  }
  
  // Default mock data for any other request
  return {
    status: "success",
    message: "Mock data for development",
    timestamp: new Date().toISOString()
  };
}

export default axiosInstance;
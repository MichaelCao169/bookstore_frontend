// src/lib/axiosInstance.js
import axios from 'axios';
import { useAuthStore } from '@/store/authStore'; // *** IMPORT AUTH STORE ***

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

const axiosInstance = axios.create({
  baseURL: apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
});

// --- Request Interceptor ---
axiosInstance.interceptors.request.use(
  (config) => {
    // Lấy token từ Zustand store
    const token = useAuthStore.getState().accessToken; // Dùng getState() để đọc state bên ngoài React component
    // console.log('Interceptor - Current Token:', token); // Debug
    // Gắn token vào header nếu tồn tại và không phải là request đến refresh endpoint
    if (token && config.url && !config.url.endsWith('/auth/refresh')) {
      config.headers['Authorization'] = `Bearer ${token}`;
      // console.log('Interceptor - Added Auth Header'); // Debug
    }
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


axiosInstance.interceptors.response.use(
  (response) => response, // Trả về response nếu thành công (status 2xx)
  async (error) => {
    const originalRequest = error.config;
    // console.log('Response Error - Status:', error.response?.status); // Debug
    // console.log('Response Error - URL:', originalRequest.url); // Debug

    // Chỉ xử lý lỗi 401 và không phải là request refresh token ban đầu VÀ request chưa được thử lại
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/refresh') {
       // console.log('Interceptor: Detected 401, not a retry, not refresh endpoint.'); // Debug

      if (isRefreshing) {
         // Nếu đang có request refresh khác chạy, thêm request lỗi này vào hàng đợi
         // console.log('Interceptor: Already refreshing, adding to queue.'); // Debug
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
           // Khi refresh xong, thử lại request này với token mới
           // console.log('Interceptor: Retrying request from queue with new token.'); // Debug
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return axiosInstance(originalRequest);
        }).catch(err => {
           // Nếu quá trình chờ refresh thất bại
           return Promise.reject(err);
        });
      }

      // Đánh dấu là đang retry và bắt đầu quá trình refresh
      originalRequest._retry = true;
      isRefreshing = true;
      console.log('Interceptor: Access token expired or invalid, attempting to refresh...');

      try {
        // Gọi API refresh (Backend tự đọc HttpOnly cookie)
        const refreshResponse = await axiosInstance.post('/auth/refresh');
        const newAccessToken = refreshResponse.data.accessToken; // Lấy token mới từ response
        console.log('Interceptor: Token refreshed successfully!');

        // Cập nhật token trong Zustand store
        useAuthStore.getState().setAccessToken(newAccessToken);

        // Cập nhật header mặc định cho các request sau này (tùy chọn)
        // axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;

        // Cập nhật header cho request gốc bị lỗi
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

        // Thực thi lại các request trong hàng đợi (nếu có) với token mới
        processQueue(null, newAccessToken);

        // Thử lại request gốc với token mới
        return axiosInstance(originalRequest);

      } catch (refreshError) {
        console.error('Interceptor: Failed to refresh token:', refreshError.response?.data || refreshError.message);
        // Xử lý lỗi khi refresh thất bại
        processQueue(refreshError, null); // Báo lỗi cho các request đang chờ
        useAuthStore.getState().logout(); // Gọi logout để xóa state client
        // TODO: Chuyển hướng về trang login một cách an toàn
        // Không dùng window.location ở đây vì có thể gây lỗi trong môi trường non-browser
        // Cần cơ chế redirect tốt hơn (ví dụ: event bus, hoặc kiểm tra state ở component)
        console.error("Redirecting to login due to refresh failure is needed here.");
        // return Promise.reject(refreshError); // Trả về lỗi gốc của refresh
        // Nên trả về lỗi gốc của request ban đầu để component gọi có thể xử lý
         return Promise.reject(error); // Trả về lỗi 401 gốc

      } finally {
        isRefreshing = false; // Đặt lại cờ sau khi hoàn tất (thành công hoặc thất bại)
      }
    } // Kết thúc xử lý 401

    // Trả về lỗi cho các trường hợp khác (không phải 401 hoặc là lỗi từ refresh)
    return Promise.reject(error);
  }
);


export default axiosInstance;
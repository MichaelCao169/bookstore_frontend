// src/store/authStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware'; // Import persist middleware

// Hàm helper để kiểm tra token hết hạn (ví dụ đơn giản)
// Cần thư viện như jwt-decode để làm chính xác hơn: npm install jwt-decode
// import { jwtDecode } from 'jwt-decode'; // Bỏ comment nếu cài jwt-decode
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    // --- CÁCH CHÍNH XÁC (Cần cài jwt-decode) ---
    // const decoded = jwtDecode(token);
    // const currentTime = Date.now() / 1000; // Giây
    // return decoded.exp < currentTime;
    // --- CÁCH TẠM THỜI (Không chính xác, chỉ để demo) ---
    // Giả sử token hết hạn sau 1 giờ (cần khớp với backend)
    // const decoded = JSON.parse(atob(token.split('.')[1])); // Giải mã payload tạm
    // const expirationTime = decoded.exp * 1000; // Chuyển sang mili giây
    // return Date.now() > expirationTime;
    // --- Bỏ qua kiểm tra hết hạn ở client nếu chỉ dựa vào refresh ---
     console.warn('Client-side token expiration check is simplified/disabled.');
     return false; // Tạm thời coi là không hết hạn ở client, dựa vào API và refresh
  } catch (error) {
    console.error("Error decoding token:", error);
    return true; // Coi là hết hạn nếu lỗi giải mã
  }
};

// Tạo store với persist middleware
export const useAuthStore = create(
  persist(
    (set, get) => ({
      // --- State ---
      accessToken: null,
      user: null, // Lưu thông tin user (id, name, email, roles)
      isAuthenticated: false,
      isLoading: true, // Ban đầu là true để chờ kiểm tra trạng thái từ localStorage/session

      // --- Actions ---
      // Hàm này sẽ được gọi khi login thành công
      login: (userData, token) => {
         console.log("AuthStore: Logging in user", userData);
         set({
           isAuthenticated: true,
           user: userData,
           accessToken: token,
           isLoading: false, // Đã xác định trạng thái
         });
         // Axios interceptor sẽ tự động dùng token mới này từ đây (cần sửa interceptor)
      },

      // Hàm này sẽ được gọi khi logout
      logout: () => {
        console.log("AuthStore: Logging out");
        set({
          accessToken: null,
          user: null,
          isAuthenticated: false,
          isLoading: false, // Đã xác định trạng thái
        });
        // Việc xóa HttpOnly refresh token cookie do backend xử lý khi gọi API logout
        // Interceptor cũng cần được cập nhật để không dùng token cũ nữa
      },

       // Hàm được gọi khi refresh token thành công
       setAccessToken: (token) => {
           console.log("AuthStore: Setting new access token");
           set({ accessToken: token, isLoading: false }); // Cập nhật token, đảm bảo isLoading là false
       },

      // Hàm kiểm tra trạng thái khi ứng dụng tải lần đầu
      // Nó sẽ được gọi tự động bởi middleware persist khi state được hydrate
      checkAuthState: () => {
        console.log("AuthStore: Checking auth state on load");
        const { accessToken } = get(); // Lấy state hiện tại (đã được load từ storage)
        if (accessToken && !isTokenExpired(accessToken)) {
           console.log("AuthStore: Token found and seems valid, setting authenticated");
           // Thông tin user đã được persist, không cần set lại ở đây trừ khi muốn fetch lại
          set({ isAuthenticated: true, isLoading: false });
        } else {
           console.log("AuthStore: No valid token found, setting unauthenticated");
           // Nếu token hết hạn hoặc không có, đảm bảo trạng thái là logout
           set({ accessToken: null, user: null, isAuthenticated: false, isLoading: false });
        }
      },

       // Hàm để đánh dấu hoàn tất kiểm tra trạng thái ban đầu
       finishLoading: () => {
           if (get().isLoading) {
                console.log("AuthStore: Initial auth check complete (no persisted state or token invalid)");
               set({ isLoading: false });
           }
       }
    }),
    {
      // Cấu hình persist middleware
      name: 'auth-storage', // Tên key trong localStorage
      storage: createJSONStorage(() => localStorage), // Dùng localStorage (hoặc sessionStorage)
      partialize: (state) => ({
        // Chỉ lưu những phần state này vào localStorage
        accessToken: state.accessToken,
        user: state.user,
        // Không cần lưu isAuthenticated, isLoading vì sẽ được tính toán lại khi load
      }),
      // Hàm này chạy sau khi state được hydrate (lấy từ storage)
       onRehydrateStorage: (state) => {
         console.log("AuthStore: Hydration finished.");
         // Gọi hàm kiểm tra trạng thái sau khi state được load
         // Dùng setTimeout để đảm bảo nó chạy sau khi quá trình hydrate hoàn tất hoàn toàn
         setTimeout(() => {
             useAuthStore.getState().checkAuthState();
         }, 0);
       },
        // Optional: Nếu state chưa được hydrate (ví dụ: lần đầu mở app)
        onHydrationStart: () => {
             console.log("AuthStore: Hydration starting...");
             // Đánh dấu đang loading
             useAuthStore.setState({ isLoading: true });
        },
         // Optional: Xử lý lỗi hydrate
         onHydrationError: (error) => {
             console.error("AuthStore: Hydration failed!", error);
             useAuthStore.getState().finishLoading(); // Kết thúc loading dù lỗi
         }
    }
  )
);

// Gọi hàm kiểm tra trạng thái ban đầu ngay sau khi store được tạo
// Điều này xử lý trường hợp không có state nào được lưu trong localStorage
// (ví dụ lần đầu chạy hoặc sau khi clear localStorage)
if (typeof window !== 'undefined' && !localStorage.getItem('auth-storage')) {
     setTimeout(() => {
          useAuthStore.getState().finishLoading();
     }, 0);
}

// Custom hook để dễ dàng truy cập state và actions (tùy chọn)
// export const useAuth = () => useAuthStore((state) => state);
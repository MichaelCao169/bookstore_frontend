import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Store này chủ yếu tập trung vào việc đếm số lượng item
// Dữ liệu chi tiết của giỏ hàng vẫn sẽ được fetch từ API khi vào trang Cart
export const useCartStore = create(
  persist(
    (set, get) => ({
      // State: chỉ cần lưu số lượng item khác nhau (không phải tổng quantity)
      // Hoặc lưu tổng quantity nếu bạn muốn hiển thị tổng số lượng sp
      itemCount: 0, // Số loại sản phẩm trong giỏ

      // Action: Set số lượng ban đầu (có thể gọi khi fetch cart lần đầu)
      setInitialCount: (count) => {
        console.log('CartStore: Setting initial count:', count);
        set({ itemCount: count });
      },

      // Action: Tăng số lượng (khi thêm item mới thành công)
      // Chúng ta không biết chắc chắn là item mới hay chỉ tăng số lượng
      // Nên cách an toàn nhất là fetch lại count từ API hoặc chỉ set lại khi vào trang Cart
      // Tạm thời tạo action đơn giản để tăng/giảm, nhưng cần đồng bộ với API
      incrementItemCount: () => {
           console.log('CartStore: Incrementing count (may need API sync)');
           set((state) => ({ itemCount: state.itemCount + 1 }));
      },

       // Action: Giảm số lượng (khi xóa item thành công)
       // Cần biết số lượng thực tế sau khi xóa
       decrementItemCount: () => {
            console.log('CartStore: Decrementing count (may need API sync)');
            set((state) => ({ itemCount: Math.max(0, state.itemCount - 1) }));
       },

      // Action: Xóa sạch giỏ hàng
      clearCartCount: () => {
        console.log('CartStore: Clearing cart count');
        set({ itemCount: 0 });
      },

        fetchCartCount: async () => {
         try {
              const axiosI = (await import('@/lib/axiosInstance')).default;
              const response = await axiosI.get('/cart'); 
              const count = response.data?.items?.length ?? 0; 
             console.log('CartStore: Fetched cart count:', count);
             set({ itemCount: count /*, isCountLoading: false */});
         } catch (error) {
             // Chỉ log lỗi, không nên gây crash app chỉ vì không lấy được count
              console.error("CartStore: Failed to fetch cart count", error.response?.data || error.message);
              // Nếu lỗi (ví dụ 401), có thể coi như giỏ hàng trống
              if (error.response?.status === 401) {
                   set({ itemCount: 0 /*, isCountLoading: false */});
              } else {
                   // Giữ nguyên count cũ hoặc set về 0 tùy logic
                   // set({ isCountLoading: false });
              }
         }
     }
    }),
    {
      name: 'cart-count-storage', // Tên key khác với auth-storage
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ itemCount: state.itemCount }), // Chỉ lưu itemCount
      
    }
  )
);


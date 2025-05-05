// src/store/wishlistStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      // State: Chỉ cần lưu số lượng item
      itemCount: 0,

       // Action: Set số lượng ban đầu (khi fetch wishlist)
      setInitialCount: (count) => {
        console.log('WishlistStore: Setting initial count:', count);
        set({ itemCount: count });
      },

      // Action: Tăng (khi thêm thành công)
      incrementItemCount: () => {
           console.log('WishlistStore: Incrementing count');
           set((state) => ({ itemCount: state.itemCount + 1 }));
      },

       // Action: Giảm (khi xóa thành công)
       decrementItemCount: () => {
            console.log('WishlistStore: Decrementing count');
            set((state) => ({ itemCount: Math.max(0, state.itemCount - 1) }));
       },

        // TODO: Có thể thêm action fetchWishlistCount tương tự Cart nếu muốn đồng bộ mạnh hơn
    }),
    {
      name: 'wishlist-count-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ itemCount: state.itemCount }),
    }
  )
);
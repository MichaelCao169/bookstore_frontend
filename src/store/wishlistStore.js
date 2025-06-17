// src/store/wishlistStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      // State: Chỉ cần lưu số lượng item và danh sách productId
      itemCount: 0,
      wishlistProductIds: new Set(),

       // Action: Set số lượng ban đầu (khi fetch wishlist)
      setInitialCount: (count) => {
        console.log('WishlistStore: Setting initial count:', count);
        set({ itemCount: count });
      },

      // Action: Set danh sách productId trong wishlist
      setWishlistProductIds: (productIds) => {
        console.log('WishlistStore: Setting wishlist product IDs:', productIds);
        set({ wishlistProductIds: new Set(productIds) });
      },

      // Action: Tăng (khi thêm thành công)
      incrementItemCount: () => {
           console.log('WishlistStore: Incrementing count');
           set((state) => ({ itemCount: state.itemCount + 1 }));
      },

      // Action: Thêm productId vào wishlist
      addProductToWishlist: (productId) => {
        console.log('WishlistStore: Adding product to wishlist:', productId);
        set((state) => ({
          itemCount: state.itemCount + 1,
          wishlistProductIds: new Set([...state.wishlistProductIds, productId])
        }));
      },

       // Action: Giảm (khi xóa thành công)
       decrementItemCount: () => {
            console.log('WishlistStore: Decrementing count');
            set((state) => ({ itemCount: Math.max(0, state.itemCount - 1) }));
       },

       // Action: Xóa productId khỏi wishlist
       removeProductFromWishlist: (productId) => {
         console.log('WishlistStore: Removing product from wishlist:', productId);
         set((state) => {
           const newWishlistProductIds = new Set(state.wishlistProductIds);
           newWishlistProductIds.delete(productId);
           return {
             itemCount: Math.max(0, state.itemCount - 1),
             wishlistProductIds: newWishlistProductIds
           };
         });
       },

       // Action: Kiểm tra xem product có trong wishlist không
       isInWishlist: (productId) => {
         const state = get();
         return state.wishlistProductIds.has(productId);
       },

        // TODO: Có thể thêm action fetchWishlistCount tương tự Cart nếu muốn đồng bộ mạnh hơn
    }),
    {
      name: 'wishlist-count-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        itemCount: state.itemCount,
        wishlistProductIds: Array.from(state.wishlistProductIds)
      }),
      onRehydrateStorage: () => (state) => {
        if (state && state.wishlistProductIds) {
          state.wishlistProductIds = new Set(state.wishlistProductIds);
        }
      },
    }
  )
);
// src/store/authStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * A simple function to check if a token is expired
 * @param {string} token - JWT token
 * @returns {boolean} true if token is expired or invalid
 */
const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    // Decode the token (JWT consists of three parts separated by dots)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expTime = payload.exp * 1000; // Convert to milliseconds
    return Date.now() > expTime;
  } catch (error) {
    console.error("Error checking token expiration:", error);
    return true; // Consider invalid tokens as expired
  }
};

// Create authentication store with persistence
export const useAuthStore = create(
  persist(
    (set, get) => ({
      // Auth state
      accessToken: null,
      user: null,
      isAuthenticated: false,
      isLoading: true,
      
      // Login action
      login: (userData, token) => {
        console.log("Authentication store: Logging in user", userData.email);
        
        // Ensure userData has avatarUrl or use default
        if (!userData.avatarUrl || typeof userData.avatarUrl !== 'string') {
          console.log("Setting default avatar URL for user");
          userData.avatarUrl = '/default-avatar.png';
        }
        
        // Update auth state
        set({
          accessToken: token,
          user: userData,
          isAuthenticated: true,
          isLoading: false
        });
      },
      
      // Logout action
      logout: () => {
        console.log("Authentication store: Logging out user");
        set({
          accessToken: null,
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
      },
      
      // Update user information
      updateUser: (userData) => {
        console.log("Authentication store: Updating user information");
        
        // Ensure userData has avatarUrl or use existing/default
        if (!userData.avatarUrl || typeof userData.avatarUrl !== 'string') {
          userData.avatarUrl = get().user?.avatarUrl || '/default-avatar.png';
        }
        
        set({ user: { ...get().user, ...userData } });
      },
      
      // Update token
      setAccessToken: (token) => {
        console.log("Authentication store: Setting new access token");
        set({ accessToken: token });
      },
      
      // Check authentication state on app initialization
      checkAuthState: () => {
        console.log("Authentication store: Checking initial auth state");
        const { accessToken, user } = get();
        
        if (accessToken && !isTokenExpired(accessToken) && user) {
          console.log("Authentication store: Valid token found, user is authenticated");
          set({ isAuthenticated: true, isLoading: false });
        } else {
          console.log("Authentication store: No valid token or missing user data");
          set({
            accessToken: null,
            user: null, 
            isAuthenticated: false, 
            isLoading: false
          });
        }
      },
      
      // Finish loading state
      finishLoading: () => {
        if (get().isLoading) {
          console.log("Authentication store: Finishing loading state");
          set({ isLoading: false });
        }
      }
    }),
    {
      // Configuration for persistence
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      
      // Only persist these fields
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user
      }),
      
      // After rehydration, check auth state
      onRehydrateStorage: () => {
        console.log("Authentication store: Rehydration complete");
        return () => {
          useAuthStore.getState().checkAuthState();
        };
      }
    }
  )
);

// Check authentication state if no persisted state exists
if (typeof window !== 'undefined') {
  // Rút ngắn thời gian loading trạng thái ban đầu
  setTimeout(() => {
    useAuthStore.getState().checkAuthState();
    useAuthStore.getState().finishLoading();
  }, 100);
}

// Custom hook để dễ dàng truy cập state và actions (tùy chọn)
// export const useAuth = () => useAuthStore((state) => state);
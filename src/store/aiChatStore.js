import { create } from 'zustand';
import axiosInstance from '@/lib/axiosInstance'; 
import { toast } from 'react-toastify';

export const useAiChatStore = create((set, get) => ({
  // State
  isAiChatOpen: false,
  aiMessages: [], // Mảng chứa các tin nhắn, ví dụ: { id, text, sender: 'user' | 'ai' }
  isLoading: false, // Trạng thái chờ AI trả lời

  // Actions
  toggleAiChat: () => set((state) => ({ isAiChatOpen: !state.isAiChatOpen })),

  addMessage: (message) => {
    set((state) => ({
      aiMessages: [...state.aiMessages, message],
    }));
  },

  sendAiMessage: async (userMessageText) => {
    if (!userMessageText.trim()) return;

    // Thêm tin nhắn của người dùng vào danh sách
    get().addMessage({
      id: `user-${Date.now()}`,
      text: userMessageText,
      sender: 'user',
    });

    // Bắt đầu trạng thái loading
    set({ isLoading: true });

    try {
      const response = await axiosInstance.post('/ai-chat/send', {
        message: userMessageText,
      });

      const aiReply = response.data.reply;

      // Thêm tin nhắn trả lời của AI
      get().addMessage({
        id: `ai-${Date.now()}`,
        text: aiReply,
        sender: 'ai',
      });
    } catch (error) {
      console.error("Error fetching AI response:", error);
      const errorMessage = error.response?.data?.message || "Xin lỗi, đã có lỗi xảy ra.";
      toast.error(errorMessage);
      
      // Thêm tin nhắn lỗi vào UI
      get().addMessage({
        id: `error-${Date.now()}`,
        text: `Lỗi: ${errorMessage}`,
        sender: 'ai',
        isError: true, // Thêm cờ để có thể style khác
      });
    } finally {
      // Kết thúc trạng thái loading
      set({ isLoading: false });
    }
  },

  clearChat: () => set({ aiMessages: [] }),
}));
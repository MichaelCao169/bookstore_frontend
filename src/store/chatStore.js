// src/store/chatStore.js
import { create } from 'zustand';

// --- Placeholder Admin Info ---
export const ADMIN_EMAIL = 'admin@atomik.com';
export const ADMIN_USER_ID = 'admin_user_placeholder_id'; // Will be replaced by actual ID from backend
export const ADMIN_AVATAR = '/admin-avatar.png'; // Add a placeholder admin avatar in public/
export const ADMIN_NAME = 'Admin AtomicBooks';

// --- Initial Placeholder Messages ---
const initialUserMessages = [
  {
    id: 'msg1',
    senderId: ADMIN_USER_ID,
    senderName: ADMIN_NAME,
    senderAvatar: ADMIN_AVATAR,
    content: 'Chào bạn, AtomicBooks có thể giúp gì cho bạn?',
    timestamp: new Date(Date.now() - 60000 * 5).toISOString(), // 5 minutes ago
    type: 'text',
  },
  {
    id: 'msg2',
    senderId: 'user_placeholder_id', // Will be replaced by actual user ID
    senderName: 'Khách Hàng',
    senderAvatar: '/default-avatar.png',
    content: 'Tôi muốn hỏi về một cuốn sách.',
    timestamp: new Date(Date.now() - 60000 * 2).toISOString(), // 2 minutes ago
    type: 'text',
  },
];

// --- Placeholder Conversations for Admin ---
const initialAdminConversations = [
  {
    id: 'conv1',
    userId: 'user_placeholder_id_1',
    userName: 'Nguyễn Văn A',
    userAvatar: '/default-avatar.png',
    lastMessage: 'Cảm ơn bạn đã hỗ trợ!',
    lastMessageTimestamp: new Date(Date.now() - 60000 * 10).toISOString(),
    unreadCount: 2,
    isOnline: true,
  },
  {
    id: 'conv2',
    userId: 'user_placeholder_id_2',
    userName: 'Trần Thị B',
    userAvatar: '/default-avatar.png',
    lastMessage: 'Tôi sẽ quay lại sau.',
    lastMessageTimestamp: new Date(Date.now() - 60000 * 30).toISOString(),
    unreadCount: 0,
    isOnline: false,
  },
];


export const useChatStore = create((set, get) => ({
  // For User
  isChatOpen: false,
  userMessages: initialUserMessages, // Messages for the current user's chat with admin
  userUnreadCount: 1, // Example unread count for user

  // For Admin
  adminConversations: initialAdminConversations, // List of conversations admin has
  adminActiveConversationId: null, // ID of the conversation admin is currently viewing
  adminMessages: {}, // Object: { conversationId: [messages] }

  // Common
  isConnecting: false, // WebSocket connection status
  isConnected: false, // WebSocket connection status

  // --- User Actions ---
  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
  addUserMessage: (message) =>
    set((state) => {
      // Simple simulation of user ID
      const userId = state.userMessages.find(m => m.senderId !== ADMIN_USER_ID)?.senderId || 'user_dynamic_id';
      const userName = state.userMessages.find(m => m.senderId !== ADMIN_USER_ID)?.senderName || 'Bạn';
      const userAvatar = state.userMessages.find(m => m.senderId !== ADMIN_USER_ID)?.senderAvatar || '/default-avatar.png';

      const newMessage = {
        id: `msg${Date.now()}`,
        senderId: userId,
        senderName: userName,
        senderAvatar: userAvatar,
        timestamp: new Date().toISOString(),
        type: 'text',
        ...message, // content, type will be in message
      };
      return { userMessages: [...state.userMessages, newMessage] };
    }),
  addAdminReplyToUser: (messageContent) =>
    set((state) => {
      const newMessage = {
        id: `admin_reply_${Date.now()}`,
        senderId: ADMIN_USER_ID,
        senderName: ADMIN_NAME,
        senderAvatar: ADMIN_AVATAR,
        content: messageContent,
        timestamp: new Date().toISOString(),
        type: 'text',
      };
      return { userMessages: [...state.userMessages, newMessage], userUnreadCount: state.userUnreadCount + 1 };
    }),
  clearUserUnreadCount: () => set({ userUnreadCount: 0 }),

  // --- Admin Actions ---
  setAdminActiveConversation: (conversationId) => {
    set({ adminActiveConversationId: conversationId });
    // Simulate loading messages for this conversation
    if (!get().adminMessages[conversationId]) {
      // Placeholder messages for the selected admin conversation
      set((state) => ({
        adminMessages: {
          ...state.adminMessages,
          [conversationId]: [
            { id: 'adm_msg1', senderId: conversationId, senderName: 'Khách hàng X', content: 'Xin chào Admin!', timestamp: new Date(Date.now() - 60000 * 5).toISOString(), type: 'text', senderAvatar: '/default-avatar.png' },
            { id: 'adm_msg2', senderId: ADMIN_USER_ID, senderName: ADMIN_NAME, content: 'AtomicBooks xin chào, tôi có thể giúp gì cho bạn?', timestamp: new Date(Date.now() - 60000 * 3).toISOString(), type: 'text', senderAvatar: ADMIN_AVATAR },
          ]
        }
      }));
    }
    // Mark conversation as read
    set(state => ({
      adminConversations: state.adminConversations.map(conv =>
        conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
      )
    }));
  },
  addMessageToAdminConversation: (conversationId, message) =>
    set((state) => {
      const currentMessages = state.adminMessages[conversationId] || [];
      const newMessage = {
        id: `msg_adm_${Date.now()}`,
        senderId: ADMIN_USER_ID, // Assuming admin is replying
        senderName: ADMIN_NAME,
        senderAvatar: ADMIN_AVATAR,
        timestamp: new Date().toISOString(),
        type: 'text',
        ...message,
      };
      return {
        adminMessages: {
          ...state.adminMessages,
          [conversationId]: [...currentMessages, newMessage],
        },
      };
    }),
  receiveUserMessageInAdmin: (userId, userName, userAvatar, messageContent) =>
    set(state => {
      let conversation = state.adminConversations.find(conv => conv.userId === userId);
      let newConversations = [...state.adminConversations];
      let newMessagesForConversation = state.adminMessages[conversation?.id] || [];

      const newMessage = {
        id: `user_msg_${Date.now()}`,
        senderId: userId,
        senderName: userName,
        senderAvatar: userAvatar,
        content: messageContent,
        timestamp: new Date().toISOString(),
        type: 'text'
      };

      if (conversation) {
        // Update existing conversation
        newConversations = newConversations.map(conv =>
          conv.id === conversation.id
            ? { ...conv, lastMessage: messageContent, lastMessageTimestamp: newMessage.timestamp, unreadCount: (state.adminActiveConversationId === conv.id ? 0 : (conv.unreadCount || 0) + 1) }
            : conv
        );
        newMessagesForConversation = [...newMessagesForConversation, newMessage];
      } else {
        // Create new conversation
        conversation = {
          id: `conv_${userId}`,
          userId,
          userName,
          userAvatar,
          lastMessage: messageContent,
          lastMessageTimestamp: newMessage.timestamp,
          unreadCount: 1,
          isOnline: true, // Assume online when new message arrives
        };
        newConversations = [conversation, ...newConversations]; // Add to top
        newMessagesForConversation = [newMessage];
      }

      return {
        adminConversations: newConversations,
        adminMessages: {
          ...state.adminMessages,
          [conversation.id]: newMessagesForConversation,
        },
      };
    }),


  // --- Common Actions ---
  setConnecting: (status) => set({ isConnecting: status }),
  setConnected: (status) => set({ isConnected: status }),
}));
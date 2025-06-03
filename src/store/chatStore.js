// src/store/chatStore.js
import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './authStore';
import webSocketManager from '@/lib/websocketManager';

// --- API Base URL ---
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// --- Admin Info ---
export const ADMIN_EMAIL = 'admin@atomik.com';
export const ADMIN_NAME = 'Admin AtomicBooks';
export const ADMIN_AVATAR = '/admin-avatar.png';

export const useChatStore = create((set, get) => ({
  // For User
  isChatOpen: false,
  userConversation: null, // Current user's conversation with admin
  userMessages: [], // Messages for the current user's chat with admin
  userUnreadCount: 0, // Unread count for user

  // For Admin
  adminConversations: [], // List of conversations admin has
  adminActiveConversationId: null, // ID of the conversation admin is currently viewing
  adminMessages: {}, // Object: { conversationId: [messages] }
  
  // Common
  isConnecting: false, // WebSocket connection status
  isConnected: false, // WebSocket connection status
  currentUser: null, // Current logged in user

  // --- WebSocket Connection ---
  connectWebSocket: async (token) => {
    try {
      const user = get().currentUser;
      if (!user) {
        console.warn('WebSocket: No current user set');
        return;
      }

      // Setup status change listener to sync connection status
      webSocketManager.addStatusChangeListener((status) => {
        set({
          isConnecting: status.isConnecting,
          isConnected: status.isConnected
        });
      });

      // Setup message listeners
      webSocketManager.addMessageListener('customer', (messageData) => {
        get().receiveMessage(messageData);
      });

      webSocketManager.addMessageListener('admin', (messageData) => {
        get().receiveAdminMessage(messageData);
      });

      // Connect using WebSocketManager
      await webSocketManager.connect(token, user);
    } catch (error) {
      console.error('WebSocket: Connection failed:', error);
      set({ isConnecting: false, isConnected: false });
    }
  },

  disconnectWebSocket: () => {
    console.log('WebSocket: Disconnecting...');
    
    // Remove message listeners
    webSocketManager.removeMessageListener('customer', get().receiveMessage);
    webSocketManager.removeMessageListener('admin', get().receiveAdminMessage);
    
    // Disconnect
    webSocketManager.disconnect();
    
    set({ isConnected: false, isConnecting: false });
  },

  setCurrentUser: (user) => {
    set({ currentUser: user });
  },

  // --- User Actions ---
  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),

  // Load user conversation
  loadUserConversation: async () => {
    try {
      const token = useAuthStore.getState().accessToken;
      const response = await axios.get(`${API_BASE_URL}/chat/customer/conversation`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      set({ 
        userConversation: response.data,
        userMessages: response.data.recentMessages || [],
        userUnreadCount: response.data.unreadCountCustomer || 0
      });
    } catch (error) {
      console.error('Error loading user conversation:', error);
    }
  },
  // Send message from customer
  sendUserMessage: async (messageData) => {
    try {
      const token = useAuthStore.getState().accessToken;
      
      // Prepare request based on message type
      let requestBody;
      if (messageData.type === 'file') {
        requestBody = {
          content: messageData.content,
          messageType: 'FILE',
          fileName: messageData.fileName,
          fileUrl: messageData.fileUrl,
          fileSize: parseInt(messageData.fileSize),
          contentType: messageData.contentType
        };
      } else {
        requestBody = {
          content: messageData.content || messageData,
          messageType: 'TEXT'
        };
      }

      const response = await axios.post(`${API_BASE_URL}/chat/customer/send`, 
        requestBody,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Sent user message, response:', response.data);

      // Add message to local state immediately
      set((state) => ({
        userMessages: [...state.userMessages, response.data]
      }));

      // Update conversation last message
      if (get().userConversation) {
        set((state) => ({
          userConversation: {
            ...state.userConversation,
            lastMessageContent: requestBody.content,
            lastMessageTimestamp: response.data.createdAt
          }
        }));
      }

      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  },

  // Receive message (from WebSocket)
  receiveMessage: (message) => {
    console.log('WebSocket: Received customer message:', message);
    console.log('WebSocket: Current user conversation ID:', get().userConversation?.id);
    console.log('WebSocket: Message conversation ID:', message.conversationId);
    console.log('WebSocket: Message isFromAdmin:', message.isFromAdmin);
    
    set((state) => {
      // Check if we have a conversation
      if (!state.userConversation) {
        console.log('WebSocket: No user conversation found, loading conversation first...');
        // Try to load user conversation if we don't have one
        setTimeout(() => get().loadUserConversation(), 500);
        return state;
      }
      
      // If message is for the current conversation
      if (message.conversationId === state.userConversation.id) {
        console.log('WebSocket: Adding message to user conversation:', message.conversationId);
        
        // Check if message already exists to prevent duplicates
        const messageExists = state.userMessages.some(msg => msg.id === message.id);
        if (messageExists) {
          console.log('WebSocket: Message already exists, skipping duplicate:', message.id);
          return state;
        }
        
        // Construct a properly formatted message object
        const formattedMessage = {
          ...message,
          id: message.id || `temp-${Date.now()}`,
          senderId: message.senderId,
          senderName: message.senderName,
          senderAvatar: message.senderAvatar,
          content: message.content,
          createdAt: message.createdAt || new Date().toISOString(),
          messageType: message.messageType || 'TEXT'
        };
        
        console.log('WebSocket: Formatted user message:', formattedMessage);
        
        return {
          userMessages: [...state.userMessages, formattedMessage],
          userUnreadCount: message.isFromAdmin ? state.userUnreadCount + 1 : state.userUnreadCount,
          userConversation: {
            ...state.userConversation,
            lastMessageContent: message.content,
            lastMessageTimestamp: message.createdAt || new Date().toISOString()
          }
        };
      } else {
        console.log('WebSocket: Message not for current conversation:', {
          messageConvId: message.conversationId,
          currentConvId: state.userConversation.id
        });
        return state;
      }
    });
  },

  // Mark messages as read by customer
  markUserMessagesAsRead: async () => {
    try {
      const token = useAuthStore.getState().accessToken;
      const conversation = get().userConversation;
      
      if (conversation) {
        await axios.post(`${API_BASE_URL}/chat/customer/conversation/${conversation.id}/mark-read`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        set({ userUnreadCount: 0 });
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  },

  // --- Admin Actions ---
  // Load admin conversations
  loadAdminConversations: async () => {
    try {
      const token = useAuthStore.getState().accessToken;
      const response = await axios.get(`${API_BASE_URL}/chat/admin/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      set({ adminConversations: response.data });
    } catch (error) {
      console.error('Error loading admin conversations:', error);
    }
  },

  // Set active conversation for admin
  setAdminActiveConversation: async (conversationId) => {
    set({ adminActiveConversationId: conversationId });
    
    // Always refresh messages for this conversation to ensure we have latest
    try {
      const token = useAuthStore.getState().accessToken;
      const response = await axios.get(`${API_BASE_URL}/chat/admin/conversation/${conversationId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      set((state) => ({
        adminMessages: {
          ...state.adminMessages,
          [conversationId]: response.data.reverse() // Reverse to show chronological order
        }
      }));
    } catch (error) {
      console.error('Error loading conversation messages:', error);
    }
    
    // Mark as read
    try {
      const token = useAuthStore.getState().accessToken;
      await axios.post(`${API_BASE_URL}/chat/admin/conversation/${conversationId}/mark-read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      set(state => ({
        adminConversations: state.adminConversations.map(conv =>
          conv.id === conversationId ? { ...conv, unreadCountAdmin: 0 } : conv
        )
      }));
    } catch (error) {
      console.error('Error marking admin messages as read:', error);
    }
  },
  // Send message from admin
  sendAdminMessage: async (conversationId, messageData) => {
    try {
      const token = useAuthStore.getState().accessToken;
      
      // Prepare request based on message type
      let requestBody;
      if (typeof messageData === 'object' && messageData.type === 'file') {
        requestBody = {
          content: messageData.content,
          messageType: 'FILE',
          fileName: messageData.fileName,
          fileUrl: messageData.fileUrl,
          fileSize: parseInt(messageData.fileSize),
          contentType: messageData.contentType
        };
      } else {
        // Backward compatibility - if messageData is just a string
        requestBody = {
          content: typeof messageData === 'string' ? messageData : messageData.content,
          messageType: 'TEXT'
        };
      }
      
      const response = await axios.post(`${API_BASE_URL}/chat/admin/conversation/${conversationId}/send`,
        requestBody,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Sent admin message, response:', response.data);

      // Add message to local state
      set((state) => {
        const currentMessages = state.adminMessages[conversationId] || [];
        return {
          adminMessages: {
            ...state.adminMessages,
            [conversationId]: [...currentMessages, response.data]
          }
        };
      });

      // Update conversation in list
      set(state => ({
        adminConversations: state.adminConversations.map(conv =>
          conv.id === conversationId 
            ? { ...conv, lastMessageContent: requestBody.content, lastMessageTimestamp: response.data.createdAt }
            : conv
        )
      }));

      return response.data;
    } catch (error) {
      console.error('Error sending admin message:', error);
      return null;
    }
  },

  // Receive message in admin (from WebSocket)
  receiveAdminMessage: (message) => {
    console.log('WebSocket: Received admin message:', message);
    console.log('WebSocket: Current admin active conversation:', get().adminActiveConversationId);
    console.log('WebSocket: Message conversation ID:', message.conversationId);
    
    set(state => {
      // Ensure we have a properly formatted message
      const formattedMessage = {
        ...message,
        id: message.id || `temp-${Date.now()}`,
        senderId: message.senderId,
        senderName: message.senderName,
        senderAvatar: message.senderAvatar,
        content: message.content,
        createdAt: message.createdAt || new Date().toISOString(),
        messageType: message.messageType || 'TEXT'
      };
      
      console.log('WebSocket: Formatted admin message:', formattedMessage);
      
      // Update conversation list
      let updatedConversations = [...state.adminConversations];
      const existingConvIndex = updatedConversations.findIndex(conv => conv.id === message.conversationId);
      
      if (existingConvIndex >= 0) {
        // Update existing conversation
        console.log('WebSocket: Updating existing conversation:', message.conversationId);
        updatedConversations[existingConvIndex] = {
          ...updatedConversations[existingConvIndex],
          lastMessageContent: message.content,
          lastMessageTimestamp: message.createdAt || new Date().toISOString(),
          unreadCountAdmin: state.adminActiveConversationId === message.conversationId 
            ? 0 
            : (updatedConversations[existingConvIndex].unreadCountAdmin || 0) + 1
        };
      } else {
        // If conversation doesn't exist in list, need to reload conversations
        console.log('WebSocket: New conversation detected, refreshing conversation list');
        setTimeout(() => get().loadAdminConversations(), 1000);
      }

      // Add message to conversation messages - ALWAYS add it, create array if needed
      let updatedMessages = { ...state.adminMessages };
      if (!updatedMessages[message.conversationId]) {
        // If conversation messages not loaded, initialize with this message
        console.log('WebSocket: Initializing messages for new conversation:', message.conversationId);
        updatedMessages[message.conversationId] = [formattedMessage];
      } else {
        // Check for duplicate message before adding
        const messageExists = updatedMessages[message.conversationId].some(msg => msg.id === message.id);
        if (!messageExists) {
          console.log('WebSocket: Adding message to admin conversation:', message.conversationId);
          updatedMessages[message.conversationId] = [
            ...updatedMessages[message.conversationId],
            formattedMessage
          ];
        } else {
          console.log('WebSocket: Message already exists, skipping duplicate:', message.id);
        }
      }

      return {
        adminConversations: updatedConversations,
        adminMessages: updatedMessages
      };
    });
  },

  // --- Common Actions ---
  setConnecting: (status) => set({ isConnecting: status }),
  setConnected: (status) => set({ isConnected: status }),

  // Initialize chat for user
  initializeUserChat: async (user) => {
    console.log('WebSocket: Initializing user chat for:', user.email);
    set({ currentUser: user });
    
    // Load user conversation first
    if (user.roles && user.roles.includes('ROLE_CUSTOMER')) {
      await get().loadUserConversation();
    }
    
    // Connect WebSocket
    const token = useAuthStore.getState().accessToken;
    if (token) {
      console.log('WebSocket: Starting user chat connection');
      await get().connectWebSocket(token);
    }
  },

  // Initialize chat for admin
  initializeAdminChat: async (user) => {
    console.log('WebSocket: Initializing admin chat for:', user.email);
    set({ currentUser: user });
    
    // Always load admin conversations first
    if (user.roles && user.roles.includes('ROLE_ADMIN')) {
      await get().loadAdminConversations();
    }
    
    // Connect WebSocket
    const token = useAuthStore.getState().accessToken;
    if (token) {
      console.log('WebSocket: Starting admin chat connection');
      await get().connectWebSocket(token);
    }
  },

  // Clean up when user logs out
  cleanup: () => {
    console.log('WebSocket: Cleaning up chat store');
    
    get().disconnectWebSocket();
    set({
      isChatOpen: false,
      userConversation: null,
      userMessages: [],
      userUnreadCount: 0,
      adminConversations: [],
      adminActiveConversationId: null,
      adminMessages: {},
      currentUser: null
    });
  }
}));

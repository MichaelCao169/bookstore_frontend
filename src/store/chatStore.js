// src/store/chatStore.js
import { create } from 'zustand';
import axios from 'axios';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuthStore } from './authStore';

// --- API Base URL ---
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// --- WebSocket Connection ---
let stompClient = null;

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
  connectWebSocket: (token) => {
    if (stompClient && stompClient.connected) {
      return; // Already connected
    }

    set({ isConnecting: true });    // Create a new STOMP client with SockJS
    stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      debug: function (str) {
        console.log('STOMP: ' + str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });    stompClient.onConnect = () => {
      console.log('Connected to WebSocket');
      set({ isConnected: true, isConnecting: false });
      
      const user = get().currentUser;
      if (user) {
        if (user.roles && user.roles.includes('ROLE_CUSTOMER')) {
          // Subscribe to customer messages
          stompClient.subscribe(`/topic/customer/${user.id}/messages`, (message) => {
            const messageData = JSON.parse(message.body);
            get().receiveMessage(messageData);
          });
        } else if (user.roles && user.roles.includes('ROLE_ADMIN')) {
          // Subscribe to admin messages
          stompClient.subscribe('/topic/admin/messages', (message) => {
            const messageData = JSON.parse(message.body);
            get().receiveAdminMessage(messageData);
          });
        }
      }
    };

    stompClient.onStompError = (frame) => {
      console.error('WebSocket connection error:', frame.headers['message']);
      console.error('Additional details:', frame.body);
      set({ isConnected: false, isConnecting: false });
    };

    stompClient.onWebSocketError = (error) => {
      console.error('WebSocket error:', error);
      set({ isConnected: false, isConnecting: false });
    };

    stompClient.activate();
  },
  disconnectWebSocket: () => {
    if (stompClient) {
      stompClient.deactivate();
      stompClient = null;
    }
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
  sendUserMessage: async (content) => {
    try {
      const token = useAuthStore.getState().accessToken;
      const response = await axios.post(`${API_BASE_URL}/chat/customer/send`, 
        { content, messageType: 'TEXT' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Add message to local state immediately
      set((state) => ({
        userMessages: [...state.userMessages, response.data]
      }));

      // Update conversation last message
      if (get().userConversation) {
        set((state) => ({
          userConversation: {
            ...state.userConversation,
            lastMessageContent: content,
            lastMessageTimestamp: response.data.createdAt
          }
        }));
      }

    } catch (error) {
      console.error('Error sending message:', error);
    }
  },

  // Receive message (from WebSocket)
  receiveMessage: (message) => {
    set((state) => {
      // If message is for the current conversation
      if (state.userConversation && message.conversationId === state.userConversation.id) {
        return {
          userMessages: [...state.userMessages, message],
          userUnreadCount: message.isFromAdmin ? state.userUnreadCount + 1 : state.userUnreadCount,
          userConversation: {
            ...state.userConversation,
            lastMessageContent: message.content,
            lastMessageTimestamp: message.createdAt
          }
        };
      }
      return state;
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
      // Load messages for this conversation if not already loaded
    const state = get();
    if (!state.adminMessages[conversationId]) {
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
  sendAdminMessage: async (conversationId, content) => {
    try {
      const token = useAuthStore.getState().accessToken;
      const response = await axios.post(`${API_BASE_URL}/chat/admin/conversation/${conversationId}/send`,
        { content, messageType: 'TEXT' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

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
            ? { ...conv, lastMessageContent: content, lastMessageTimestamp: response.data.createdAt }
            : conv
        )
      }));

    } catch (error) {
      console.error('Error sending admin message:', error);
    }
  },

  // Receive message in admin (from WebSocket)
  receiveAdminMessage: (message) => {
    set(state => {
      // Update conversation list
      let updatedConversations = [...state.adminConversations];
      const existingConvIndex = updatedConversations.findIndex(conv => conv.id === message.conversationId);
      
      if (existingConvIndex >= 0) {
        // Update existing conversation
        updatedConversations[existingConvIndex] = {
          ...updatedConversations[existingConvIndex],
          lastMessageContent: message.content,
          lastMessageTimestamp: message.createdAt,
          unreadCountAdmin: state.adminActiveConversationId === message.conversationId 
            ? 0 
            : (updatedConversations[existingConvIndex].unreadCountAdmin || 0) + 1
        };
      }

      // Add message to conversation messages if conversation is loaded
      let updatedMessages = { ...state.adminMessages };
      if (updatedMessages[message.conversationId]) {
        updatedMessages[message.conversationId] = [
          ...updatedMessages[message.conversationId],
          message
        ];
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
    set({ currentUser: user });
    
    // Connect WebSocket
    const token = useAuthStore.getState().accessToken;
    if (token) {
      get().connectWebSocket(token);
    }
      // Load user conversation
    if (user.roles && user.roles.includes('ROLE_CUSTOMER')) {
      await get().loadUserConversation();
    }
  },

  // Initialize chat for admin
  initializeAdminChat: async (user) => {
    set({ currentUser: user });
    
    // Connect WebSocket
    const token = useAuthStore.getState().accessToken;
    if (token) {
      get().connectWebSocket(token);
    }
      // Load admin conversations
    if (user.roles && user.roles.includes('ROLE_ADMIN')) {
      await get().loadAdminConversations();
    }
  },

  // Clean up when user logs out
  cleanup: () => {
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
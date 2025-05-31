// src/components/chat/ChatWindow.jsx
'use client';
import React, { useEffect, useRef, useCallback } from 'react';
import { FiX, FiLoader, FiAlertCircle, FiUserCircle } from 'react-icons/fi';
import { useChatStore, ADMIN_NAME, ADMIN_AVATAR } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import MessageItem from './MessageItem';
import ChatInput from './ChatInput';
import Image from 'next/image';

const ChatWindow = () => {
  const {
    isChatOpen,
    toggleChat,
    userMessages,
    userConversation,
    sendUserMessage,
    markUserMessagesAsRead,
    initializeUserChat,
    isConnecting,
    isConnected,
  } = useChatStore();
  const { user: currentUser, isAuthenticated } = useAuthStore();
  const messagesEndRef = useRef(null);
  const chatBodyRef = useRef(null);  // Initialize chat when component mounts and user is authenticated
  useEffect(() => {
    if (isAuthenticated && currentUser && currentUser.roles && currentUser.roles.includes('ROLE_CUSTOMER')) {
      initializeUserChat(currentUser);

      // Set up periodic refresh only when chat is open to reduce unnecessary requests
      const refreshInterval = setInterval(() => {
        if (isChatOpen && isAuthenticated) {
          console.log('ChatWindow: Refreshing user conversation data');
          useChatStore.getState().loadUserConversation();
        }
      }, 30000); // Reduced frequency: refresh every 30 seconds when chat is open

      // Connection check - only if not connected and not connecting
      const checkConnectionInterval = setInterval(() => {
        if (isAuthenticated && currentUser) {
          const { isConnected, isConnecting } = useChatStore.getState();
          if (!isConnected && !isConnecting) {
            console.log('ChatWindow: Connection check - attempting to reconnect...');
            initializeUserChat(currentUser);
          }
        }
      }, 30000); // Check every 30 seconds instead of 10

      // Clean up intervals on unmount
      return () => {
        clearInterval(refreshInterval);
        clearInterval(checkConnectionInterval);
      };
    }
  }, [isAuthenticated, currentUser, initializeUserChat, isChatOpen]);

  useEffect(() => {
    if (isChatOpen) {
      markUserMessagesAsRead();
      scrollToBottom();
    }
  }, [isChatOpen, userMessages, markUserMessagesAsRead]);

  const scrollToBottom = () => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }; const handleSendMessage = async (messageData) => {
    if (!isAuthenticated) {
      alert("Vui lòng đăng nhập để gửi tin nhắn.");
      return;
    }

    await sendUserMessage(messageData.content);
  };  if (!isChatOpen) return null;

  return (
    <>
      <div className="fixed bottom-20 right-6 w-[360px] h-[500px] bg-white dark:bg-gray-800 shadow-2xl rounded-lg flex flex-col border border-gray-200 dark:border-gray-700 z-[999] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <div className="flex items-center">
            <div className="relative w-10 h-10 mr-3 flex-shrink-0">
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <Image src={ADMIN_AVATAR} alt={ADMIN_NAME} fill className="object-cover rounded-full" />
              </div>
              {userConversation?.isAdminOnline && (
                <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-white dark:ring-gray-800"></span>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-100">{ADMIN_NAME}</h3>
              <p className={`text-xs ${userConversation?.isAdminOnline ? 'text-green-500 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                {isConnecting ? 'Đang kết nối...' : userConversation?.isAdminOnline ? 'Đang hoạt động' : 'Ngoại tuyến'}
              </p>
            </div>
          </div>
          <button
            onClick={toggleChat}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600"
            aria-label="Đóng chat"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Message Area */}
        <div ref={chatBodyRef} className="flex-grow p-4 space-y-3 overflow-y-auto bg-gray-50 dark:bg-gray-700/50">
          {isConnecting && (
            <div className="flex justify-center items-center h-full">
              <FiLoader className="animate-spin text-orange-500 text-2xl" />
            </div>
          )}
          {!isConnected && !isConnecting && userMessages.length === 0 && (
            <div className="flex flex-col justify-center items-center h-full text-center">
              <FiAlertCircle className="text-gray-400 dark:text-gray-500 text-3xl mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Không thể kết nối đến máy chủ chat.
              </p>
            </div>)}        {userMessages.map((msg, index) => {
              // Debug logging
              console.log('ChatWindow rendering message:', {
                msgId: msg.id,
                senderId: msg.senderId,
                currentUserId: currentUser?.id || currentUser?.userId,
                senderName: msg.senderName,
                isFromAdmin: msg.isFromAdmin,
                content: msg.content?.substring(0, 20) + '...'
              });

              return (
                <MessageItem
                  key={msg.id}
                  message={{
                    id: msg.id,
                    senderId: msg.senderId,
                    senderName: msg.senderName,
                    senderAvatar: msg.senderAvatar,
                    content: msg.content,
                    timestamp: msg.createdAt,
                    type: msg.messageType,
                    isFromAdmin: msg.isFromAdmin,
                    currentUserIsAdmin: currentUser?.roles?.includes('ROLE_ADMIN'),
                  }}
                  currentUserId={currentUser?.id || currentUser?.userId}
                />
              );
            })}
          <div ref={messagesEndRef} /> {/* For auto-scrolling */}
        </div>

        {/* Input Area */}
        <ChatInput onSendMessage={handleSendMessage} isSending={false /* Placeholder */} />
      </div>
    </>
  );
};

export default ChatWindow;
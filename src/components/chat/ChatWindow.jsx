// src/components/chat/ChatWindow.jsx
'use client';
import React, { useEffect, useRef, useCallback } from 'react';
import { FiX, FiLoader, FiAlertCircle, FiUserCircle } from 'react-icons/fi';
import { useChatStore, ADMIN_USER_ID, ADMIN_NAME, ADMIN_AVATAR } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import MessageItem from './MessageItem';
import ChatInput from './ChatInput';
import Image from 'next/image';

const ChatWindow = () => {
  const {
    isChatOpen,
    toggleChat,
    userMessages,
    addUserMessage,
    addAdminReplyToUser, // For simulation
    clearUserUnreadCount,
    isConnecting,
    isConnected,
  } = useChatStore();
  const { user: currentUser, isAuthenticated } = useAuthStore();
  const messagesEndRef = useRef(null);
  const chatBodyRef = useRef(null);

  // Simulate current user ID from auth store or placeholder
  const currentUserId = isAuthenticated && currentUser ? currentUser.id : 'user_dynamic_id';
  const currentUserName = isAuthenticated && currentUser ? currentUser.name : 'Bạn';
  const currentUserAvatar = isAuthenticated && currentUser ? currentUser.avatarUrl : '/default-avatar.png';

  useEffect(() => {
    if (isChatOpen) {
      clearUserUnreadCount();
      scrollToBottom();
    }
  }, [isChatOpen, userMessages, clearUserUnreadCount]);

  const scrollToBottom = () => {
    if (chatBodyRef.current) {
        chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  };

  const handleSendMessage = (messageData) => {
    if (!isAuthenticated) {
      alert("Vui lòng đăng nhập để gửi tin nhắn.");
      // Optionally redirect to login
      return;
    }
    // Add user's own avatar and name to the message
    const messageToSend = {
      ...messageData,
      senderId: currentUserId,
      senderName: currentUserName,
      senderAvatar: currentUserAvatar,
    };
    addUserMessage(messageToSend);

    // Simulate admin reply after a short delay (for placeholder)
    setTimeout(() => {
      addAdminReplyToUser(`Chúng tôi đã nhận được tin nhắn "${messageData.content.substring(0,20)}..." của bạn và sẽ phản hồi sớm!`);
    }, 1500);
  };

  if (!isChatOpen) return null;

  return (
    <div className="fixed bottom-20 right-6 w-[360px] h-[500px] bg-white dark:bg-gray-800 shadow-2xl rounded-lg flex flex-col border border-gray-200 dark:border-gray-700 z-[999] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full overflow-hidden mr-3 relative">
            <Image src={ADMIN_AVATAR} alt={ADMIN_NAME} fill className="object-cover" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">{ADMIN_NAME}</h3>
            <p className={`text-xs ${isConnected ? 'text-green-500 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
              {isConnecting ? 'Đang kết nối...' : isConnected ? 'Đang hoạt động' : 'Ngoại tuyến'}
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
          </div>
        )}
        {userMessages.map((msg) => (
          <MessageItem key={msg.id} message={msg} currentUserId={currentUserId} />
        ))}
        <div ref={messagesEndRef} /> {/* For auto-scrolling */}
      </div>

      {/* Input Area */}
      <ChatInput onSendMessage={handleSendMessage} isSending={false /* Placeholder */} />
    </div>
  );
};

export default ChatWindow;
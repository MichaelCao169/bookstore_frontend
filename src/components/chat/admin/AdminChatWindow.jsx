// src/components/chat/admin/AdminChatWindow.jsx
'use client';
import React, { useEffect, useRef } from 'react';
import { FiInfo, FiPaperclip } from 'react-icons/fi';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import MessageItem from '../MessageItem'; // Re-use
import ChatInput from '../ChatInput';   // Re-use
import Image from 'next/image';
import { FiMessageSquare } from 'react-icons/fi';

const AdminChatWindow = () => {
  const {
    adminActiveConversationId,
    adminConversations,
    adminMessages,
    sendAdminMessage,
  } = useChatStore();
  const { user: currentUser } = useAuthStore();
  const messagesEndRef = useRef(null);
  const chatBodyRef = useRef(null);

  const activeConversation = adminConversations.find(
    (conv) => conv.id === adminActiveConversationId
  );
  const messages = adminMessages[adminActiveConversationId] || [];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (chatBodyRef.current) {
        chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  };

  const handleSendMessage = async (messageData) => {
    if (!adminActiveConversationId) return;
    await sendAdminMessage(adminActiveConversationId, messageData.content);
  };

  if (!activeConversation) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center text-center p-6 bg-gray-50 dark:bg-gray-700/30">
        <FiMessageSquare size={48} className="text-gray-400 dark:text-gray-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Chọn một cuộc trò chuyện</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Chọn một cuộc trò chuyện từ danh sách bên trái để xem tin nhắn.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full overflow-hidden mr-3 relative">
            <Image
              src={activeConversation.userAvatar || '/default-avatar.png'}
              alt={activeConversation.userName || 'User Avatar'}
              fill className="object-cover"
            />
            {activeConversation.isOnline && (
              <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-white dark:ring-gray-800"></span>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">
              {activeConversation.userName}
            </h3>
            <p className={`text-xs ${activeConversation.isOnline ? 'text-green-500 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
              {activeConversation.isOnline ? 'Đang hoạt động' : 'Ngoại tuyến'}
            </p>
          </div>
        </div>
        <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600">
          <FiInfo size={20} />
        </button>
      </div>      {/* Message Area */}
      <div ref={chatBodyRef} className="flex-grow p-4 space-y-3 overflow-y-auto bg-gray-50 dark:bg-gray-700/50">
        {messages.map((msg) => (
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
            }} 
            currentUserId={currentUser?.id} 
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <ChatInput onSendMessage={handleSendMessage} isSending={false} />
    </div>
  );
};

export default AdminChatWindow;
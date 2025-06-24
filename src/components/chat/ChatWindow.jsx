'use client';
import React, { useEffect, useRef, useCallback, useState } from 'react';
import { FiX, FiLoader, FiAlertCircle, FiUserCircle } from 'react-icons/fi';
import { RiRobot2Line } from 'react-icons/ri';
import { useChatStore, ADMIN_NAME, ADMIN_AVATAR } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { useAiChatStore } from '@/store/aiChatStore';
import MessageItem from './MessageItem';
import ChatInput from './ChatInput';
import Image from 'next/image';
import BrandSpinner from '@/components/ui/BrandSpinner';

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
  const { isAiChatOpen, toggleAiChat } = useAiChatStore();
  const messagesEndRef = useRef(null);
  const chatBodyRef = useRef(null);
  const [isOfflineNoticeVisible, setIsOfflineNoticeVisible] = useState(true);  
  useEffect(() => {
    if (isAuthenticated && currentUser && currentUser.roles && currentUser.roles.includes('ROLE_CUSTOMER')) {
      initializeUserChat(currentUser);

      // Set up periodic refresh only when chat is open
      const refreshInterval = setInterval(() => {
        if (isChatOpen && isAuthenticated) {
          console.log('ChatWindow: Refreshing user conversation data');
          useChatStore.getState().loadUserConversation();
        }
      }, 30000); 

      // Connection check
      const checkConnectionInterval = setInterval(() => {
        if (isAuthenticated && currentUser) {
          const { isConnected, isConnecting } = useChatStore.getState();
          if (!isConnected && !isConnecting) {
            console.log('ChatWindow: Connection check - attempting to reconnect...');
            initializeUserChat(currentUser);
          }
        }
      }, 30000); 

      // Clean up intervals
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

    // Reset thông báo offline khi admin quay lại online hoặc khi mở lại chat
  useEffect(() => {
    if (userConversation?.isAdminOnline || isChatOpen) {
      setIsOfflineNoticeVisible(true);
    }
  }, [userConversation?.isAdminOnline, isChatOpen]);

  const scrollToBottom = () => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }; const handleSendMessage = async (messageData) => {
    if (!isAuthenticated) {
      alert("Vui lòng đăng nhập để gửi tin nhắn.");
      return;
    }

    await sendUserMessage(messageData);
  };

  const handleSwitchToAiChat = () => {
    // Đóng admin chat
    toggleChat();
    // Mở AI chat
    toggleAiChat();
  };

  const handleDismissOfflineNotice = () => {
    setIsOfflineNoticeVisible(false);
  }; if (!isChatOpen) return null;

  // Admin chat window ở bên phải màn hình, bên trái của các bubble chat
  const positionClass = "fixed bottom-20 right-20 w-[360px] h-[500px] bg-white dark:bg-gray-800 shadow-2xl rounded-lg flex flex-col border border-gray-200 dark:border-gray-700 z-[999] overflow-hidden transition-all duration-300 ease-in-out";

  return (
    <>
      <div className={positionClass}>
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

        {/* Admin Offline Notice */}
        {!isConnecting && userConversation && !userConversation.isAdminOnline && isOfflineNoticeVisible && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 relative">
            <button
              onClick={handleDismissOfflineNotice}
              className="absolute top-2 right-2 p-1 text-blue-400 dark:text-blue-500 hover:text-blue-600 dark:hover:text-blue-300 rounded-full hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
              aria-label="Đóng thông báo"
            >
              <FiX size={14} />
            </button>
            <div className="text-center pr-6">
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                Admin hiện đang ngoại tuyến
              </p>
              <button
                onClick={handleSwitchToAiChat}
                className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 underline hover:no-underline transition-colors"
              >
                <RiRobot2Line size={16} />
                Bạn có muốn chat với AI không?
              </button>
            </div>
          </div>
        )}

        {/* Message Area */}
        <div ref={chatBodyRef} className="flex-grow p-4 space-y-3 overflow-y-auto bg-gray-50 dark:bg-gray-700/50">
          {isConnecting && (
            <div className="flex justify-center items-center h-full">
              <BrandSpinner size="text-2xl" />
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
                    type: msg.messageType || msg.type,
                    isFromAdmin: msg.isFromAdmin,
                    currentUserIsAdmin: currentUser?.roles?.includes('ROLE_ADMIN'),
                    // File-related properties
                    fileName: msg.fileName,
                    fileUrl: msg.fileUrl,
                    fileSize: msg.fileSize,
                    contentType: msg.contentType,
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
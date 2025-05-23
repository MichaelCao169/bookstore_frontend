// src/components/chat/ChatBubble.jsx
'use client';
import { FiMessageSquare, FiX } from 'react-icons/fi';
import { useChatStore } from '@/store/chatStore';

const ChatBubble = () => {
  const { isChatOpen, toggleChat, userUnreadCount } = useChatStore();

  return (
    <button
      onClick={toggleChat}
      className="fixed bottom-6 right-6 bg-orange-600 hover:bg-orange-700 text-white p-4 rounded-full shadow-lg transition-transform duration-200 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 z-[1000]"
      aria-label={isChatOpen ? "Đóng chat" : "Mở chat"}
    >
      {isChatOpen ? <FiX size={24} /> : <FiMessageSquare size={24} />}
      {userUnreadCount > 0 && !isChatOpen && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 text-xs items-center justify-center">
            {userUnreadCount > 9 ? '9+' : userUnreadCount}
          </span>
        </span>
      )}
    </button>
  );
};

export default ChatBubble;
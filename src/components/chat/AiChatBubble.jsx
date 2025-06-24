'use client';

import { FiX } from 'react-icons/fi';
import { RiRobot2Line } from 'react-icons/ri';
import { useAiChatStore } from '@/store/aiChatStore';
import { useChatStore } from '@/store/chatStore';

const AiChatBubble = () => {
  const { isAiChatOpen, toggleAiChat } = useAiChatStore();
  const { isChatOpen: isAdminChatOpen, toggleChat: toggleAdminChat } = useChatStore();

  const handleToggleAiChat = () => {
    // Nếu admin chat đang mở, đóng nó trước
    if (isAdminChatOpen) {
      toggleAdminChat();
    }
    // Sau đó toggle AI chat
    toggleAiChat();
  };

  return (
    <button
      onClick={handleToggleAiChat}
      className="fixed bottom-24 right-6 bg-orange-600 hover:bg-orange-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 z-[1000]"
      aria-label={isAiChatOpen ? "Đóng chat với AI" : "Trò chuyện với AI"}
    >
      {isAiChatOpen ? <FiX size={24} /> : <RiRobot2Line size={24} />}
    </button>
  );
};

export default AiChatBubble;
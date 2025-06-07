// src/components/chat/AiChatBubble.jsx
'use client';

import { FiX } from 'react-icons/fi';
import { RiRobot2Line } from 'react-icons/ri'; 
import { useAiChatStore } from '@/store/aiChatStore';

const AiChatBubble = () => {
  const { isAiChatOpen, toggleAiChat } = useAiChatStore();

  // [THAY ĐỔI QUAN TRỌNG: NẾU CHAT ĐANG MỞ THÌ KHÔNG RENDER GÌ CẢ]
  if (isAiChatOpen) {
    return null;
  }

  return (
    // Nút này bây giờ chỉ hiển thị khi isAiChatOpen là false
    <button
      onClick={toggleAiChat}
      className="fixed bottom-24 right-6 bg-orange-600 hover:bg-orange-700 text-white p-4 rounded-full shadow-lg transition-transform duration-200 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 z-[1000]"
      aria-label="Trò chuyện với AI"
    >
      <RiRobot2Line size={24} />
    </button>
  );
};

export default AiChatBubble;
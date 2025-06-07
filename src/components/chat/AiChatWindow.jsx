// src/components/chat/AiChatWindow.jsx
'use client';
import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiCpu, FiSend } from 'react-icons/fi';
import { useAiChatStore } from '@/store/aiChatStore';
import UserAvatar from '@/components/ui/UserAvatar';
import { useAuthStore } from '@/store/authStore';
import { format } from 'date-fns';
import { RiRobot2Line } from 'react-icons/ri'; // Import icon robot

// Component cho tin nhắn (Không đổi)
const AiMessageItem = ({ message }) => {
  const isUser = message.sender === 'user';
  const user = useAuthStore((state) => state.user);

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        // [CẬP NHẬT MÀU SẮC]
        <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white flex-shrink-0">
            <RiRobot2Line size={18}/>
        </div>
      )}
      <div
        className={`max-w-[80%] p-3 rounded-xl shadow-sm ${
          isUser
            ? 'bg-orange-500 text-white rounded-br-none' // Tin nhắn của user vẫn màu cam
            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-none'
        } ${message.isError ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : ''}`}
      >
        <p className="whitespace-pre-wrap break-words text-sm">{message.text}</p>
        <p className={`text-xs mt-1 ${isUser ? 'text-orange-100 dark:text-orange-300' : 'text-gray-500 dark:text-gray-400'} text-right`}>
          {format(new Date(), 'HH:mm')}
        </p>
      </div>
      {isUser && (
        <UserAvatar name={user?.name || 'User'} avatarUrl={user?.avatarUrl} size="sm" />
      )}
    </div>
  );
};

// Component cho cửa sổ chat (Cập nhật vị trí và màu sắc)
const AiChatWindow = () => {
  const { isAiChatOpen, toggleAiChat, aiMessages, isLoading, sendAiMessage } = useAiChatStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      sendAiMessage(input);
      setInput('');
    }
  };

  if (!isAiChatOpen) return null;

  return (
    // [THAY ĐỔI 1: VỊ TRÍ CỬA SỔ CHAT]
    // bottom-20 để nằm trên bubble chat
    // left-6 -> right-6 để đưa sang góc phải
    <div className="fixed bottom-24 right-6 w-[360px] h-[500px] bg-white dark:bg-gray-800 shadow-2xl rounded-lg flex flex-col border border-gray-200 dark:border-gray-700 z-[999] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
        <div className="flex items-center">
            {/* [THAY ĐỔI 2: MÀU SẮC HEADER] */}
            <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white mr-3">
                <RiRobot2Line size={22}/>
            </div>
            <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-100">AI Book Advisor</h3>
                <p className="text-xs text-green-500 dark:text-green-400">Online</p>
            </div>
        </div>
        <button
          onClick={toggleAiChat}
          className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600"
          aria-label="Đóng chat"
        >
          <FiX size={20} />
        </button>
      </div>

      {/* Message Area (giữ nguyên) */}
      <div className="flex-grow p-4 space-y-4 overflow-y-auto bg-gray-50 dark:bg-gray-700/50">
        {aiMessages.map((msg) => (
          <AiMessageItem key={msg.id} message={msg} />
        ))}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white flex-shrink-0">
                <RiRobot2Line size={18}/>
            </div>
            <div className="p-3 rounded-xl bg-gray-100 dark:bg-gray-700 rounded-bl-none">
                <div className="flex items-center space-x-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Hỏi về sách bạn quan tâm..."
            // [THAY ĐỔI 3: MÀU SẮC INPUT]
            className="flex-grow px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            // [THAY ĐỔI 4: MÀU SẮC NÚT SEND]
            className="p-2 bg-orange-600 text-white rounded-full hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Gửi tin nhắn"
          >
            <FiSend size={20} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default AiChatWindow;
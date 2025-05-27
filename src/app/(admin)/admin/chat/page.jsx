// src/app/(admin)/admin/chat/page.jsx
'use client';
import { useEffect, useState } from 'react';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import ConversationListItem from '@/components/chat/admin/ConversationListItem';
import AdminChatWindow from '@/components/chat/admin/AdminChatWindow';
import { FiSearch, FiInbox } from 'react-icons/fi';

export default function AdminChatPage() {
  const {
    adminConversations,
    adminActiveConversationId,
    setAdminActiveConversation,
    initializeAdminChat,
  } = useChatStore();
  const { user: currentUser, isAuthenticated } = useAuthStore();

  const [searchTerm, setSearchTerm] = useState('');
  // Initialize admin chat when component mounts
  useEffect(() => {
    if (isAuthenticated && currentUser && currentUser.roles && currentUser.roles.includes('ROLE_ADMIN')) {
      initializeAdminChat(currentUser);
    }
  }, [isAuthenticated, currentUser, initializeAdminChat]);

  const filteredConversations = adminConversations.filter(conv =>
    conv.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-[calc(100vh-theme(space.24))] bg-gray-100 dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Page Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Quản lý Tin nhắn</h1>
      </div>

      <div className="flex flex-grow overflow-hidden">
        {/* Sidebar - Conversation List */}
        <div className="w-1/3 min-w-[300px] max-w-[400px] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm cuộc trò chuyện..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-gray-100"
              />
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            </div>
          </div>
          <div className="flex-grow overflow-y-auto">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conv) => (
                <ConversationListItem
                  key={conv.id}
                  conversation={conv}
                  isActive={conv.id === adminActiveConversationId}
                  onSelectConversation={setAdminActiveConversation}
                />
              ))
            ) : (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                <FiInbox size={36} className="mx-auto mb-2" />
                <p>Không có cuộc trò chuyện nào.</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Chat Window */}
        <div className="flex-grow">
          <AdminChatWindow />
        </div>
      </div>
    </div>
  );
}
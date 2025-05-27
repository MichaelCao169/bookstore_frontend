// src/components/chat/admin/ConversationListItem.jsx
'use client';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const ConversationListItem = ({ conversation, isActive, onSelectConversation }) => {
  const placeholderAvatar = '/default-avatar.png';
  const handleImageError = (e) => {
    if (e.target.src !== placeholderAvatar) {
      e.target.src = placeholderAvatar;
    }
  };

  return (
    <button
      onClick={() => onSelectConversation(conversation.id)}
      className={`w-full flex items-center p-3 text-left transition-colors duration-150
        ${isActive
          ? 'bg-orange-100 dark:bg-orange-900/30 border-l-4 border-orange-500'
          : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'
        }
      `}
    >      <div className="relative w-10 h-10 rounded-full overflow-hidden mr-3 flex-shrink-0">
        <Image
          src={conversation.customerAvatar || placeholderAvatar}
          alt={conversation.customerName || 'User Avatar'}
          fill
          className="object-cover"
          onError={handleImageError}
        />
        {conversation.isCustomerOnline && (
          <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-white dark:ring-gray-800"></span>
        )}
      </div>
      <div className="flex-grow min-w-0">
        <div className="flex justify-between items-center">
          <h4 className={`font-semibold text-sm truncate ${isActive ? 'text-orange-700 dark:text-orange-300' : 'text-gray-800 dark:text-gray-100'}`}>
            {conversation.customerName}
          </h4>
          <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
            {conversation.lastMessageTimestamp ? formatDistanceToNow(new Date(conversation.lastMessageTimestamp), { addSuffix: true, locale: vi }) : ''}
          </span>
        </div>        <div className="flex justify-between items-center mt-1">
          <p className="text-xs text-gray-600 dark:text-gray-300 truncate pr-2">
            {conversation.lastMessageContent}
          </p>
          {conversation.unreadCountAdmin > 0 && (
            <span className="bg-orange-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full flex-shrink-0">
              {conversation.unreadCountAdmin > 9 ? '9+' : conversation.unreadCountAdmin}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

export default ConversationListItem;
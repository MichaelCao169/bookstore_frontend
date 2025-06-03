// src/components/chat/MessageItem.jsx
'use client';
import Image from 'next/image';
import { format } from 'date-fns';
import { FiFileText, FiDownload, FiFile, FiImage } from 'react-icons/fi';
import { useAuthStore } from '@/store/authStore'; // To identify current user
import UserAvatar from '@/components/ui/UserAvatar';
import { formatFileSize, getFileType } from '@/services/fileUploadService';

const MessageItem = ({ message, currentUserId }) => {
  // Convert both to numbers for proper comparison
  const senderId = Number(message.senderId);
  const userId = Number(currentUserId);
  const isMyMessage = senderId === userId;
  const placeholderAvatar = '/default-avatar.png';

  // Enhanced debug logging for alignment issues
  console.log('MessageItem Debug:', {
    messageId: message.id,
    senderId: message.senderId,
    senderIdNum: senderId,
    currentUserId: currentUserId,
    currentUserIdNum: userId,
    isMyMessage: isMyMessage,
    senderName: message.senderName,
    content: message.content?.substring(0, 30) + '...',
    isFromAdmin: message.isFromAdmin
  });

  // Additional verification: if we know this is from admin and current user is admin, it should be my message
  // if we know this is from customer and current user is not admin, it should be my message
  let finalIsMyMessage = isMyMessage;

  // Use isFromAdmin field if available for more accurate alignment
  if (typeof message.isFromAdmin === 'boolean') {
    // If current user is admin and message is from admin -> my message
    // If current user is not admin and message is not from admin -> my message
    const currentUserIsAdmin = message.currentUserIsAdmin; // We might need to pass this
    if (currentUserIsAdmin !== undefined) {
      finalIsMyMessage = (currentUserIsAdmin && message.isFromAdmin) || (!currentUserIsAdmin && !message.isFromAdmin);
    }
  }

  console.log('MessageItem Final Alignment:', {
    messageId: message.id,
    originalIsMyMessage: isMyMessage,
    finalIsMyMessage: finalIsMyMessage,
    willShowOnRight: finalIsMyMessage
  });

  const handleImageError = (e) => {
    if (e.target.src !== placeholderAvatar) {
      e.target.src = placeholderAvatar;
    }
  };
  const renderFileIcon = (fileName, contentType) => {
    const fileType = getFileType(fileName);
    const iconProps = { className: "w-5 h-5 mr-2 flex-shrink-0" };

    switch (fileType) {
      case 'image':
        return <FiImage {...iconProps} />;
      case 'document':
      case 'excel':
        return <FiFileText {...iconProps} />;
      default:
        return <FiFile {...iconProps} />;
    }
  };

  const renderContent = () => {
    if (message.type === 'file' && message.fileUrl) {
      const fileType = getFileType(message.fileName || '');
      const isImage = fileType === 'image';

      return (
        <div className="space-y-2">
          {isImage && (
            <div className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-600 max-w-xs">
              <Image
                src={message.fileUrl}
                alt={message.fileName || 'Hình ảnh'}
                width={300}
                height={200}
                className="object-cover w-full h-auto max-h-48"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}
          <a
            href={message.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center p-3 rounded-lg transition-colors border ${isMyMessage
              ? 'bg-orange-100 dark:bg-orange-700 border-orange-200 dark:border-orange-600 text-orange-800 dark:text-orange-200 hover:bg-orange-200 dark:hover:bg-orange-600'
              : 'bg-white dark:bg-gray-600 border-gray-200 dark:border-gray-500 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-500'
              }`}
          >
            {renderFileIcon(message.fileName, message.contentType)}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">
                {message.fileName || 'File đính kèm'}
              </div>
              {message.fileSize && (
                <div className="text-xs opacity-75">
                  {formatFileSize(parseInt(message.fileSize))}
                </div>
              )}
            </div>
            <FiDownload className="w-4 h-4 ml-2 flex-shrink-0 opacity-75" />
          </a>
        </div>
      );
    }
    // Default to text if type is not file or fileUrl is missing
    return <p className="whitespace-pre-wrap break-words">{message.content}</p>;
  };

  return (
    <div className={`flex items-end mb-3 ${finalIsMyMessage ? 'justify-end' : ''}`}>
      {!finalIsMyMessage && (
        <UserAvatar
          name={message.senderName || 'User'}
          avatarUrl={message.senderAvatar}
          size="sm"
          className="mr-2 flex-shrink-0"
        />
      )}
      <div
        className={`max-w-[70%] p-3 rounded-xl shadow-sm ${finalIsMyMessage
          ? 'bg-orange-500 text-white rounded-br-none'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-none'
          }`}
      >
        {!finalIsMyMessage && (
          <p className="text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">
            {message.senderName}
          </p>
        )}
        {renderContent()}
        <p className={`text-xs mt-1 ${finalIsMyMessage ? 'text-orange-100 dark:text-orange-300' : 'text-gray-500 dark:text-gray-400'} text-right`}>
          {format(new Date(message.timestamp), 'HH:mm')}
        </p>
      </div>
      {finalIsMyMessage && (
        <UserAvatar
          name={message.senderName || 'User'}
          avatarUrl={message.senderAvatar}
          size="sm"
          className="ml-2 flex-shrink-0"
        />
      )}
    </div>
  );
};

export default MessageItem;
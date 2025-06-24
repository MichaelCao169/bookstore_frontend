'use client'; 

import { useState, useRef } from 'react'; 
import { FiSend, FiPaperclip, FiX } from 'react-icons/fi';
import { uploadChatFile, formatFileSize } from '@/services/fileUploadService';
import BrandSpinner from '@/components/ui/BrandSpinner';

const ChatInput = ({ onSendMessage, isSending }) => {
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!message.trim() && !file) || isSending || isUploading) return;

    if (file) {
      setIsUploading(true);
      try {
        const uploadResult = await uploadChatFile(file);

        if (uploadResult.success) {
          onSendMessage({
            content: `Đã đính kèm file: ${uploadResult.data.originalName}`,
            type: 'file',
            fileName: uploadResult.data.originalName,
            fileUrl: uploadResult.data.url,
            fileSize: uploadResult.data.size,
            contentType: uploadResult.data.contentType,
          });
          setFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        } else {
          alert(`Lỗi upload file: ${uploadResult.error}`);
        }
      } catch (error) {
        console.error('Upload error:', error);
        alert('Có lỗi xảy ra khi upload file');
      } finally {
        setIsUploading(false);
      }
    } else {
      onSendMessage({ content: message.trim(), type: 'text' });
    }
    setMessage('');
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 5 * 1024 * 1024) { // Giới hạn 5MB
        alert("Kích thước file không được vượt quá 5MB.");
        // Reset input file nếu file quá lớn
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }
      setFile(selectedFile);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset file input
    }
  };

  return (
    <form
      onSubmit={handleSendMessage}
      className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
    >      {file && (
      <div className="mb-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center min-w-0 flex-1">
            <FiPaperclip className="mr-2 text-gray-500 dark:text-gray-400 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="text-gray-700 dark:text-gray-300 truncate block text-sm font-medium" title={file.name}>
                {file.name}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatFileSize(file.size)}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={removeFile}
            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1 ml-2 flex-shrink-0 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
            disabled={isUploading}
          >
            <FiX size={16} />
          </button>
        </div>
        {isUploading && (
          <div className="mt-2 flex items-center text-sm text-orange-600 dark:text-orange-400">
            <BrandSpinner size="sm" className="mr-2" />
            Đang tải lên file...
          </div>
        )}
      </div>
    )}
      <div className="flex items-center space-x-2">        <button
        type="button"
        onClick={triggerFileInput}
        className="p-2 text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Đính kèm file"
        disabled={isSending || isUploading}
      >
        <FiPaperclip size={20} />
      </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,application/pdf,.doc,.docx,.txt,.zip,.rar" // Mở rộng các loại file chấp nhận
        />        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Nhập tin nhắn..."
          className="flex-grow px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
          disabled={isSending || isUploading}
        />
        <button
          type="submit"
          disabled={(!message.trim() && !file) || isSending || isUploading}
          className="p-2 bg-orange-600 text-white rounded-full hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Gửi tin nhắn"
        >
          {isUploading ? (
            <BrandSpinner size="sm" color="white" />
          ) : (
            <FiSend size={20} />
          )}
        </button>
      </div>
    </form>
  );
};

export default ChatInput;
// src/components/chat/ChatInput.jsx
'use client'; // Đặt directive này ở dòng ĐẦU TIÊN

import { useState, useRef } from 'react'; // Bỏ dòng `_USE_CLIENT_DIRECTIVE_` ở đây
import { FiSend, FiPaperclip, FiX } from 'react-icons/fi';

const ChatInput = ({ onSendMessage, isSending }) => {
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if ((!message.trim() && !file) || isSending) return;

    if (file) {
      onSendMessage({
        content: `Đã đính kèm file: ${file.name}`,
        type: 'file',
        fileName: file.name,
        fileUrl: '#placeholder-file-url', // URL placeholder cho file
        // Trong thực tế, bạn sẽ upload file và lấy URL trả về
      });
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Reset input file
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
    >
      {file && (
        <div className="mb-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-between text-sm">
          <div className="flex items-center truncate">
            <FiPaperclip className="mr-2 text-gray-500 dark:text-gray-400 flex-shrink-0" />
            <span className="text-gray-700 dark:text-gray-300 truncate" title={file.name}>{file.name}</span>
          </div>
          <button type="button" onClick={removeFile} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1 ml-2 flex-shrink-0">
            <FiX />
          </button>
        </div>
      )}
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={triggerFileInput}
          className="p-2 text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Đính kèm file"
          disabled={isSending}
        >
          <FiPaperclip size={20} />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,application/pdf,.doc,.docx,.txt,.zip,.rar" // Mở rộng các loại file chấp nhận
        />
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Nhập tin nhắn..."
          className="flex-grow px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
          disabled={isSending}
        />
        <button
          type="submit"
          disabled={(!message.trim() && !file) || isSending}
          className="p-2 bg-orange-600 text-white rounded-full hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Gửi tin nhắn"
        >
          <FiSend size={20} />
        </button>
      </div>
    </form>
  );
};

export default ChatInput;
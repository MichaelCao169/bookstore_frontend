import React from 'react';
import { FiUser } from 'react-icons/fi';

const DefaultAvatar = ({ size = 'w-10 h-10', className = '' }) => {
  return (
    <div className={`${size} ${className} rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg`}>
      <FiUser className="text-white" size={size.includes('w-10') ? 20 : size.includes('w-12') ? 24 : 28} />
    </div>
  );
};

export default DefaultAvatar;

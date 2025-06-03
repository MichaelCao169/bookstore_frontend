'use client';

import { useState } from 'react';

/**
 * UserAvatar component - Tạo avatar từ tên người dùng hoặc hiển thị ảnh avatar
 * @param {Object} props
 * @param {string} props.name - Tên người dùng để tạo avatar
 * @param {string} props.avatarUrl - URL của ảnh avatar (nếu có)
 * @param {string} props.size - Kích thước avatar ('sm', 'md', 'lg', 'xl')
 * @param {string} props.className - Class CSS bổ sung
 */
export default function UserAvatar({
    name = 'User',
    avatarUrl = null,
    size = 'md',
    className = ''
}) {
    const [imageError, setImageError] = useState(false);    // Tạo initials từ tên người dùng
    const getInitials = (fullName) => {
        if (!fullName || fullName.trim() === '') return 'U';

        const names = fullName.trim().split(' ').filter(name => name.length > 0);
        if (names.length === 0) return 'U';
        if (names.length === 1) {
            return names[0].charAt(0).toUpperCase();
        }

        // Lấy chữ cái đầu của tên và họ
        return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
    };

    // Tạo màu background từ tên
    const getBackgroundColor = (name) => {
        const colors = [
            'bg-gradient-to-br from-purple-500 to-pink-500',
            'bg-gradient-to-br from-blue-500 to-cyan-500',
            'bg-gradient-to-br from-green-500 to-teal-500',
            'bg-gradient-to-br from-yellow-500 to-orange-500',
            'bg-gradient-to-br from-red-500 to-pink-500',
            'bg-gradient-to-br from-indigo-500 to-purple-500',
            'bg-gradient-to-br from-cyan-500 to-blue-500',
            'bg-gradient-to-br from-teal-500 to-green-500',
            'bg-gradient-to-br from-orange-500 to-red-500',
            'bg-gradient-to-br from-pink-500 to-purple-500'
        ];

        // Tạo hash từ tên để chọn màu consistent
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }

        return colors[Math.abs(hash) % colors.length];
    };

    // Định nghĩa kích thước
    const sizeClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-base',
        xl: 'w-16 h-16 text-lg',
        '2xl': 'w-20 h-20 text-xl'
    };

    const initials = getInitials(name);
    const backgroundColorClass = getBackgroundColor(name);
    const sizeClass = sizeClasses[size] || sizeClasses.md;    // Nếu có avatarUrl hợp lệ và không có lỗi, hiển thị ảnh
    if (avatarUrl && !imageError && !avatarUrl.includes('default-avatar')) {
        return (
            <div className={`${sizeClass} rounded-full overflow-hidden flex-shrink-0 ${className}`}>
                <img
                    src={avatarUrl}
                    alt={`${name} avatar`}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                />
            </div>
        );
    }

    // Hiển thị avatar với initials
    return (
        <div
            className={`
                ${sizeClass} 
                ${backgroundColorClass}
                rounded-full 
                flex 
                items-center 
                justify-center 
                flex-shrink-0
                text-white 
                font-semibold 
                shadow-lg
                ${className}
            `}
            title={name}
        >
            {initials}
        </div>
    );
}

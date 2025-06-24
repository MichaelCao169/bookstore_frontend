'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FiChevronDown, FiSearch, FiX } from 'react-icons/fi';

const SearchableSelect = ({
    options = [],
    value = '',
    onChange,
    placeholder = 'Chọn...',
    searchPlaceholder = 'Tìm kiếm...',
    emptyMessage = 'Không có dữ liệu',
    className = '',
    disabled = false,
    loading = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);
    const searchInputRef = useRef(null);

    // Lọc options theo từ khóa
    const filteredOptions = options.filter(option => {
        const optionText = typeof option === 'string' ? option : option.label || option.name || '';
        return optionText.toLowerCase().includes(searchTerm.toLowerCase());
    });

    // Xử lý chọn option
    const handleSelect = (selectedValue) => {
        onChange(selectedValue);
        setIsOpen(false);
        setSearchTerm('');
    };

    // Xóa lựa chọn
    const handleClear = (e) => {
        e.stopPropagation();
        onChange('');
        setSearchTerm('');
    };

    // Đóng dropdown khi click ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus vào search khi mở dropdown
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen]);

    // Lấy giá trị hiển thị
    const getDisplayValue = () => {
        if (!value) return placeholder;

        if (typeof value === 'string') return value;

        const selectedOption = options.find(opt =>
            (typeof opt === 'string' ? opt : opt.value) === value
        );

        if (selectedOption) {
            return typeof selectedOption === 'string' ? selectedOption : selectedOption.label || selectedOption.name || value;
        }

        return value;
    };

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {/* Main Select Button */}
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`
                    w-full px-3 py-2 text-left bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                    rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500
                    text-sm text-gray-900 dark:text-gray-100
                    ${disabled ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-gray-600'}
                    ${isOpen ? 'ring-2 ring-orange-500 border-orange-500' : ''}
                `}
            >
                <div className="flex items-center justify-between">
                    <span className={value ? '' : 'text-gray-500 dark:text-gray-400'}>
                        {getDisplayValue()}
                    </span>                    <div className="flex items-center space-x-1">
                        {value && !disabled && (
                            <span
                                onClick={handleClear}
                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors cursor-pointer"
                            >
                                <FiX className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                            </span>
                        )}
                        <FiChevronDown
                            className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''
                                }`}
                        />
                    </div>
                </div>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-hidden">
                    {/* Search Input */}
                    <div className="p-2 border-b border-gray-200 dark:border-gray-600">
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder={searchPlaceholder}
                                className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            />
                        </div>
                    </div>

                    {/* Options List */}
                    <div className="max-h-48 overflow-y-auto">
                        {loading ? (
                            <div className="p-3 text-center text-gray-500 dark:text-gray-400">
                                Đang tải...
                            </div>
                        ) : filteredOptions.length > 0 ? (
                            filteredOptions.map((option, index) => {
                                const optionValue = typeof option === 'string' ? option : option.value;
                                const optionLabel = typeof option === 'string' ? option : option.label;
                                const isSelected = value === optionValue; return (
                                    <div
                                        key={index}
                                        onClick={() => handleSelect(optionValue)}
                                        className={`
                                            w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-600 
                                            focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-600 cursor-pointer
                                            ${isSelected ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300' : 'text-gray-900 dark:text-gray-100'}
                                        `}
                                    >
                                        {optionLabel}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="p-3 text-center text-gray-500 dark:text-gray-400">
                                {emptyMessage}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchableSelect;

'use client';

import React, { useState } from 'react';
import { FiFilter, FiX } from 'react-icons/fi';
import ProductFilterSidebar from './ProductFilterSidebar';

const MobileFilterButton = () => {
    const [showFilterModal, setShowFilterModal] = useState(false);

    const openFilterModal = () => {
        // Ngăn scroll trên body khi modal mở
        if (typeof document !== 'undefined') {
            document.body.style.overflow = 'hidden';
        }
        setShowFilterModal(true);
    };

    const closeFilterModal = () => {
        // Cho phép scroll lại khi đóng modal
        if (typeof document !== 'undefined') {
            document.body.style.overflow = 'auto';
        }
        setShowFilterModal(false);
    };

    return (
        <>
            <button
                onClick={openFilterModal}
                className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md py-2 px-4 flex items-center justify-center text-gray-700 dark:text-gray-300 transition hover:bg-gray-50 dark:hover:bg-gray-700"
                type="button"
            >
                <FiFilter className="mr-2" /> Lọc sản phẩm
            </button>

            {/* Filter Modal for Mobile */}
            {showFilterModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="relative bg-white dark:bg-gray-800 w-full max-w-md mx-auto rounded-lg shadow-lg">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Bộ lọc</h3>
                            <button
                                onClick={closeFilterModal}
                                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                            >
                                <FiX size={20} />
                            </button>
                        </div>

                        <div className="p-4 max-h-[70vh] overflow-y-auto">
                            <ProductFilterSidebar />

                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={closeFilterModal}
                                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md"
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default MobileFilterButton; 
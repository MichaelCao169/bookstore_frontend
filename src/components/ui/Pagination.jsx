// src/components/ui/Pagination.jsx
'use client'; // Cần client component vì có onClick handlers

import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // Không hiển thị nếu chỉ có 1 trang hoặc không có trang nào
  if (!totalPages || totalPages <= 1) {
    return null;
  }

  // --- Logic tính toán các số trang cần hiển thị ---
  const pageNumbers = [];
  const maxPagesToShow = 5; // Số lượng nút số trang tối đa hiển thị (ví dụ: 1 ... 4 5 6 ... 10)
  const halfMaxPages = Math.floor(maxPagesToShow / 2);

  let startPage = Math.max(1, currentPage - halfMaxPages);
  let endPage = Math.min(totalPages, currentPage + halfMaxPages);

  // Điều chỉnh nếu số lượng trang hiển thị ít hơn maxPagesToShow do ở gần đầu/cuối
  if (endPage - startPage + 1 < maxPagesToShow) {
    if (currentPage < halfMaxPages + 1) {
      // Gần đầu
      endPage = Math.min(totalPages, maxPagesToShow);
    } else {
      // Gần cuối
      startPage = Math.max(1, totalPages - maxPagesToShow + 1);
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }
  // --- Kết thúc logic tính toán ---

  return (
    <nav aria-label="Phân trang" className="flex items-center justify-center">
      <div className="flex items-center space-x-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-1">
        {/* === Nút Trước === */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`
            flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ease-in-out
            ${currentPage === 1
              ? 'cursor-not-allowed text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700/50'
              : 'text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:shadow-sm'
            }
            focus:outline-none focus:ring-2 focus:ring-orange-300 dark:focus:ring-orange-600 focus:ring-opacity-50
          `}
          aria-label="Trang trước"
          aria-disabled={currentPage === 1}
        >
          <FiChevronLeft className="w-4 h-4 mr-1" />
          Trước
        </button>

        {/* === Nút Trang đầu và dấu "..." (nếu cần) === */}
        {startPage > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="
                flex items-center justify-center w-10 h-10 text-sm font-medium rounded-md transition-all duration-200 ease-in-out
                text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 
                hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:shadow-sm
                focus:outline-none focus:ring-2 focus:ring-orange-300 dark:focus:ring-orange-600 focus:ring-opacity-50
              "
              aria-label="Đi đến trang 1"
            >
              1
            </button>
            {startPage > 2 && (
              <span className="flex items-center justify-center w-10 h-10 text-gray-400 dark:text-gray-500">
                ...
              </span>
            )}
          </>
        )}

        {/* === Các nút số trang === */}
        {pageNumbers.map((pageNumber) => (
          <button
            key={pageNumber}
            onClick={() => onPageChange(pageNumber)}
            disabled={currentPage === pageNumber}
            className={`
              flex items-center justify-center w-10 h-10 text-sm font-medium rounded-md transition-all duration-200 ease-in-out
              focus:outline-none focus:ring-2 focus:ring-orange-300 dark:focus:ring-orange-600 focus:ring-opacity-50
              ${currentPage === pageNumber
                ? 'text-white bg-orange-600 dark:bg-orange-500 shadow-md cursor-default ring-2 ring-orange-300 dark:ring-orange-600 ring-opacity-50'
                : 'text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:shadow-sm'
              }
            `}
            aria-current={currentPage === pageNumber ? 'page' : undefined}
            aria-label={`Đi đến trang ${pageNumber}`}
          >
            {pageNumber}
          </button>
        ))}

        {/* === Nút Trang cuối và dấu "..." (nếu cần) === */}
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <span className="flex items-center justify-center w-10 h-10 text-gray-400 dark:text-gray-500">
                ...
              </span>
            )}
            <button
              onClick={() => onPageChange(totalPages)}
              className="
                flex items-center justify-center w-10 h-10 text-sm font-medium rounded-md transition-all duration-200 ease-in-out
                text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 
                hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:shadow-sm
                focus:outline-none focus:ring-2 focus:ring-orange-300 dark:focus:ring-orange-600 focus:ring-opacity-50
              "
              aria-label={`Đi đến trang cuối, trang ${totalPages}`}
            >
              {totalPages}
            </button>
          </>
        )}

        {/* === Nút Tiếp === */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`
            flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ease-in-out
            ${currentPage === totalPages
              ? 'cursor-not-allowed text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700/50'
              : 'text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:shadow-sm'
            }
            focus:outline-none focus:ring-2 focus:ring-orange-300 dark:focus:ring-orange-600 focus:ring-opacity-50
          `}
          aria-label="Trang tiếp"
          aria-disabled={currentPage === totalPages}
        >
          Tiếp
          <FiChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>

      {/* Thông tin trang hiện tại */}
      <div className="ml-4 text-sm text-gray-600 dark:text-gray-400">
        Trang <span className="font-medium text-orange-600 dark:text-orange-400">{currentPage}</span> / <span className="font-medium">{totalPages}</span>
      </div>
    </nav>
  );
};

export default Pagination;
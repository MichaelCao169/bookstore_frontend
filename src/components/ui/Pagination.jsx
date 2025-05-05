// src/components/ui/Pagination.jsx
'use client'; // Cần client component vì có onClick handlers

import React from 'react';

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
    <nav aria-label="Page navigation">
      <ul className="inline-flex items-center -space-x-px text-sm rounded-md shadow-sm border border-gray-300 dark:border-gray-600"> {/* Thêm border và shadow vào ul */}
        {/* === Nút Previous === */}
        <li>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 h-9 ml-0 leading-tight rounded-l-md transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-300 focus:z-10 ${
              currentPage === 1
                ? 'cursor-not-allowed text-gray-400 bg-gray-50 dark:bg-gray-700 dark:text-gray-500' // Style khi disable
                : 'text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white' // Style khi enable
            }`}
            aria-label="Previous Page"
            aria-disabled={currentPage === 1}
          >
            Previous
          </button>
        </li>

        {/* === Nút Trang đầu và dấu "..." (nếu cần) === */}
        {startPage > 1 && (
            <>
                <li>
                    <button
                        onClick={() => onPageChange(1)}
                        className="px-3 h-9 leading-tight text-gray-500 bg-white border-y border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-300 focus:z-10"
                        aria-label="Go to page 1"
                    >
                        1
                    </button>
                </li>
                {startPage > 2 && (
                    <li>
                       <span className="px-3 h-9 inline-flex items-center leading-tight text-gray-500 bg-white border-y border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400">...</span>
                    </li>
                )}
            </>
        )}

        {/* === Các nút số trang === */}
        {pageNumbers.map((pageNumber) => (
          <li key={pageNumber}>
            <button
              onClick={() => onPageChange(pageNumber)}
              disabled={currentPage === pageNumber}
              className={`px-3 h-9 leading-tight border-y border-gray-300 dark:border-gray-700 transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-300 focus:z-10 ${
                currentPage === pageNumber
                  ? 'text-orange-600 bg-orange-50 dark:bg-orange-900/50 dark:text-orange-300 z-10 cursor-default border-orange-300 dark:border-orange-700' // Style trang hiện tại
                  : 'text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white' // Style trang khác
              }`}
              aria-current={currentPage === pageNumber ? 'page' : undefined}
              aria-label={`Go to page ${pageNumber}`}
            >
              {pageNumber}
            </button>
          </li>
        ))}

        {/* === Nút Trang cuối và dấu "..." (nếu cần) === */}
        {endPage < totalPages && (
            <>
                 {endPage < totalPages - 1 && (
                    <li>
                       <span className="px-3 h-9 inline-flex items-center leading-tight text-gray-500 bg-white border-y border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400">...</span>
                    </li>
                 )}
                 <li>
                     <button
                         onClick={() => onPageChange(totalPages)}
                         className="px-3 h-9 leading-tight text-gray-500 bg-white border-y border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-300 focus:z-10"
                         aria-label={`Go to last page, page ${totalPages}`}
                     >
                        {totalPages}
                     </button>
                 </li>
            </>
        )}

        {/* === Nút Next === */}
        <li>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 h-9 leading-tight rounded-r-md transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-300 focus:z-10 ${
                currentPage === totalPages
                    ? 'cursor-not-allowed text-gray-400 bg-gray-50 dark:bg-gray-700 dark:text-gray-500 border border-gray-300 dark:border-gray-700' // Thêm border
                    : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white' // Thêm border
            }`}
            aria-label="Next Page"
            aria-disabled={currentPage === totalPages}
          >
            Next
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
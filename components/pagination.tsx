// components/pagination.tsx

"useClient";

import React from "react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}
export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    const canPrev = currentPage > 1;
    const canNext = currentPage < totalPages;

  return (
    <div className="flex justify-center mt-4">
      <ul className="inline-flex -space-x-px">
        <li>
          <button
            onClick={() => canPrev && onPageChange(currentPage - 1)}
            disabled={!canPrev}
            className="px-3 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
          >
            Previous
          </button>
        </li>
        {Array.from({ length: totalPages }).map((_, i) => (
          <li key={i}>
            <button
              onClick={() => onPageChange(i + 1)}
              className={`px-3 py-2 leading-tight border border-gray-300 
                ${
                  currentPage === i + 1
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                }`}
            >
              {i + 1}
            </button>
          </li>
        ))}
        <li>
          <button
            onClick={() => canNext && onPageChange(currentPage + 1)}
            disabled={!canNext}
            className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
          >
            Next
          </button>
        </li>
      </ul>
    </div>
  );
}

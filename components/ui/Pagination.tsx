"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  queryParams?: Record<string, string>;
}

export default function Pagination({
  currentPage,
  totalPages,
  baseUrl,
  queryParams = {},
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const buildUrl = (page: number) => {
    const params = new URLSearchParams({ ...queryParams, page: page.toString() });
    return `${baseUrl}?${params.toString()}`;
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showPages = 5; // Show max 5 page numbers

    if (totalPages <= showPages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-center gap-2 mt-12">
      {/* Previous Button */}
      {currentPage > 1 ? (
        <Link href={buildUrl(currentPage - 1)}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="flex items-center gap-1 px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-pink-500 hover:text-pink-600 smooth-transition will-change-transform"
            aria-label="Previous page"
          >
            <ChevronLeft size={18} />
            <span className="hidden sm:inline">Previous</span>
          </motion.button>
        </Link>
      ) : (
        <button
          disabled
          className="flex items-center gap-1 px-4 py-2 rounded-lg bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed"
          aria-label="Previous page"
        >
          <ChevronLeft size={18} />
          <span className="hidden sm:inline">Previous</span>
        </button>
      )}

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((page, index) => {
          if (page === "...") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-3 py-2 text-gray-500"
              >
                ...
              </span>
            );
          }

          const pageNum = page as number;
          const isActive = pageNum === currentPage;

          return (
            <Link key={pageNum} href={buildUrl(pageNum)}>
              <motion.button
                whileHover={!isActive ? { scale: 1.05 } : {}}
                whileTap={!isActive ? { scale: 0.95 } : {}}
                transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                className={`min-w-[40px] h-10 px-3 rounded-lg font-medium smooth-transition will-change-transform ${
                  isActive
                    ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-pink-500 hover:text-pink-600"
                }`}
                aria-label={`Page ${pageNum}`}
                aria-current={isActive ? "page" : undefined}
              >
                {pageNum}
              </motion.button>
            </Link>
          );
        })}
      </div>

      {/* Next Button */}
      {currentPage < totalPages ? (
        <Link href={buildUrl(currentPage + 1)}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="flex items-center gap-1 px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-pink-500 hover:text-pink-600 smooth-transition will-change-transform"
            aria-label="Next page"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight size={18} />
          </motion.button>
        </Link>
      ) : (
        <button
          disabled
          className="flex items-center gap-1 px-4 py-2 rounded-lg bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed"
          aria-label="Next page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight size={18} />
        </button>
      )}
    </div>
  );
}

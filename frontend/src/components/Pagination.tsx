import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function Pagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  className = "",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("...");
    for (
      let i = Math.max(2, page - 1);
      i <= Math.min(totalPages - 1, page + 1);
      i++
    ) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-4 border-t border-gs-gray-100 bg-gs-gray-50/50 ${className}`}
    >
      <p className="text-sm text-gs-gray-600">
        Exibindo <span className="font-semibold text-gs-black">{from}</span>–
        <span className="font-semibold text-gs-black">{to}</span> de{" "}
        <span className="font-semibold text-gs-black">{total}</span>
      </p>

      <div className="flex items-center gap-1 justify-center sm:justify-end">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="p-2 rounded-xl text-gs-gray-600 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Página anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`el-${i}`} className="px-2 text-gs-gray-400 select-none">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p as number)}
              className={`min-w-[2.25rem] h-9 rounded-xl text-sm font-semibold transition-all ${
                p === page
                  ? "bg-gs-orange-500 text-white shadow-sm"
                  : "text-gs-gray-700 hover:bg-white"
              }`}
            >
              {p}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="p-2 rounded-xl text-gs-gray-600 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Próxima página"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

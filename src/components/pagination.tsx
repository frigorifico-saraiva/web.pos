"use client";

import { useSearchParams } from "next/navigation";
import { MoveLeft, MoveRight } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Pagination({
  count,
  pageSize = 50,
}: {
  count: number;
  pageSize?: number;
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const parsedPage = Number(searchParams.get("page") ?? 1);
  const currentPage =
    Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
  const totalPages = Math.ceil(count / pageSize);
  const safeCurrentPage = Math.min(currentPage, Math.max(totalPages, 1));

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));

    window.location.href = `${pathname}?${params.toString()}`;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center gap-3 mb-4 ml-1">
      <button
        onClick={() => goToPage(safeCurrentPage - 1)}
        disabled={safeCurrentPage === 1}
        className="flex items-center justify-start w-7 h-7 rounded-md disabled:opacity-30 cursor-pointer"
      >
        <MoveLeft size={14} />
      </button>

      <div className="flex justify-between gap-3">
        <p className="text-xs font-bold">{safeCurrentPage} /</p>
        <p className="text-xs font-bold">{totalPages}</p>
      </div>
      <p className="text-sm justify-center normal-case"></p>

      <button
        onClick={() => goToPage(safeCurrentPage + 1)}
        disabled={safeCurrentPage === totalPages}
        className="flex items-center justify-start w-7 h-7 rounded-md disabled:opacity-30 cursor-pointer"
      >
        <MoveRight size={14} />
      </button>
    </div>
  );
}

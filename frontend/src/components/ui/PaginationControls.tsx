interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

export default function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  loading = false,
}: PaginationControlsProps) {
  const safeTotalPages = Math.max(1, totalPages);
  const safeCurrentPage = Math.min(Math.max(1, currentPage), safeTotalPages);

  return (
    <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2">
      <button
        type="button"
        onClick={() => onPageChange(safeCurrentPage - 1)}
        disabled={safeCurrentPage <= 1 || loading}
        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Previous
      </button>
      <p className="text-sm font-semibold text-slate-600">
        Page {safeCurrentPage} of {safeTotalPages}
      </p>
      <button
        type="button"
        onClick={() => onPageChange(safeCurrentPage + 1)}
        disabled={safeCurrentPage >= safeTotalPages || loading}
        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
}

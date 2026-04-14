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
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="mt-4 flex items-center justify-between gap-3">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1 || loading}
        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 disabled:opacity-40"
      >
        Previous
      </button>
      <p className="text-sm font-semibold text-slate-600">
        Page {currentPage} of {totalPages}
      </p>
      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages || loading}
        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
}

import type { ButtonHTMLAttributes, ReactNode } from "react";

interface LoadingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  children: ReactNode;
}

export default function LoadingButton({
  loading = false,
  loadingText,
  children,
  disabled,
  className = "",
  ...props
}: LoadingButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`${className} ${loading ? "cursor-not-allowed opacity-70" : ""}`.trim()}
    >
      <span className="inline-flex items-center gap-2">
        {loading && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
        )}
        <span>{loading ? (loadingText || "Loading...") : children}</span>
      </span>
    </button>
  );
}

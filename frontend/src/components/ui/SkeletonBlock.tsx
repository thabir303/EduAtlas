interface SkeletonBlockProps {
  className?: string;
}

export default function SkeletonBlock({ className = "" }: SkeletonBlockProps) {
  return <div className={`animate-pulse rounded-md bg-slate-200 ${className}`.trim()} />;
}

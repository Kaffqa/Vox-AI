// ============================================
// VoxAI — SkeletonLoader Component
// ============================================

type SkeletonVariant = 'text' | 'card' | 'list';

interface SkeletonLoaderProps {
  variant?: SkeletonVariant;
  /** Number of lines (for 'text' and 'list' variants) */
  lines?: number;
  className?: string;
}

function ShimmerBar({ width = 'w-full', className = '' }: { width?: string; className?: string }) {
  return (
    <div
      className={`
        h-3 rounded-md animate-shimmer
        ${width} ${className}
      `}
    />
  );
}

function TextSkeleton({ lines = 3 }: { lines: number }) {
  const widths = ['w-full', 'w-5/6', 'w-4/6', 'w-3/4', 'w-2/3'];

  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <ShimmerBar key={i} width={widths[i % widths.length]} />
      ))}
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="glass-card p-6 space-y-4">
      {/* Header row */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full animate-shimmer shrink-0" />
        <div className="flex-1 space-y-2">
          <ShimmerBar width="w-1/3" />
          <ShimmerBar width="w-1/5" className="h-2" />
        </div>
      </div>
      {/* Body lines */}
      <div className="space-y-3">
        <ShimmerBar width="w-full" />
        <ShimmerBar width="w-5/6" />
        <ShimmerBar width="w-2/3" />
      </div>
      {/* Footer */}
      <div className="flex gap-2 pt-2">
        <div className="h-8 w-20 rounded-lg animate-shimmer" />
        <div className="h-8 w-20 rounded-lg animate-shimmer" />
      </div>
    </div>
  );
}

function ListSkeleton({ lines = 4 }: { lines: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="glass-card p-4 flex items-center gap-4"
        >
          <div className="w-8 h-8 rounded-lg animate-shimmer shrink-0" />
          <div className="flex-1 space-y-2">
            <ShimmerBar width="w-2/5" />
            <ShimmerBar width="w-1/4" className="h-2" />
          </div>
          <div className="w-16 h-6 rounded-md animate-shimmer shrink-0" />
        </div>
      ))}
    </div>
  );
}

export default function SkeletonLoader({
  variant = 'text',
  lines = 3,
  className = '',
}: SkeletonLoaderProps) {
  return (
    <div className={`${className}`} role="status" aria-label="Loading">
      {variant === 'text' && <TextSkeleton lines={lines} />}
      {variant === 'card' && <CardSkeleton />}
      {variant === 'list' && <ListSkeleton lines={lines} />}
      <span className="sr-only">Loading…</span>
    </div>
  );
}

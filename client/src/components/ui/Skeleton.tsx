export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-[var(--radius-card)] bg-[var(--color-gray-light)] ${className}`} />;
}

export function SkeletonCards({ quantidade = 6 }: { quantidade?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: quantidade }).map((_, i) => (
        <div key={i} className="rounded-[var(--radius-card-lg)] border border-[var(--color-gray-light)] bg-white p-5">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="mt-2 h-4 w-1/2" />
          <Skeleton className="mt-3 h-3 w-full" />
          <Skeleton className="mt-1.5 h-3 w-5/6" />
          <Skeleton className="mt-4 h-9 w-full" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonRows({ quantidade = 5 }: { quantidade?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: quantidade }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full" />
      ))}
    </div>
  );
}

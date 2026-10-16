export function ProgressBar({ pct, className = "" }: { pct: number; className?: string }) {
  const valor = Math.max(0, Math.min(100, pct));
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-[var(--color-gray-light)] ${className}`}>
      <div className="h-full rounded-full bg-[var(--color-green)] transition-all" style={{ width: `${valor}%` }} />
    </div>
  );
}

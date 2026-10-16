export function Spinner({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center py-16 ${className}`}>
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-gray-light)] border-t-[var(--color-green)]" />
    </div>
  );
}

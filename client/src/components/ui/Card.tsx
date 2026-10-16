import type { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-[var(--radius-card-lg)] border border-[var(--color-gray-light)] bg-white p-5 shadow-[var(--shadow-card-sm)] ${className}`}
      {...props}
    />
  );
}

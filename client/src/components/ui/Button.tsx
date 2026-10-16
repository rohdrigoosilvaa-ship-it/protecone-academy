import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const estilos: Record<Variant, string> = {
  primary: "bg-[var(--color-green)] text-white hover:bg-[var(--color-green-hover)] shadow-[var(--shadow-brand)]",
  secondary: "bg-white text-[var(--color-ink)] border border-[var(--color-gray-light)] hover:border-[var(--color-green)]",
  ghost: "bg-transparent text-[var(--color-gray-dark)] hover:bg-[var(--color-gray-subtle)]",
  danger: "bg-[var(--color-status-critical-soft)] text-[var(--color-status-critical-fg)] hover:brightness-95",
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ variant = "primary", className = "", ...props }: Props) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-[var(--radius-btn)] px-4 py-2.5 text-sm font-semibold font-[var(--font-ui)] transition disabled:cursor-not-allowed disabled:opacity-50 ${estilos[variant]} ${className}`}
      {...props}
    />
  );
}

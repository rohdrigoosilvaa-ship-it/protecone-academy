type Tom = "verde" | "cinza" | "atencao" | "critico" | "info";

const estilos: Record<Tom, string> = {
  verde: "bg-[var(--color-green-100)] text-[var(--color-green-dark)]",
  cinza: "bg-[var(--color-gray-light)] text-[var(--color-gray-dark)]",
  atencao: "bg-[var(--color-status-attention-soft)] text-[var(--color-status-attention-fg)]",
  critico: "bg-[var(--color-status-critical-soft)] text-[var(--color-status-critical-fg)]",
  info: "bg-[var(--color-status-info-soft)] text-[var(--color-status-info-fg)]",
};

export function Badge({ children, tom = "cinza" }: { children: React.ReactNode; tom?: Tom }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold font-[var(--font-ui)] ${estilos[tom]}`}>
      {children}
    </span>
  );
}

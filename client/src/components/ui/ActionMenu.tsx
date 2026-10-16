import { useEffect, useRef, useState, type ReactNode } from "react";
import { MoreVertical } from "lucide-react";

export interface AcaoMenu {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  perigo?: boolean;
}

export function ActionMenu({ acoes }: { acoes: AcaoMenu[] }) {
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setAberto((v) => !v); }}
        className="rounded-[var(--radius-btn)] p-1.5 text-[var(--color-gray-mid)] hover:bg-[var(--color-gray-subtle)] hover:text-[var(--color-ink)]"
      >
        <MoreVertical size={16} />
      </button>
      {aberto && (
        <div
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          className="absolute right-0 z-20 mt-1 w-48 overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-gray-light)] bg-white py-1 shadow-[var(--shadow-card-lg)]"
        >
          {acoes.map((acao) => (
            <button
              key={acao.label}
              onClick={() => { setAberto(false); acao.onClick(); }}
              className={`flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm font-semibold transition-colors ${
                acao.perigo ? "text-[var(--color-status-critical-fg)] hover:bg-[var(--color-status-critical-soft)]" : "text-[var(--color-gray-dark)] hover:bg-[var(--color-gray-subtle)]"
              }`}
            >
              {acao.icon} {acao.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

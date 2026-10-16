import type { ReactNode } from "react";
import { X } from "lucide-react";

export function Modal({ aberto, onFechar, titulo, children, largura = "max-w-lg" }: { aberto: boolean; onFechar: () => void; titulo: string; children: ReactNode; largura?: string }) {
  if (!aberto) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onFechar}>
      <div
        className={`max-h-[90vh] w-full ${largura} overflow-y-auto rounded-[var(--radius-card-lg)] bg-white p-6 shadow-[var(--shadow-card-lg)]`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">{titulo}</h3>
          <button onClick={onFechar} className="rounded-full p-1 text-[var(--color-gray-mid)] hover:bg-[var(--color-gray-subtle)]">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

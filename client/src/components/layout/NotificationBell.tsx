import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { api } from "../../lib/api";
import type { Notificacao } from "../../lib/types";

export function NotificationBell() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const carregar = async () => {
    try { setNotificacoes(await api<Notificacao[]>("GET", "/api/notificacoes")); } catch { /* silencioso */ }
  };

  useEffect(() => {
    carregar();
    const id = setInterval(carregar, 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const naoLidas = notificacoes.filter((n) => !n.lida).length;

  const marcarTodasLidas = async () => {
    await api("PATCH", "/api/notificacoes/lidas");
    carregar();
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setAberto((v) => !v)} className="relative rounded-full p-2 text-[var(--color-gray-dark)] hover:bg-[var(--color-gray-subtle)]">
        <Bell size={20} />
        {naoLidas > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-status-critical)] px-1 text-[10px] font-bold text-white">
            {naoLidas}
          </span>
        )}
      </button>
      {aberto && (
        <div className="absolute right-0 z-40 mt-2 w-80 rounded-[var(--radius-card-lg)] border border-[var(--color-gray-light)] bg-white shadow-[var(--shadow-card-lg)]">
          <div className="flex items-center justify-between border-b border-[var(--color-gray-light)] px-4 py-3">
            <span className="text-sm font-bold">Notificações</span>
            {naoLidas > 0 && (
              <button onClick={marcarTodasLidas} className="text-xs font-semibold text-[var(--color-green)] hover:underline">
                Marcar todas como lidas
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notificacoes.length === 0 && <p className="px-4 py-6 text-center text-sm text-[var(--color-gray-mid)]">Nenhuma notificação por aqui.</p>}
            {notificacoes.map((n) => (
              <div key={n.id} className={`border-b border-[var(--color-gray-light)] px-4 py-3 text-sm last:border-0 ${!n.lida ? "bg-[var(--color-green-light)]" : ""}`}>
                <p className="text-[var(--color-ink)]">{n.mensagem}</p>
                <p className="mt-1 text-xs text-[var(--color-gray-mid)]">{new Date(n.criadoEm).toLocaleString("pt-BR")}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

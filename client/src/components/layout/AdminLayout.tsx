import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard, BookOpen, HelpCircle, Users, Award, BarChart3, LogOut, ArrowLeftRight, ChevronRight,
  ChevronsLeft, Menu, X, ShieldCheck, Settings,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Avatar } from "../ui/Avatar";
import { useSidebarState } from "./useSidebarState";

const ITENS = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, fim: true },
  { to: "/admin/cursos", label: "Cursos", icon: BookOpen },
  { to: "/admin/questoes", label: "Banco de questões", icon: HelpCircle },
  { to: "/admin/alunos", label: "Alunos", icon: Users },
  { to: "/admin/certificados", label: "Certificados", icon: Award },
  { to: "/admin/relatorios", label: "Relatórios", icon: BarChart3 },
  { to: "/admin/configuracoes", label: "Configurações", icon: Settings },
];

export function AdminLayout() {
  const { usuario, logout } = useAuth();
  const { colapsada, alternarColapsada, mobileAberta, setMobileAberta } = useSidebarState("psa_sidebar_admin");

  return (
    <div className="flex min-h-screen bg-[var(--color-gray-subtle)]">
      {mobileAberta && (
        <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setMobileAberta(false)} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-gradient-to-b from-[#111412] to-black text-white transition-all duration-300 ${
          colapsada ? "md:w-20" : "md:w-64"
        } w-64 ${mobileAberta ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className={`flex items-center border-b border-white/10 px-5 py-6 ${colapsada ? "md:justify-center md:px-0" : "justify-between"}`}>
          <div className={colapsada ? "md:hidden" : ""}>
            <img src="/logo/protechub.png" alt="ProtecHub" className="h-16 w-auto object-contain" />
            <div className="mt-1 text-xs text-white/70">por <strong className="text-white">ProtecSeg</strong></div>
            <div className="mt-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--color-green)]">Administração</div>
          </div>
          {colapsada && <ShieldCheck size={26} className="hidden text-[var(--color-green)] md:block" />}
          <button onClick={() => setMobileAberta(false)} className="rounded-[var(--radius-btn)] p-1.5 text-white/70 hover:bg-white/10 md:hidden">
            <X size={18} />
          </button>
        </div>

        <nav className="flex flex-col gap-1 px-3 py-5">
          {ITENS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.fim}
              title={colapsada ? item.label : undefined}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 overflow-hidden rounded-[var(--radius-card)] px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  colapsada ? "md:justify-center md:px-0" : ""
                } ${isActive ? "bg-white/10 text-white shadow-inner" : "text-white/55 hover:translate-x-0.5 hover:bg-white/5 hover:text-white md:hover:translate-x-0"}`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`absolute inset-y-1.5 left-0 w-[3px] rounded-full bg-[var(--color-green)] transition-transform duration-200 ${isActive ? "scale-y-100" : "scale-y-0"}`} />
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-btn)] transition-colors ${isActive ? "bg-[var(--color-green)] text-white" : "bg-white/5 text-white/60 group-hover:bg-white/10"}`}>
                    <item.icon size={16} />
                  </span>
                  <span className={colapsada ? "md:hidden" : ""}>{item.label}</span>
                  <ChevronRight size={14} className={`ml-auto text-white/40 transition-opacity ${colapsada ? "md:hidden" : ""} ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-60"}`} />
                </>
              )}
            </NavLink>
          ))}

          <NavLink
            to="/dashboard"
            title={colapsada ? "Área do aluno" : undefined}
            className={`group mt-3 flex items-center gap-3 rounded-[var(--radius-card)] border border-white/15 px-3 py-2.5 text-sm font-semibold text-white/80 transition-all hover:border-[var(--color-green)] hover:bg-white/5 hover:text-white ${colapsada ? "md:justify-center md:px-0" : ""}`}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-btn)] bg-white/5 group-hover:bg-white/10">
              <ArrowLeftRight size={16} />
            </span>
            <span className={colapsada ? "md:hidden" : ""}>Área do aluno</span>
          </NavLink>
        </nav>

        <button
          onClick={alternarColapsada}
          className="mx-3 mt-auto hidden items-center justify-center gap-2 rounded-[var(--radius-btn)] py-2 text-xs font-semibold text-white/50 hover:bg-white/5 hover:text-white md:flex"
        >
          <ChevronsLeft size={15} className={`transition-transform ${colapsada ? "rotate-180" : ""}`} />
          {!colapsada && "Recolher"}
        </button>

        <div className={`space-y-3 border-t border-white/10 px-4 py-4 ${colapsada ? "" : "mt-3"}`}>
          <div className={`flex items-center gap-2.5 rounded-[var(--radius-card)] bg-white/5 px-2.5 py-2.5 ${colapsada ? "md:justify-center md:px-0" : ""}`}>
            <Avatar nome={usuario?.nome} />
            <div className={`min-w-0 flex-1 ${colapsada ? "md:hidden" : ""}`}>
              <div className="truncate text-sm font-semibold text-white">{usuario?.nome}</div>
              <div className="truncate text-xs text-white/50">{usuario?.email}</div>
            </div>
          </div>
          <button
            onClick={logout}
            title={colapsada ? "Sair" : undefined}
            className={`flex w-full items-center gap-2 rounded-[var(--radius-btn)] px-3 py-2 text-sm font-semibold text-white/55 transition-colors hover:bg-white/5 hover:text-white ${colapsada ? "md:justify-center md:px-0" : ""}`}
          >
            <LogOut size={16} /> <span className={colapsada ? "md:hidden" : ""}>Sair</span>
          </button>
        </div>
      </aside>

      <div className={`flex flex-1 flex-col transition-all duration-300 ${colapsada ? "md:pl-20" : "md:pl-64"}`}>
        <header className="flex items-center border-b border-[var(--color-gray-light)] bg-white px-4 py-3 md:hidden">
          <button onClick={() => setMobileAberta(true)} className="rounded-[var(--radius-btn)] p-1.5 text-[var(--color-gray-dark)] hover:bg-[var(--color-gray-subtle)]">
            <Menu size={20} />
          </button>
        </header>
        <main className="flex-1 p-6 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, CheckCircle2, Award, PlayCircle, Clock } from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import type { Certificado, Matricula } from "../../lib/types";
import { Card } from "../../components/ui/Card";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { Button } from "../../components/ui/Button";
import { Spinner } from "../../components/ui/Spinner";
import { EmptyState } from "../../components/ui/EmptyState";

export function DashboardPage() {
  const { usuario } = useAuth();
  const [matriculas, setMatriculas] = useState<Matricula[] | null>(null);
  const [certificados, setCertificados] = useState<Certificado[] | null>(null);

  useEffect(() => {
    api<Matricula[]>("GET", "/api/matriculas/minhas").then(setMatriculas);
    api<Certificado[]>("GET", "/api/certificados/minhas").then(setCertificados);
  }, []);

  if (!matriculas || !certificados) return <Spinner />;

  const emAndamento = matriculas.filter((m) => m.status === "ATIVA");
  const concluidos = matriculas.filter((m) => m.status === "CONCLUIDA");
  const continuar = [...emAndamento].sort((a, b) => +new Date(b.matriculadoEm) - +new Date(a.matriculadoEm))[0];

  return (
    <div className="max-w-6xl">
      <h1 className="text-2xl font-bold text-[var(--color-ink)]">Olá, {usuario?.nome?.split(" ")[0]}!</h1>
      <p className="mt-1 text-[var(--color-gray-mid)]">Continue seu desenvolvimento. Você está mais perto de concluir seus treinamentos.</p>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <CardIndicador icone={<PlayCircle size={20} />} label="Em andamento" valor={emAndamento.length} />
        <CardIndicador icone={<CheckCircle2 size={20} />} label="Concluídos" valor={concluidos.length} />
        <CardIndicador icone={<Award size={20} />} label="Certificados" valor={certificados.length} />
      </div>

      <h2 className="mb-3 mt-8 text-base font-bold text-[var(--color-ink)]">Continue de onde parou</h2>
      {continuar ? (
        <Card className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <img
            src={continuar.curso?.imagemCapaUrl || undefined}
            className="h-28 w-full rounded-[var(--radius-card)] bg-[var(--color-green-100)] object-cover sm:w-44"
            style={!continuar.curso?.imagemCapaUrl ? { display: "none" } : undefined}
          />
          <div className="flex-1">
            <div className="text-xs font-semibold uppercase tracking-wide text-[var(--color-green)]">{continuar.curso?.categoria?.nome || "Treinamento"}</div>
            <h3 className="text-lg font-bold text-[var(--color-ink)]">{continuar.curso?.nome}</h3>
            <div className="mt-2 flex items-center gap-2">
              <ProgressBar pct={continuar.progressoPct} className="max-w-xs" />
              <span className="text-sm font-semibold text-[var(--color-gray-mid)]">{continuar.progressoPct}%</span>
            </div>
          </div>
          <Link to={`/cursos/${continuar.cursoId}`}>
            <Button>Continuar treinamento</Button>
          </Link>
        </Card>
      ) : (
        <EmptyState icone={<BookOpen size={32} />} titulo="Nenhum treinamento em andamento" descricao="Veja seus cursos matriculados em “Meus cursos”." acao={<Link to="/treinamentos"><Button>Ver meus cursos</Button></Link>} />
      )}

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-base font-bold text-[var(--color-ink)]">Meus certificados</h2>
        {certificados.length > 0 && <Link to="/certificados" className="text-sm font-semibold text-[var(--color-green)] hover:underline">Ver todos</Link>}
      </div>
      {certificados.length === 0 ? (
        <p className="mt-2 text-sm text-[var(--color-gray-mid)]">Você ainda não conquistou nenhum certificado.</p>
      ) : (
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {certificados.slice(0, 3).map((c) => (
            <Card key={c.id} className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-green-100)] text-[var(--color-green-dark)]">
                <Award size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold text-[var(--color-ink)]">{c.curso.nome}</div>
                <div className="flex items-center gap-1 text-xs text-[var(--color-gray-mid)]"><Clock size={12} /> {new Date(c.emitidoEm).toLocaleDateString("pt-BR")}</div>
              </div>
              <Link to="/certificados" className="text-xs font-semibold text-[var(--color-green)] hover:underline">Ver</Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function CardIndicador({ icone, label, valor }: { icone: React.ReactNode; label: string; valor: number }) {
  return (
    <Card className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-card)] bg-[var(--color-green-100)] text-[var(--color-green-dark)]">{icone}</div>
      <div>
        <div className="text-xl font-extrabold text-[var(--color-ink)]">{valor}</div>
        <div className="text-xs font-semibold text-[var(--color-gray-mid)]">{label}</div>
      </div>
    </Card>
  );
}

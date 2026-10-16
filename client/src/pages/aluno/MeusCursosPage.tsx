import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Clock, Layers, GraduationCap } from "lucide-react";
import { api } from "../../lib/api";
import type { Matricula } from "../../lib/types";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { Button } from "../../components/ui/Button";
import { Spinner } from "../../components/ui/Spinner";
import { EmptyState } from "../../components/ui/EmptyState";

const STATUS_LABEL: Record<string, string> = { ATIVA: "Em andamento", CONCLUIDA: "Concluído" };

// Só mostra cursos em que o aluno tem matrícula concedida pelo admin —
// não é mais um catálogo de auto-inscrição (seção 6-7 do fluxo de acesso).
export function MeusCursosPage() {
  const [matriculas, setMatriculas] = useState<Matricula[] | null>(null);

  useEffect(() => { api<Matricula[]>("GET", "/api/matriculas/minhas").then(setMatriculas); }, []);

  if (!matriculas) return <Spinner />;

  return (
    <div className="max-w-6xl">
      <h1 className="text-2xl font-bold text-[var(--color-ink)]">Meus cursos</h1>
      <p className="mt-1 text-[var(--color-gray-mid)]">Treinamentos em que você foi matriculado.</p>

      {matriculas.length === 0 ? (
        <EmptyState
          className="mt-6"
          icone={<GraduationCap size={32} />}
          titulo="Você ainda não possui cursos matriculados."
          descricao="Entre em contato com o administrador para receber acesso aos treinamentos."
        />
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {matriculas.map((m) => {
            const curso = m.curso!;
            return (
              <Card key={m.id} className="flex flex-col p-0 overflow-hidden">
                <div
                  className="h-32 bg-gradient-to-br from-[var(--color-green)] to-[var(--color-institutional-deep)]"
                  style={curso.imagemCapaUrl ? { backgroundImage: `url(${curso.imagemCapaUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
                />
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center gap-2">
                    {curso.categoria && <Badge tom="verde">{curso.categoria.nome}</Badge>}
                    <Badge tom={m.status === "CONCLUIDA" ? "verde" : "info"}>{STATUS_LABEL[m.status]}</Badge>
                  </div>
                  <h3 className="mt-2 text-base font-bold text-[var(--color-ink)]">{curso.nome}</h3>
                  <p className="mt-1 line-clamp-2 flex-1 text-sm text-[var(--color-gray-mid)]">{curso.descricao}</p>

                  <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold text-[var(--color-gray-mid)]">
                    <span className="flex items-center gap-1"><Layers size={13} /> {curso._count?.modulos ?? 0} módulos</span>
                    {curso.cargaHoraria && <span className="flex items-center gap-1"><Clock size={13} /> {curso.cargaHoraria}</span>}
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <ProgressBar pct={m.progressoPct} />
                    <span className="text-xs font-semibold text-[var(--color-gray-mid)]">{m.progressoPct}%</span>
                  </div>

                  <Link to={`/cursos/${curso.id}`} className="mt-4">
                    <Button className="w-full">{m.status === "CONCLUIDA" ? "Revisar curso" : "Continuar curso"}</Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

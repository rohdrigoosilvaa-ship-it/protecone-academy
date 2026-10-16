import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HelpCircle } from "lucide-react";
import { api } from "../../lib/api";
import type { Curso } from "../../lib/types";
import { Card } from "../../components/ui/Card";
import { Spinner } from "../../components/ui/Spinner";

// o banco de questões é por curso (seção 21) — esta tela só ajuda a escolher
// qual curso abrir direto na aba "Banco de questões".
export function QuestoesIndexPage() {
  const [cursos, setCursos] = useState<Curso[] | null>(null);
  useEffect(() => { api<Curso[]>("GET", "/api/cursos").then(setCursos); }, []);

  if (!cursos) return <Spinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--color-ink)]">Banco de questões</h1>
      <p className="mt-1 text-[var(--color-gray-mid)]">Escolha um curso para gerenciar suas questões de quiz e prova final.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cursos.map((curso) => (
          <Link key={curso.id} to={`/admin/cursos/${curso.id}?aba=questoes`}>
            <Card className="flex items-center gap-3 transition hover:border-[var(--color-green)]">
              <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-card)] bg-[var(--color-green-100)] text-[var(--color-green-dark)]">
                <HelpCircle size={18} />
              </div>
              <span className="font-bold text-[var(--color-ink)]">{curso.nome}</span>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

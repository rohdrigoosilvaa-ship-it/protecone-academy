import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Ban } from "lucide-react";
import { api } from "../../lib/api";
import type { Matricula, Usuario } from "../../lib/types";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { EmptyState } from "../ui/EmptyState";
import { MatricularModal } from "./MatricularModal";

const STATUS_TOM = { ATIVA: "info", CONCLUIDA: "verde", CANCELADA: "critico", EXPIRADA: "atencao" } as const;
const STATUS_LABEL = { ATIVA: "Em andamento", CONCLUIDA: "Concluído", CANCELADA: "Cancelada", EXPIRADA: "Expirada" } as const;

function data(iso: string | null) {
  return iso ? new Date(iso).toLocaleDateString("pt-BR") : "—";
}

export function AlunosCursoTab({ cursoId }: { cursoId: number }) {
  const [matriculas, setMatriculas] = useState<(Matricula & { usuario: Usuario })[] | null>(null);
  const [modalAberto, setModalAberto] = useState(false);

  const carregar = () => api<(Matricula & { usuario: Usuario })[]>("GET", `/api/matriculas/curso/${cursoId}`).then(setMatriculas);
  useEffect(() => { carregar(); }, [cursoId]);

  const cancelar = async (matriculaId: number) => {
    if (!confirm("Cancelar esta matrícula? O aluno perde o acesso ao curso, mas o histórico é mantido.")) return;
    await api("PATCH", `/api/matriculas/${matriculaId}/cancelar`);
    carregar();
  };

  if (!matriculas) return null;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-[var(--color-gray-mid)]">Alunos matriculados: {matriculas.length}</p>
        <Button onClick={() => setModalAberto(true)}><Plus size={16} /> Matricular aluno</Button>
      </div>

      {matriculas.length === 0 ? (
        <EmptyState titulo="Nenhum aluno matriculado ainda" descricao="Use o botão acima para matricular alunos neste curso." />
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-[var(--color-gray-light)] text-left text-xs font-bold uppercase text-[var(--color-gray-mid)]">
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">E-mail</th>
                <th className="px-4 py-3">Progresso</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Matrícula</th>
                <th className="px-4 py-3">Conclusão</th>
                <th className="px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {matriculas.map((m) => (
                <tr key={m.id} className="border-b border-[var(--color-gray-light)] last:border-0">
                  <td className="px-4 py-3">
                    <Link to={`/admin/alunos/${m.usuarioId}`} className="font-semibold text-[var(--color-ink)] hover:text-[var(--color-green)]">{m.usuario.nome}</Link>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-gray-mid)]">{m.usuario.email}</td>
                  <td className="px-4 py-3 text-[var(--color-gray-dark)]">{m.progressoPct}%</td>
                  <td className="px-4 py-3"><Badge tom={STATUS_TOM[m.status]}>{STATUS_LABEL[m.status]}</Badge></td>
                  <td className="px-4 py-3 text-[var(--color-gray-mid)]">{data(m.matriculadoEm)}</td>
                  <td className="px-4 py-3 text-[var(--color-gray-mid)]">{data(m.concluidoEm)}</td>
                  <td className="px-4 py-3">
                    {m.status !== "CANCELADA" && (
                      <button onClick={() => cancelar(m.id)} className="flex items-center gap-1 text-xs font-semibold text-[var(--color-status-critical-fg)] hover:underline">
                        <Ban size={12} /> Cancelar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <MatricularModal aberto={modalAberto} onFechar={() => setModalAberto(false)} onMatriculado={carregar} cursoIdFixo={cursoId} />
    </div>
  );
}

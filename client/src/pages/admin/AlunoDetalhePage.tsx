import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Award, Plus, Ban } from "lucide-react";
import { api } from "../../lib/api";
import type { Certificado, Matricula, ProvaTentativa, Usuario } from "../../lib/types";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { Spinner } from "../../components/ui/Spinner";
import { MatricularModal } from "../../components/admin/MatricularModal";

interface Relatorio {
  usuario: Usuario;
  matriculas: (Matricula & { curso: { nome: string } })[];
  provaTentativas: (ProvaTentativa & { curso: { nome: string } })[];
  certificados: Certificado[];
}

const STATUS_TOM = { ATIVA: "info", CONCLUIDA: "verde", CANCELADA: "critico", EXPIRADA: "atencao" } as const;
const STATUS_LABEL = { ATIVA: "Em andamento", CONCLUIDA: "Concluído", CANCELADA: "Cancelada", EXPIRADA: "Expirada" } as const;

function data(iso: string | null) {
  return iso ? new Date(iso).toLocaleDateString("pt-BR") : "—";
}

export function AlunoDetalhePage() {
  const { usuarioId } = useParams();
  const [dados, setDados] = useState<Relatorio | null>(null);
  const [modalAberto, setModalAberto] = useState(false);

  const carregar = () => api<Relatorio>("GET", `/api/relatorios/alunos/${usuarioId}`).then(setDados);
  useEffect(() => { carregar(); }, [usuarioId]);

  const cancelar = async (matriculaId: number) => {
    if (!confirm("Cancelar esta matrícula? O aluno perde o acesso ao curso, mas o histórico é mantido.")) return;
    await api("PATCH", `/api/matriculas/${matriculaId}/cancelar`);
    carregar();
  };

  if (!dados) return <Spinner />;
  const { usuario, matriculas, provaTentativas, certificados } = dados;

  return (
    <div className="max-w-3xl">
      <Link to="/admin/alunos" className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-[var(--color-gray-mid)] hover:text-[var(--color-green)]">
        <ArrowLeft size={15} /> Todos os alunos
      </Link>

      <h1 className="text-2xl font-bold text-[var(--color-ink)]">{usuario.nome}</h1>
      <p className="text-[var(--color-gray-mid)]">{usuario.email} · {usuario.perfil === "ADMIN" ? "Administrador" : "Aluno"}</p>

      <div className="mb-3 mt-6 flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--color-gray-mid)]">Cursos do aluno</h2>
        {usuario.perfil === "ALUNO" && (
          <Button variant="secondary" onClick={() => setModalAberto(true)}><Plus size={15} /> Matricular em curso</Button>
        )}
      </div>
      <div className="space-y-3">
        {matriculas.map((m) => (
          <Card key={m.id}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="font-bold text-[var(--color-ink)]">{m.curso.nome}</div>
                <div className="mt-1.5 flex items-center gap-2">
                  <ProgressBar pct={m.progressoPct} className="max-w-xs" />
                  <span className="text-xs font-semibold text-[var(--color-gray-mid)]">{m.progressoPct}%</span>
                </div>
                <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs text-[var(--color-gray-mid)] sm:grid-cols-4">
                  <div>Matrícula: {data(m.matriculadoEm)}</div>
                  <div>Início: {data(m.iniciadoEm)}</div>
                  <div>Conclusão: {data(m.concluidoEm)}</div>
                  <div>Vencimento: {data(m.expiraEm)}</div>
                </dl>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <Badge tom={STATUS_TOM[m.status]}>{STATUS_LABEL[m.status]}</Badge>
                {m.status !== "CANCELADA" && (
                  <button onClick={() => cancelar(m.id)} className="flex items-center gap-1 text-xs font-semibold text-[var(--color-status-critical-fg)] hover:underline">
                    <Ban size={12} /> Cancelar matrícula
                  </button>
                )}
              </div>
            </div>
          </Card>
        ))}
        {matriculas.length === 0 && <p className="text-sm text-[var(--color-gray-mid)]">Nenhuma matrícula ainda.</p>}
      </div>

      <h2 className="mb-3 mt-6 text-sm font-bold uppercase tracking-wide text-[var(--color-gray-mid)]">Tentativas de prova final</h2>
      <div className="space-y-2">
        {provaTentativas.filter((t) => t.finalizadoEm).map((t) => (
          <Card key={t.id} className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-[var(--color-ink)]">{t.curso.nome} — tentativa {t.tentativaNum}</div>
              <div className="text-xs text-[var(--color-gray-mid)]">{t.finalizadoEm && new Date(t.finalizadoEm).toLocaleDateString("pt-BR")}</div>
            </div>
            <Badge tom={t.aprovado ? "verde" : "critico"}>{t.nota}% {t.aprovado ? "· Aprovado" : "· Reprovado"}</Badge>
          </Card>
        ))}
        {provaTentativas.filter((t) => t.finalizadoEm).length === 0 && <p className="text-sm text-[var(--color-gray-mid)]">Nenhuma tentativa registrada.</p>}
      </div>

      <h2 className="mb-3 mt-6 text-sm font-bold uppercase tracking-wide text-[var(--color-gray-mid)]">Certificados</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {certificados.map((c) => (
          <Card key={c.id} className="flex items-center gap-3">
            <Award size={18} className="text-[var(--color-green)]" />
            <div>
              <div className="text-sm font-bold text-[var(--color-ink)]">{c.curso.nome}</div>
              <div className="font-mono text-xs text-[var(--color-gray-mid)]">{c.codigo}</div>
            </div>
          </Card>
        ))}
        {certificados.length === 0 && <p className="text-sm text-[var(--color-gray-mid)]">Nenhum certificado ainda.</p>}
      </div>

      <MatricularModal
        aberto={modalAberto}
        onFechar={() => setModalAberto(false)}
        onMatriculado={carregar}
        usuarioIdFixo={Number(usuarioId)}
      />
    </div>
  );
}

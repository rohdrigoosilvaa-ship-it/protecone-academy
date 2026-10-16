import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Users, BookOpen, PlayCircle, CheckCircle2, Award, TrendingUp, UserPlus, XCircle, FileEdit, AlertTriangle, Download, ClipboardList } from "lucide-react";
import { api } from "../../lib/api";
import { baixarCsv } from "../../lib/csv";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Spinner } from "../../components/ui/Spinner";

interface DesempenhoCurso {
  id: number; nome: string; status: string; alunos: number;
  progressoMedio: number; taxaConclusao: number; taxaAprovacao: number | null; notaMedia: number | null;
}

interface Dashboard {
  indicadores: {
    totalAlunos: number; totalCursos: number; cursosAtivos: number; totalMatriculas: number;
    matriculasAndamento: number; matriculasConcluidas: number; certificadosEmitidos: number; taxaAprovacao: number;
    cursosRascunho: number; alunosNovos30d: number; conclusoesMes: number; reprovacoes: number;
  };
  alunosPorCurso: { nome: string; alunos: number }[];
  notasMedias: { nome: string; notaMedia: number }[];
  conclusoesPorPeriodo: { mes: string; total: number }[];
  desempenhoPorCurso: DesempenhoCurso[];
  atencao: {
    alunosInativos: { id: number; nome: string; email: string; ultimoLoginEm: string | null }[];
    cursosRascunho: { id: number; nome: string }[];
    aprovadosSemCertificado: number;
  };
}

const STATUS_TOM = { RASCUNHO: "cinza", PUBLICADO: "verde", ARQUIVADO: "atencao" } as const;

export function AdminDashboardPage() {
  const [dados, setDados] = useState<Dashboard | null>(null);
  useEffect(() => { api<Dashboard>("GET", "/api/relatorios/dashboard").then(setDados); }, []);

  if (!dados) return <Spinner />;
  const { indicadores, atencao } = dados;
  const temAtencao = atencao.alunosInativos.length > 0 || atencao.cursosRascunho.length > 0 || atencao.aprovadosSemCertificado > 0;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--color-ink)]">Dashboard</h1>
      <p className="mt-1 text-[var(--color-gray-mid)]">Visão geral da ProtecSeg Academy.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Indicador icone={<Users size={18} />} label="Total de alunos" valor={indicadores.totalAlunos} />
        <Indicador icone={<BookOpen size={18} />} label="Cursos ativos" valor={`${indicadores.cursosAtivos} / ${indicadores.totalCursos}`} />
        <Indicador icone={<ClipboardList size={18} />} label="Matrículas" valor={indicadores.totalMatriculas} />
        <Indicador icone={<PlayCircle size={18} />} label="Em andamento" valor={indicadores.matriculasAndamento} />
        <Indicador icone={<CheckCircle2 size={18} />} label="Concluídos" valor={indicadores.matriculasConcluidas} />
        <Indicador icone={<Award size={18} />} label="Certificados emitidos" valor={indicadores.certificadosEmitidos} />
        <Indicador icone={<TrendingUp size={18} />} label="Taxa média de aprovação" valor={`${indicadores.taxaAprovacao}%`} />
        <Indicador icone={<UserPlus size={18} />} label="Alunos novos (30 dias)" valor={indicadores.alunosNovos30d} />
        <Indicador icone={<XCircle size={18} />} label="Reprovações na prova final" valor={indicadores.reprovacoes} />
      </div>

      {temAtencao && (
        <Card className="mt-6 border-[var(--color-status-attention)] bg-[var(--color-status-attention-soft)]">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-[var(--color-status-attention-fg)]">
            <AlertTriangle size={16} /> Atenção
          </h3>
          <div className="grid gap-4 sm:grid-cols-3">
            {atencao.alunosInativos.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-[var(--color-status-attention-fg)]">Sem acesso há 15+ dias ({atencao.alunosInativos.length})</div>
                <ul className="mt-1.5 space-y-1">
                  {atencao.alunosInativos.slice(0, 5).map((a) => (
                    <li key={a.id} className="truncate text-sm text-[var(--color-ink)]">{a.nome}</li>
                  ))}
                </ul>
              </div>
            )}
            {atencao.cursosRascunho.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-[var(--color-status-attention-fg)]">Cursos em rascunho ({atencao.cursosRascunho.length})</div>
                <ul className="mt-1.5 space-y-1">
                  {atencao.cursosRascunho.slice(0, 5).map((c) => (
                    <li key={c.id}><Link to={`/admin/cursos/${c.id}`} className="truncate text-sm text-[var(--color-ink)] hover:underline">{c.nome}</Link></li>
                  ))}
                </ul>
              </div>
            )}
            {atencao.aprovadosSemCertificado > 0 && (
              <div>
                <div className="text-xs font-semibold text-[var(--color-status-attention-fg)]">Aprovações sem certificado emitido</div>
                <p className="mt-1.5 text-sm text-[var(--color-ink)]">{atencao.aprovadosSemCertificado} caso(s) — verifique em Certificados.</p>
              </div>
            )}
          </div>
        </Card>
      )}

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 text-sm font-bold text-[var(--color-ink)]">Alunos por curso</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={dados.alunosPorCurso}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-gray-light)" vertical={false} />
              <XAxis dataKey="nome" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="alunos" fill="var(--color-green)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="mb-3 text-sm font-bold text-[var(--color-ink)]">Nota média da prova final por curso</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={dados.notasMedias}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-gray-light)" vertical={false} />
              <XAxis dataKey="nome" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="notaMedia" fill="var(--color-institutional)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="mb-3 text-sm font-bold text-[var(--color-ink)]">Conclusões por período</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={dados.conclusoesPorPeriodo}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-gray-light)" vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="total" stroke="var(--color-green)" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="mb-3 mt-8 flex items-center justify-between">
        <h3 className="text-sm font-bold text-[var(--color-ink)]">Desempenho dos cursos</h3>
        {dados.desempenhoPorCurso.length > 0 && (
          <Button
            variant="secondary"
            onClick={() => baixarCsv("desempenho-cursos", dados.desempenhoPorCurso.map((c) => ({
              Curso: c.nome, Status: c.status, Alunos: c.alunos, "Progresso médio (%)": c.progressoMedio,
              "Taxa de conclusão (%)": c.taxaConclusao, "Taxa de aprovação (%)": c.taxaAprovacao ?? "", "Nota média": c.notaMedia ?? "",
            })))}
          >
            <Download size={15} /> Exportar CSV
          </Button>
        )}
      </div>
      {dados.desempenhoPorCurso.length === 0 ? (
        <Card className="flex items-center gap-2 text-sm text-[var(--color-gray-mid)]">
          <FileEdit size={16} /> Nenhum dado disponível ainda.
        </Card>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-[var(--color-gray-light)] text-left text-xs font-bold uppercase text-[var(--color-gray-mid)]">
                <th className="px-4 py-3">Curso</th>
                <th className="px-4 py-3">Alunos</th>
                <th className="px-4 py-3">Progresso médio</th>
                <th className="px-4 py-3">Taxa de conclusão</th>
                <th className="px-4 py-3">Taxa de aprovação</th>
                <th className="px-4 py-3">Nota média</th>
              </tr>
            </thead>
            <tbody>
              {dados.desempenhoPorCurso.map((c) => (
                <tr key={c.id} className="border-b border-[var(--color-gray-light)] last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link to={`/admin/cursos/${c.id}`} className="font-semibold text-[var(--color-ink)] hover:text-[var(--color-green)]">{c.nome}</Link>
                      <Badge tom={STATUS_TOM[c.status as keyof typeof STATUS_TOM]}>{c.status}</Badge>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-gray-dark)]">{c.alunos}</td>
                  <td className="px-4 py-3 text-[var(--color-gray-dark)]">{c.progressoMedio}%</td>
                  <td className="px-4 py-3 text-[var(--color-gray-dark)]">{c.taxaConclusao}%</td>
                  <td className="px-4 py-3 text-[var(--color-gray-dark)]">{c.taxaAprovacao != null ? `${c.taxaAprovacao}%` : "—"}</td>
                  <td className="px-4 py-3 text-[var(--color-gray-dark)]">{c.notaMedia != null ? `${c.notaMedia}%` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

function Indicador({ icone, label, valor }: { icone: React.ReactNode; label: string; valor: string | number }) {
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

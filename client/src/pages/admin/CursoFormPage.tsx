import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Trash2, Check, Circle } from "lucide-react";
import { api } from "../../lib/api";
import type { Curso, Modulo, Questao } from "../../lib/types";
import { Badge } from "../../components/ui/Badge";
import { Spinner } from "../../components/ui/Spinner";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { DadosGeraisTab } from "../../components/admin/DadosGeraisTab";
import { ModulosAulasTab } from "../../components/admin/ModulosAulasTab";
import { QuestoesTab } from "../../components/admin/QuestoesTab";
import { AlunosCursoTab } from "../../components/admin/AlunosCursoTab";

const ABAS = [
  { id: "dados", label: "Dados gerais" },
  { id: "modulos", label: "Módulos e aulas" },
  { id: "questoes", label: "Banco de questões" },
  { id: "alunos", label: "Alunos" },
] as const;

export function CursoFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [curso, setCurso] = useState<Curso | null>(null);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [numQuestoes, setNumQuestoes] = useState(0);
  const abaInicial = ABAS.find((a) => a.id === searchParams.get("aba"))?.id || "dados";
  const [aba, setAba] = useState<(typeof ABAS)[number]["id"]>(abaInicial);

  const carregarQuestoes = () => api<Questao[]>("GET", `/api/questoes?cursoId=${id}`).then((qs) => setNumQuestoes(qs.length));

  const carregar = () => {
    api<Curso>("GET", `/api/cursos/${id}`).then(setCurso);
    api<Modulo[]>("GET", `/api/modulos/curso/${id}`).then(setModulos);
    carregarQuestoes();
  };
  useEffect(() => { carregar(); }, [id]);
  // reconsulta módulos/questões ao trocar de aba, para o resumo de
  // configuração e o filtro do banco de questões ficarem sempre atuais
  useEffect(() => {
    if (aba === "questoes") { api<Modulo[]>("GET", `/api/modulos/curso/${id}`).then(setModulos); }
    if (aba === "dados") carregarQuestoes();
  }, [aba, id]);

  const excluirCurso = async () => {
    if (!confirm(`Excluir o curso "${curso?.nome}" e todo o seu conteúdo? Esta ação não pode ser desfeita.`)) return;
    await api("DELETE", `/api/cursos/${id}`);
    navigate("/admin/cursos");
  };

  if (!curso) return <Spinner />;

  return (
    <div className="max-w-4xl">
      <Link to="/admin/cursos" className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-[var(--color-gray-mid)] hover:text-[var(--color-green)]">
        <ArrowLeft size={15} /> Todos os cursos
      </Link>

      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[var(--color-ink)]">{curso.nome}</h1>
            <Badge tom={curso.status === "PUBLICADO" ? "verde" : curso.status === "ARQUIVADO" ? "atencao" : "cinza"}>{curso.status}</Badge>
          </div>
          <p className="mt-1 text-sm text-[var(--color-gray-mid)]">
            {modulos.length} módulos · {curso._count?.matriculas ?? 0} alunos matriculados
          </p>
        </div>
        <button onClick={excluirCurso} className="flex items-center gap-1.5 text-sm font-semibold text-[var(--color-status-critical)] hover:underline">
          <Trash2 size={15} /> Excluir curso
        </button>
      </div>

      <ConfiguracaoProgresso curso={curso} temModulos={modulos.length > 0} numQuestoes={numQuestoes} />

      <div className="mb-6 flex gap-1 border-b border-[var(--color-gray-light)]">
        {ABAS.map((a) => (
          <button
            key={a.id}
            onClick={() => setAba(a.id)}
            className={`border-b-2 px-4 py-2.5 text-sm font-semibold transition ${aba === a.id ? "border-[var(--color-green)] text-[var(--color-green-dark)]" : "border-transparent text-[var(--color-gray-mid)] hover:text-[var(--color-ink)]"}`}
          >
            {a.label}
          </button>
        ))}
      </div>

      {aba === "dados" && <DadosGeraisTab curso={curso} onAtualizado={setCurso} />}
      {aba === "modulos" && <ModulosAulasTab cursoId={curso.id} />}
      {aba === "questoes" && <QuestoesTab cursoId={curso.id} modulos={modulos} />}
      {aba === "alunos" && <AlunosCursoTab cursoId={curso.id} />}
    </div>
  );
}

function ConfiguracaoProgresso({ curso, temModulos, numQuestoes }: { curso: Curso; temModulos: boolean; numQuestoes: number }) {
  const etapas = [
    { label: "Informações", ok: !!(curso.nome && curso.descricao && curso.cargaHoraria) },
    { label: "Conteúdo", ok: temModulos },
    { label: "Questões", ok: numQuestoes > 0 },
    { label: "Certificado", ok: curso.certificadoHabilitado },
    { label: "Publicação", ok: curso.status === "PUBLICADO" },
  ];
  const pct = Math.round((etapas.filter((e) => e.ok).length / etapas.length) * 100);

  return (
    <div className="mb-6 rounded-[var(--radius-card-lg)] border border-[var(--color-gray-light)] bg-white p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-bold text-[var(--color-ink)]">Configuração do curso</span>
        <span className="text-sm font-bold text-[var(--color-green)]">{pct}%</span>
      </div>
      <ProgressBar pct={pct} />
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
        {etapas.map((e) => (
          <span key={e.label} className={`flex items-center gap-1.5 text-xs font-semibold ${e.ok ? "text-[var(--color-green-dark)]" : "text-[var(--color-gray-mid)]"}`}>
            {e.ok ? <Check size={13} /> : <Circle size={13} />} {e.label}
          </span>
        ))}
      </div>
    </div>
  );
}

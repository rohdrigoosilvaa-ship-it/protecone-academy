import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, ChevronDown, Lock, PlayCircle, FileText, HelpCircle, Award, Clock, Layers, UserRound, Target, Users2, ListChecks, Sparkles } from "lucide-react";
import { api, ApiError } from "../../lib/api";
import type { ProgressoCurso } from "../../lib/types";
import { Card } from "../../components/ui/Card";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { Button } from "../../components/ui/Button";
import { Spinner } from "../../components/ui/Spinner";
import { Badge } from "../../components/ui/Badge";
import { AcessoNegado } from "../../components/aluno/AcessoNegado";

export function CursoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dados, setDados] = useState<ProgressoCurso | null>(null);
  const [negado, setNegado] = useState(false);
  const [moduloAberto, setModuloAberto] = useState<number | null>(null);

  const carregar = async () => {
    try {
      const r = await api<ProgressoCurso>("GET", `/api/cursos/${id}/progresso`);
      setDados(r);
      setModuloAberto((atual) => atual ?? r.moduloAtualId ?? r.modulos[0]?.id ?? null);
    } catch (e) {
      if (e instanceof ApiError && e.status === 403) setNegado(true);
      else throw e;
    }
  };

  useEffect(() => { carregar(); }, [id]);

  if (negado) return <AcessoNegado />;
  if (!dados) return <Spinner />;
  const { curso, modulos, progressoPct, provaFinalLiberada, provaFinalAprovada } = dados;

  return (
    <div className="max-w-4xl">
      <Card className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          {curso.imagemCapaUrl && <img src={curso.imagemCapaUrl} className="h-28 w-full rounded-[var(--radius-card)] object-cover sm:w-44" />}
          <div className="flex-1">
            {curso.categoria && <Badge tom="verde">{curso.categoria.nome}</Badge>}
            <h1 className="mt-2 text-xl font-bold text-[var(--color-ink)]">{curso.nome}</h1>
            <p className="mt-1 text-sm text-[var(--color-gray-mid)]">{curso.descricao}</p>
            <div className="mt-3 flex flex-wrap gap-4 text-xs font-semibold text-[var(--color-gray-mid)]">
              <span className="flex items-center gap-1"><Layers size={13} /> {modulos.length} módulos</span>
              {curso.cargaHoraria && <span className="flex items-center gap-1"><Clock size={13} /> {curso.cargaHoraria}</span>}
              <span className="flex items-center gap-1"><Award size={13} /> {curso.notaMinimaProva}% para aprovação</span>
              {curso.instrutor && <span className="flex items-center gap-1"><UserRound size={13} /> {curso.instrutor}</span>}
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <ProgressBar pct={progressoPct} />
          <span className="whitespace-nowrap text-sm font-bold text-[var(--color-ink)]">{progressoPct}% concluído</span>
        </div>
      </Card>

      {(curso.objetivos || curso.publicoAlvo || curso.preRequisitos || curso.competencias) && (
        <Card className="mb-6 grid gap-4 sm:grid-cols-2">
          {curso.objetivos && <InfoBloco icone={<Target size={15} />} titulo="Objetivos" texto={curso.objetivos} />}
          {curso.publicoAlvo && <InfoBloco icone={<Users2 size={15} />} titulo="Público-alvo" texto={curso.publicoAlvo} />}
          {curso.preRequisitos && <InfoBloco icone={<ListChecks size={15} />} titulo="Pré-requisitos" texto={curso.preRequisitos} />}
          {curso.competencias && <InfoBloco icone={<Sparkles size={15} />} titulo="Competências desenvolvidas" texto={curso.competencias} />}
        </Card>
      )}

      <div className="space-y-3">
        {modulos.map((modulo, i) => {
          const aberto = moduloAberto === modulo.id;
          return (
            <Card key={modulo.id} className="p-0 overflow-hidden">
              <button
                onClick={() => setModuloAberto(aberto ? null : modulo.id)}
                className="flex w-full items-center gap-3 px-5 py-4 text-left disabled:cursor-not-allowed"
                disabled={!modulo.liberado}
              >
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${modulo.quiz.aprovado ? "bg-[var(--color-green-100)] text-[var(--color-green-dark)]" : modulo.liberado ? "bg-[var(--color-green)] text-white" : "bg-[var(--color-gray-light)] text-[var(--color-gray-mid)]"}`}>
                  {modulo.quiz.aprovado ? <CheckCircle2 size={16} /> : modulo.liberado ? i + 1 : <Lock size={14} />}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-[var(--color-ink)]">{modulo.nome}</div>
                  {modulo.descricao && <div className="text-xs text-[var(--color-gray-mid)]">{modulo.descricao}</div>}
                </div>
                {modulo.liberado && <ChevronDown size={18} className={`transition ${aberto ? "rotate-180" : ""}`} />}
              </button>

              {aberto && modulo.liberado && (
                <div className="border-t border-[var(--color-gray-light)] px-5 py-3">
                  <ul className="space-y-1">
                    {modulo.aulas.map((aula) => (
                      <li key={aula.id}>
                        <button
                          onClick={() => !aula.bloqueada && navigate(`/cursos/${curso.id}/aulas/${aula.id}`)}
                          disabled={aula.bloqueada}
                          className="flex w-full items-center gap-2.5 rounded-[var(--radius-btn)] px-2 py-2 text-left text-sm hover:bg-[var(--color-gray-subtle)] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {aula.concluida ? <CheckCircle2 size={16} className="shrink-0 text-[var(--color-green)]" /> : aula.bloqueada ? <Lock size={14} className="shrink-0 text-[var(--color-gray-mid)]" /> : <PlayCircle size={16} className="shrink-0 text-[var(--color-green)]" />}
                          <span className={aula.concluida ? "text-[var(--color-gray-dark)]" : "font-semibold text-[var(--color-ink)]"}>{aula.nome}</span>
                        </button>
                      </li>
                    ))}
                    {modulo.quiz.temQuestoes && (
                      <li>
                        <button
                          onClick={() => modulo.quiz.liberado && navigate(`/cursos/${curso.id}/modulos/${modulo.id}/quiz`)}
                          disabled={!modulo.quiz.liberado}
                          className="flex w-full items-center gap-2.5 rounded-[var(--radius-btn)] px-2 py-2 text-left text-sm hover:bg-[var(--color-gray-subtle)] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {modulo.quiz.aprovado ? <CheckCircle2 size={16} className="shrink-0 text-[var(--color-green)]" /> : modulo.quiz.liberado ? <HelpCircle size={16} className="shrink-0 text-[var(--color-green)]" /> : <Lock size={14} className="shrink-0 text-[var(--color-gray-mid)]" />}
                          <span className="font-semibold text-[var(--color-ink)]">Quiz do módulo{modulo.quiz.ultimaNota != null ? ` — nota ${modulo.quiz.ultimaNota}` : ""}</span>
                        </button>
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </Card>
          );
        })}

        <Card className={`flex items-center gap-3 ${!provaFinalLiberada ? "opacity-60" : ""}`}>
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${provaFinalAprovada ? "bg-[var(--color-green-100)] text-[var(--color-green-dark)]" : "bg-[var(--color-gray-light)] text-[var(--color-gray-mid)]"}`}>
            {provaFinalAprovada ? <CheckCircle2 size={16} /> : <FileText size={16} />}
          </div>
          <div className="flex-1">
            <div className="font-bold text-[var(--color-ink)]">Prova final</div>
            <div className="text-xs text-[var(--color-gray-mid)]">{provaFinalAprovada ? "Aprovado" : provaFinalLiberada ? "Disponível" : "Conclua todos os módulos para liberar"}</div>
          </div>
          {provaFinalLiberada && !provaFinalAprovada && (
            <Link to={`/cursos/${curso.id}/prova-final`}><Button>Fazer prova</Button></Link>
          )}
          {provaFinalAprovada && <Link to="/certificados" className="text-sm font-semibold text-[var(--color-green)] hover:underline">Ver certificado</Link>}
        </Card>
      </div>
    </div>
  );
}

function InfoBloco({ icone, titulo, texto }: { icone: React.ReactNode; titulo: string; texto: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--color-green-dark)]">{icone} {titulo}</div>
      <p className="mt-1 whitespace-pre-wrap text-sm text-[var(--color-gray-dark)]">{texto}</p>
    </div>
  );
}

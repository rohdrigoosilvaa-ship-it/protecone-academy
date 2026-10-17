import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, FileText, HelpCircle, Lock, PlayCircle, Paperclip } from "lucide-react";
import { api, ApiError } from "../../lib/api";
import type { ProgressoCurso } from "../../lib/types";
import { VideoPlayer } from "../../components/aluno/VideoPlayer";
import { Button } from "../../components/ui/Button";
import { Spinner } from "../../components/ui/Spinner";
import { AcessoNegado } from "../../components/aluno/AcessoNegado";

export function AulaPage() {
  const { id: cursoId, aulaId } = useParams();
  const navigate = useNavigate();
  const [dados, setDados] = useState<ProgressoCurso | null>(null);
  const [negado, setNegado] = useState(false);

  const carregar = () => api<ProgressoCurso>("GET", `/api/cursos/${cursoId}/progresso`).then(setDados).catch((e) => {
    if (e instanceof ApiError && e.status === 403) setNegado(true);
    else throw e;
  });
  useEffect(() => { carregar(); }, [cursoId, aulaId]);
  // ao trocar de aula, volta para o topo da página (início da nova aula)
  useEffect(() => { window.scrollTo({ top: 0 }); }, [aulaId]);

  if (negado) return <AcessoNegado />;
  if (!dados) return <Spinner />;

  const todasAulas = dados.modulos.flatMap((m) => m.aulas.map((a) => ({ ...a, moduloNome: m.nome })));
  const aula = todasAulas.find((a) => a.id === Number(aulaId));
  if (!aula) return <p className="text-sm text-[var(--color-gray-mid)]">Aula não encontrada.</p>;

  const indiceAtual = todasAulas.findIndex((a) => a.id === aula.id);
  const proxima = todasAulas[indiceAtual + 1];
  const moduloAtual = dados.modulos.find((m) => m.id === aula.moduloId);
  const ultimaDoModulo = moduloAtual?.aulas[moduloAtual.aulas.length - 1]?.id === aula.id;
  // última aula do módulo: o próximo passo é o quiz, não a primeira aula do módulo seguinte
  const irParaQuiz = !!moduloAtual && ultimaDoModulo && moduloAtual.quiz.temQuestoes;

  const registrarProgresso = (percentual: number, segundos: number) => {
    api("PATCH", `/api/progresso/aula/${aula.id}`, { percentualAssistido: percentual, ultimaPosicaoSegundos: segundos }).catch(() => {});
  };

  const marcarConcluida = async () => {
    await api("POST", `/api/progresso/aula/${aula.id}/concluir`);
    carregar();
  };

  return (
    <div className="flex max-w-6xl flex-col gap-6 lg:flex-row">
      <div className="min-w-0 flex-1">
        <Link to={`/cursos/${cursoId}`} className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-[var(--color-gray-mid)] hover:text-[var(--color-green)]">
          <ArrowLeft size={15} /> Voltar ao curso
        </Link>

        <div className="text-xs font-semibold uppercase tracking-wide text-[var(--color-green)]">{aula.moduloNome}</div>
        <h1 className="mb-4 text-xl font-bold text-[var(--color-ink)]">{aula.nome}</h1>

        {aula.tipo === "VIDEO" && (
          <VideoPlayer key={aula.id} aula={aula} onProgresso={registrarProgresso} onConcluida={carregar} />
        )}

        {aula.tipo === "TEXTO" && (
          <div className="whitespace-pre-wrap rounded-[var(--radius-card-lg)] border border-[var(--color-gray-light)] bg-white p-6 text-sm leading-relaxed text-[var(--color-gray-dark)]">
            {aula.conteudoTexto || "Conteúdo não cadastrado."}
          </div>
        )}

        {aula.tipo === "IMAGEM" && aula.videoUrl && (
          <img src={aula.videoUrl} className="w-full rounded-[var(--radius-card-lg)] border border-[var(--color-gray-light)]" />
        )}

        {aula.tipo === "PDF" && aula.videoUrl && (
          <iframe src={aula.videoUrl} className="h-[70vh] w-full rounded-[var(--radius-card-lg)] border border-[var(--color-gray-light)]" />
        )}

        {aula.tipo === "LINK" && aula.videoUrl && (
          <a href={aula.videoUrl} target="_blank" rel="noreferrer" className="block rounded-[var(--radius-card-lg)] border border-[var(--color-gray-light)] bg-white p-6 text-sm font-semibold text-[var(--color-green)] hover:underline">
            Abrir material externo →
          </a>
        )}

        {aula.descricao && <p className="mt-4 text-sm text-[var(--color-gray-mid)]">{aula.descricao}</p>}

        {aula.materiais.length > 0 && (
          <div className="mt-5">
            <h3 className="mb-2 text-sm font-bold text-[var(--color-ink)]">Materiais complementares</h3>
            <ul className="space-y-1.5">
              {aula.materiais.map((m) => (
                <li key={m.id}>
                  <a href={m.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-semibold text-[var(--color-green)] hover:underline">
                    <Paperclip size={14} /> {m.nome}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between border-t border-[var(--color-gray-light)] pt-5">
          {aula.tipo !== "VIDEO" && !aula.concluida ? (
            <Button onClick={marcarConcluida}><CheckCircle2 size={16} /> Marcar aula como concluída</Button>
          ) : aula.concluida ? (
            <span className="flex items-center gap-1.5 text-sm font-semibold text-[var(--color-green)]"><CheckCircle2 size={16} /> Aula concluída</span>
          ) : <span />}

          {irParaQuiz && moduloAtual ? (
            <Button
              variant="secondary"
              disabled={!moduloAtual.quiz.liberado}
              onClick={() => navigate(`/cursos/${cursoId}/modulos/${moduloAtual.id}/quiz`)}
            >
              Fazer quiz do módulo →
            </Button>
          ) : proxima ? (
            <Button
              variant="secondary"
              disabled={proxima.bloqueada}
              onClick={() => navigate(`/cursos/${cursoId}/aulas/${proxima.id}`)}
            >
              Próxima aula →
            </Button>
          ) : (
            <Button variant="secondary" disabled={!dados.provaFinalLiberada} onClick={() => navigate(`/cursos/${cursoId}/prova-final`)}>
              Ir para a prova final →
            </Button>
          )}
        </div>
      </div>

      <aside className="w-full shrink-0 lg:w-72">
        <div className="rounded-[var(--radius-card-lg)] border border-[var(--color-gray-light)] bg-white p-4">
          <h3 className="mb-2 text-sm font-bold text-[var(--color-ink)]">Conteúdo do curso</h3>
          {dados.modulos.map((modulo) => (
            <div key={modulo.id} className="mb-3">
              <div className="mb-1 text-xs font-bold uppercase tracking-wide text-[var(--color-gray-mid)]">{modulo.nome}</div>
              <ul>
                {modulo.aulas.map((a) => (
                  <li key={a.id}>
                    <button
                      onClick={() => !a.bloqueada && navigate(`/cursos/${cursoId}/aulas/${a.id}`)}
                      disabled={a.bloqueada}
                      className={`flex w-full items-center gap-2 rounded-[var(--radius-btn)] px-2 py-1.5 text-left text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${a.id === aula.id ? "bg-[var(--color-green-light)] text-[var(--color-green-dark)]" : "hover:bg-[var(--color-gray-subtle)]"}`}
                    >
                      {a.concluida ? <CheckCircle2 size={13} className="shrink-0 text-[var(--color-green)]" /> : a.bloqueada ? <Lock size={12} className="shrink-0" /> : <PlayCircle size={13} className="shrink-0" />}
                      <span className="truncate">{a.nome}</span>
                    </button>
                  </li>
                ))}
                {modulo.quiz.temQuestoes && (
                  <li>
                    <button
                      onClick={() => modulo.quiz.liberado && navigate(`/cursos/${cursoId}/modulos/${modulo.id}/quiz`)}
                      disabled={!modulo.quiz.liberado}
                      className="flex w-full items-center gap-2 rounded-[var(--radius-btn)] px-2 py-1.5 text-left text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50 hover:bg-[var(--color-gray-subtle)]"
                    >
                      {modulo.quiz.aprovado ? <CheckCircle2 size={13} className="shrink-0 text-[var(--color-green)]" /> : modulo.quiz.liberado ? <HelpCircle size={13} className="shrink-0" /> : <Lock size={12} className="shrink-0" />}
                      Quiz do módulo
                    </button>
                  </li>
                )}
              </ul>
            </div>
          ))}
          <Link to={`/cursos/${cursoId}/prova-final`} className={`flex items-center gap-2 rounded-[var(--radius-btn)] px-2 py-1.5 text-xs font-semibold ${dados.provaFinalLiberada ? "text-[var(--color-green-dark)] hover:bg-[var(--color-gray-subtle)]" : "pointer-events-none text-[var(--color-gray-mid)] opacity-50"}`}>
            <FileText size={13} /> Prova final
          </Link>
        </div>
      </aside>
    </div>
  );
}

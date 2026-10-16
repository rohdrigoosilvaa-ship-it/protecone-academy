import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Award, Clock } from "lucide-react";
import { api, ApiError } from "../../lib/api";
import type { ResultadoProva, TentativaProva } from "../../lib/types";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Spinner } from "../../components/ui/Spinner";
import { ResultadoBanner } from "./QuizPage";

export function ProvaFinalPage() {
  const { id: cursoId } = useParams();
  const navigate = useNavigate();
  const [tentativa, setTentativa] = useState<TentativaProva | null>(null);
  const [erro, setErro] = useState("");
  const [respostas, setRespostas] = useState<Record<number, number>>({});
  const [resultado, setResultado] = useState<ResultadoProva | null>(null);
  const [enviando, setEnviando] = useState(false);
  const inicioRef = useRef<number>(0);

  const iniciar = async () => {
    setErro("");
    try {
      const r = await api<TentativaProva>("POST", `/api/prova-final/curso/${cursoId}/iniciar`);
      setTentativa(r);
      inicioRef.current = Date.now();
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : "Não foi possível iniciar a prova");
    }
  };

  useEffect(() => { iniciar(); }, [cursoId]);

  const segundosRestantes = useTimer(tentativa?.tempoLimiteMinutos ?? null, inicioRef);

  const enviar = async () => {
    if (!tentativa) return;
    setEnviando(true);
    try {
      const r = await api<ResultadoProva>("POST", `/api/prova-final/tentativa/${tentativa.id}/submeter`, { respostas });
      setResultado(r);
    } finally { setEnviando(false); }
  };

  useEffect(() => {
    if (tentativa?.tempoLimiteMinutos && segundosRestantes === 0 && !resultado) enviar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segundosRestantes]);

  if (erro) {
    return (
      <div className="max-w-2xl">
        <Card className="text-sm font-semibold text-[var(--color-status-critical-fg)]">{erro}</Card>
        <Link to={`/cursos/${cursoId}`} className="mt-4 inline-block"><Button variant="secondary">Voltar ao curso</Button></Link>
      </div>
    );
  }

  if (resultado) {
    return (
      <div className="max-w-2xl">
        <ResultadoBanner aprovado={resultado.aprovado} nota={resultado.nota} notaMinima={resultado.notaMinima} tipo="prova" />
        {resultado.aprovado && resultado.certificadoId && (
          <Card className="mt-4 flex items-center gap-3">
            <Award className="text-[var(--color-green)]" />
            <div className="flex-1 text-sm font-semibold text-[var(--color-ink)]">Seu certificado já está disponível.</div>
            <Link to="/certificados"><Button>Ver certificado</Button></Link>
          </Card>
        )}
        <div className="mt-6 space-y-4">
          {resultado.correcao.map((q, i) => (
            <Card key={q.questaoId}>
              <p className="font-semibold text-[var(--color-ink)]">{i + 1}. {q.enunciado}</p>
              <ul className="mt-2 space-y-1">
                {q.alternativas.map((alt, idx) => (
                  <li key={idx} className={`rounded-[var(--radius-btn)] px-3 py-1.5 text-sm ${idx === q.respostaCorretaIndex ? "bg-[var(--color-green-light)] font-semibold text-[var(--color-green-dark)]" : idx === q.suaResposta ? "bg-[var(--color-status-critical-soft)] text-[var(--color-status-critical-fg)]" : ""}`}>
                    {alt}
                  </li>
                ))}
              </ul>
              {q.explicacao && <p className="mt-2 text-xs text-[var(--color-gray-mid)]"><b>Por quê:</b> {q.explicacao}</p>}
            </Card>
          ))}
        </div>
        <div className="mt-6 flex gap-3">
          <Link to={`/cursos/${cursoId}`}><Button>Voltar ao curso</Button></Link>
          {!resultado.aprovado && <Button variant="secondary" onClick={() => navigate(0)}>Tentar novamente</Button>}
        </div>
      </div>
    );
  }

  if (!tentativa) return <Spinner />;

  return (
    <div className="max-w-2xl">
      <Link to={`/cursos/${cursoId}`} className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-[var(--color-gray-mid)] hover:text-[var(--color-green)]">
        <ArrowLeft size={15} /> Voltar ao curso
      </Link>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-ink)]">Prova final</h1>
          <p className="mt-1 text-sm text-[var(--color-gray-mid)]">{tentativa.questoes.length} questões · nota mínima {tentativa.notaMinima}%</p>
        </div>
        {segundosRestantes != null && (
          <div className="flex items-center gap-1.5 rounded-full bg-[var(--color-status-attention-soft)] px-3 py-1.5 text-sm font-bold text-[var(--color-status-attention-fg)]">
            <Clock size={14} /> {formatarTempo(segundosRestantes)}
          </div>
        )}
      </div>

      <div className="mt-6 space-y-4">
        {tentativa.questoes.map((q, i) => (
          <Card key={q.questaoId}>
            <p className="font-semibold text-[var(--color-ink)]">{i + 1}. {q.enunciado}</p>
            <div className="mt-3 space-y-2">
              {q.alternativas.map((alt, idx) => (
                <label key={idx} className="flex cursor-pointer items-center gap-2.5 rounded-[var(--radius-btn)] border border-[var(--color-gray-light)] px-3 py-2 text-sm has-[:checked]:border-[var(--color-green)] has-[:checked]:bg-[var(--color-green-light)]">
                  <input type="radio" name={`q${q.questaoId}`} checked={respostas[q.questaoId] === idx} onChange={() => setRespostas((r) => ({ ...r, [q.questaoId]: idx }))} />
                  {alt}
                </label>
              ))}
            </div>
          </Card>
        ))}
      </div>
      <Button className="mt-6" onClick={enviar} disabled={enviando}>
        {enviando ? "Enviando…" : "Finalizar prova"}
      </Button>
    </div>
  );
}

function useTimer(minutos: number | null, inicioRef: React.MutableRefObject<number>) {
  const [restante, setRestante] = useState<number | null>(minutos ? minutos * 60 : null);
  useEffect(() => {
    if (!minutos) { setRestante(null); return; }
    const total = minutos * 60;
    const tick = () => {
      const passado = Math.floor((Date.now() - inicioRef.current) / 1000);
      setRestante(Math.max(0, total - passado));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [minutos]);
  return restante;
}

function formatarTempo(segundos: number) {
  const m = Math.floor(segundos / 60);
  const s = segundos % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { api, ApiError } from "../../lib/api";
import type { Questao, ResultadoQuiz } from "../../lib/types";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Spinner } from "../../components/ui/Spinner";
import { AcessoNegado } from "../../components/aluno/AcessoNegado";

interface QuizDados {
  moduloId: number;
  nome: string;
  notaMinima: number;
  maxTentativas: number;
  tentativasUsadas: number;
  tentativasEsgotadas: boolean;
  questoes: Questao[];
}

export function QuizPage() {
  const { id: cursoId, moduloId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<QuizDados | null>(null);
  const [respostas, setRespostas] = useState<Record<number, number>>({});
  const [resultado, setResultado] = useState<ResultadoQuiz | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [negado, setNegado] = useState(false);

  const carregar = () => {
    setResultado(null); setRespostas({});
    api<QuizDados>("GET", `/api/quiz/modulo/${moduloId}`).then(setQuiz).catch((e) => {
      if (e instanceof ApiError && e.status === 403) setNegado(true);
      else throw e;
    });
  };
  useEffect(() => { carregar(); }, [moduloId]);

  if (negado) return <AcessoNegado />;
  if (!quiz) return <Spinner />;

  const enviar = async () => {
    setEnviando(true);
    try {
      const r = await api<ResultadoQuiz>("POST", `/api/quiz/modulo/${moduloId}/submeter`, { respostas });
      setResultado(r);
    } finally { setEnviando(false); }
  };

  if (resultado) {
    return (
      <div className="max-w-2xl">
        <ResultadoBanner aprovado={resultado.aprovado} nota={resultado.nota} notaMinima={resultado.notaMinima} tipo="quiz" />
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
          {!resultado.aprovado && !quiz.tentativasEsgotadas && <Button variant="secondary" onClick={carregar}>Tentar novamente</Button>}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <Link to={`/cursos/${cursoId}`} className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-[var(--color-gray-mid)] hover:text-[var(--color-green)]">
        <ArrowLeft size={15} /> Voltar ao curso
      </Link>
      <h1 className="text-xl font-bold text-[var(--color-ink)]">Quiz — {quiz.nome}</h1>
      <p className="mt-1 text-sm text-[var(--color-gray-mid)]">Teste seus conhecimentos antes de continuar. Nota mínima: {quiz.notaMinima}%.</p>

      {quiz.tentativasEsgotadas ? (
        <Card className="mt-6 text-sm font-semibold text-[var(--color-status-critical-fg)]">Número máximo de tentativas atingido para este quiz.</Card>
      ) : (
        <>
          <div className="mt-6 space-y-4">
            {quiz.questoes.map((q, i) => (
              <Card key={q.id}>
                <p className="font-semibold text-[var(--color-ink)]">{i + 1}. {q.enunciado}</p>
                <div className="mt-3 space-y-2">
                  {q.alternativas.map((alt, idx) => (
                    <label key={idx} className="flex cursor-pointer items-center gap-2.5 rounded-[var(--radius-btn)] border border-[var(--color-gray-light)] px-3 py-2 text-sm has-[:checked]:border-[var(--color-green)] has-[:checked]:bg-[var(--color-green-light)]">
                      <input type="radio" name={`q${q.id}`} checked={respostas[q.id] === idx} onChange={() => setRespostas((r) => ({ ...r, [q.id]: idx }))} />
                      {alt}
                    </label>
                  ))}
                </div>
              </Card>
            ))}
          </div>
          <Button className="mt-6" onClick={enviar} disabled={enviando || Object.keys(respostas).length < quiz.questoes.length}>
            {enviando ? "Enviando…" : "Enviar respostas"}
          </Button>
        </>
      )}
    </div>
  );
}

export function ResultadoBanner({ aprovado, nota, notaMinima, tipo }: { aprovado: boolean; nota: number; notaMinima: number; tipo: "quiz" | "prova" }) {
  return (
    <Card className={aprovado ? "bg-[var(--color-green-light)]" : "bg-[var(--color-status-critical-soft)]"}>
      <div className={`flex items-center gap-2 text-lg font-bold ${aprovado ? "text-[var(--color-green-dark)]" : "text-[var(--color-status-critical-fg)]"}`}>
        {aprovado ? <CheckCircle2 size={22} /> : <XCircle size={22} />}
        {aprovado ? "Aprovado" : "Não aprovado"}
      </div>
      <p className={`mt-1 text-sm ${aprovado ? "text-[var(--color-green-dark)]" : "text-[var(--color-status-critical-fg)]"}`}>
        {aprovado
          ? `Parabéns! Você foi aprovado ${tipo === "prova" ? "e concluiu o treinamento" : "neste módulo"} com nota ${nota}%.`
          : `Você obteve ${nota}% — a nota mínima é ${notaMinima}%. Revise o conteúdo antes de tentar novamente.`}
      </p>
    </Card>
  );
}

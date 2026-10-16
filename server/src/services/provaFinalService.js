import prisma from "../db/prisma.js";
import { ErroApi } from "../utils/erros.js";
import { calcularProgressoCurso, atualizarProgressoMatricula } from "./progressoService.js";
import { emitirSeNecessario } from "./certificadosService.js";
import { obterMatriculaValida } from "./matriculasService.js";

function embaralhar(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// monta o snapshot de uma questão com as alternativas embaralhadas, guardando
// o novo índice da correta — assim a correção da tentativa nunca muda mesmo
// que o banco de questões seja editado depois.
function montarSnapshot(questao) {
  const ordem = embaralhar(questao.alternativas.map((_, i) => i));
  const alternativas = ordem.map((i) => questao.alternativas[i]);
  const indiceCorreto = ordem.indexOf(questao.respostaCorretaIndex);
  return {
    questaoId: questao.id,
    enunciado: questao.enunciado,
    alternativas,
    indiceCorretoEmbaralhado: indiceCorreto,
    pontuacao: questao.pontuacao,
    explicacao: questao.explicacao,
  };
}

function sanitizarSnapshot(snapshot) {
  return snapshot.map(({ indiceCorretoEmbaralhado, explicacao, ...resto }) => resto);
}

export async function obterTentativaAberta(cursoId, usuarioId) {
  const aberta = await prisma.provaTentativa.findFirst({
    where: { usuarioId, cursoId: Number(cursoId), finalizadoEm: null },
    orderBy: { iniciadoEm: "desc" },
  });
  if (!aberta) return null;
  return { id: aberta.id, tentativaNum: aberta.tentativaNum, iniciadoEm: aberta.iniciadoEm, questoes: sanitizarSnapshot(aberta.questoesSnapshotJson) };
}

export async function iniciar(cursoId, usuarioId) {
  const curso = await prisma.curso.findUnique({ where: { id: Number(cursoId) } });
  if (!curso) throw new ErroApi(404, "Curso não encontrado");
  await obterMatriculaValida(usuarioId, curso.id);

  const progresso = await calcularProgressoCurso(curso.id, usuarioId);
  if (!progresso?.provaFinalLiberada) throw new ErroApi(403, "Conclua todos os módulos e seus quizzes antes da prova final");

  const emAberto = await obterTentativaAberta(curso.id, usuarioId);
  if (emAberto) return { ...emAberto, tempoLimiteMinutos: curso.tempoProvaMinutos, notaMinima: curso.notaMinimaProva };

  const finalizadas = await prisma.provaTentativa.count({ where: { usuarioId, cursoId: curso.id, finalizadoEm: { not: null } } });
  if (finalizadas >= curso.maxTentativas) throw new ErroApi(403, "Número máximo de tentativas da prova final atingido");

  const banco = await prisma.questao.findMany({ where: { cursoId: curso.id } });
  if (!banco.length) throw new ErroApi(400, "O banco de questões deste curso ainda está vazio");

  const selecionadas = embaralhar(banco).slice(0, Math.min(curso.numQuestoesProva, banco.length));
  const snapshot = selecionadas.map(montarSnapshot);

  const tentativa = await prisma.provaTentativa.create({
    data: { usuarioId, cursoId: curso.id, questoesSnapshotJson: snapshot, tentativaNum: finalizadas + 1 },
  });

  return {
    id: tentativa.id,
    tentativaNum: tentativa.tentativaNum,
    iniciadoEm: tentativa.iniciadoEm,
    tempoLimiteMinutos: curso.tempoProvaMinutos,
    notaMinima: curso.notaMinimaProva,
    questoes: sanitizarSnapshot(snapshot),
  };
}

export async function submeter(tentativaId, usuarioId, respostas) {
  const tentativa = await prisma.provaTentativa.findUnique({ where: { id: Number(tentativaId) }, include: { curso: true } });
  if (!tentativa || tentativa.usuarioId !== usuarioId) throw new ErroApi(404, "Tentativa não encontrada");
  if (tentativa.finalizadoEm) throw new ErroApi(400, "Esta tentativa já foi finalizada");

  let pontosObtidos = 0;
  let pontosTotais = 0;
  const correcao = tentativa.questoesSnapshotJson.map((q) => {
    pontosTotais += q.pontuacao;
    const suaResposta = respostas?.[q.questaoId];
    const correta = suaResposta === q.indiceCorretoEmbaralhado;
    if (correta) pontosObtidos += q.pontuacao;
    return { questaoId: q.questaoId, enunciado: q.enunciado, alternativas: q.alternativas, suaResposta, respostaCorretaIndex: q.indiceCorretoEmbaralhado, correta, explicacao: q.explicacao };
  });

  const nota = pontosTotais > 0 ? Math.round((pontosObtidos / pontosTotais) * 100) : 0;
  const aprovado = nota >= tentativa.curso.notaMinimaProva;

  await prisma.provaTentativa.update({
    where: { id: tentativa.id },
    data: { respostasJson: respostas || {}, nota, aprovado, finalizadoEm: new Date() },
  });

  await atualizarProgressoMatricula(usuarioId, tentativa.cursoId);

  let certificado = null;
  if (aprovado) certificado = await emitirSeNecessario(usuarioId, tentativa.cursoId);

  return {
    nota,
    aprovado,
    notaMinima: tentativa.curso.notaMinimaProva,
    tentativaNum: tentativa.tentativaNum,
    dataFinalizacao: new Date(),
    correcao,
    certificadoId: certificado?.id || null,
  };
}

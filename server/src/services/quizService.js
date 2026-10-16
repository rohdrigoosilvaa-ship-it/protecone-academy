import prisma from "../db/prisma.js";
import { ErroApi } from "../utils/erros.js";
import { atualizarProgressoMatricula } from "./progressoService.js";
import { obterMatriculaValida } from "./matriculasService.js";

function sanitizar(q) {
  return { id: q.id, enunciado: q.enunciado, alternativas: q.alternativas, pontuacao: q.pontuacao };
}

export async function obter(moduloId, usuarioId) {
  const modulo = await prisma.modulo.findUnique({ where: { id: Number(moduloId) }, include: { curso: true, questoes: true } });
  if (!modulo) throw new ErroApi(404, "Módulo não encontrado");
  await obterMatriculaValida(usuarioId, modulo.cursoId);
  const tentativas = await prisma.quizTentativa.count({ where: { usuarioId, moduloId: modulo.id } });
  return {
    moduloId: modulo.id,
    nome: modulo.nome,
    notaMinima: modulo.curso.notaMinimaQuiz,
    maxTentativas: modulo.curso.maxTentativas,
    tentativasUsadas: tentativas,
    tentativasEsgotadas: tentativas >= modulo.curso.maxTentativas,
    questoes: modulo.questoes.map(sanitizar),
  };
}

export async function submeter(moduloId, usuarioId, respostas) {
  const modulo = await prisma.modulo.findUnique({ where: { id: Number(moduloId) }, include: { curso: true, questoes: true } });
  if (!modulo) throw new ErroApi(404, "Módulo não encontrado");
  await obterMatriculaValida(usuarioId, modulo.cursoId);
  if (!modulo.questoes.length) throw new ErroApi(400, "Este módulo não possui quiz cadastrado");

  const tentativasUsadas = await prisma.quizTentativa.count({ where: { usuarioId, moduloId: modulo.id } });
  if (tentativasUsadas >= modulo.curso.maxTentativas) throw new ErroApi(403, "Número máximo de tentativas atingido para este quiz");

  let pontosObtidos = 0;
  let pontosTotais = 0;
  const correcao = modulo.questoes.map((q) => {
    pontosTotais += q.pontuacao;
    const suaResposta = respostas?.[q.id];
    const correta = suaResposta === q.respostaCorretaIndex;
    if (correta) pontosObtidos += q.pontuacao;
    return { questaoId: q.id, enunciado: q.enunciado, alternativas: q.alternativas, suaResposta, respostaCorretaIndex: q.respostaCorretaIndex, correta, explicacao: q.explicacao };
  });

  const nota = pontosTotais > 0 ? Math.round((pontosObtidos / pontosTotais) * 100) : 0;
  const aprovado = nota >= modulo.curso.notaMinimaQuiz;

  await prisma.quizTentativa.create({
    data: { usuarioId, moduloId: modulo.id, respostasJson: respostas || {}, nota, aprovado, tentativaNum: tentativasUsadas + 1 },
  });

  await atualizarProgressoMatricula(usuarioId, modulo.cursoId);

  return { nota, aprovado, notaMinima: modulo.curso.notaMinimaQuiz, correcao };
}

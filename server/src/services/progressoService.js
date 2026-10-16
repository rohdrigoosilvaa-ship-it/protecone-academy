import prisma from "../db/prisma.js";
import { obterMatriculaValida } from "./matriculasService.js";

// Motor único de progresso/bloqueio — usado pela página do curso, pelo player
// (para saber se pode avançar) e pelo dashboard ("continue de onde parou").
// Regra (seções 6-13 do escopo): aulas de um módulo liberam em sequência: a
// aula N+1 só libera quando a aula N está concluída; o quiz do módulo libera
// quando todas as aulas do módulo estão concluídas; o próximo módulo libera
// quando o quiz do módulo atual está aprovado (quiz sem nenhuma questão
// cadastrada é considerado aprovado automaticamente, para não travar o aluno
// enquanto o admin ainda não montou o banco); a prova final libera quando
// todos os módulos estão com quiz aprovado.
export async function calcularProgressoCurso(cursoId, usuarioId) {
  const curso = await prisma.curso.findUnique({
    where: { id: Number(cursoId) },
    include: { modulos: { orderBy: { ordem: "asc" }, include: { aulas: { orderBy: { ordem: "asc" }, include: { materiais: true } }, questoes: true } } },
  });
  if (!curso) return null;

  const aulaIds = curso.modulos.flatMap((m) => m.aulas.map((a) => a.id));
  const progressos = aulaIds.length
    ? await prisma.progressoAula.findMany({ where: { usuarioId, aulaId: { in: aulaIds } } })
    : [];
  const progressoPorAula = Object.fromEntries(progressos.map((p) => [p.aulaId, p]));

  const moduloIds = curso.modulos.map((m) => m.id);
  const quizTentativas = moduloIds.length
    ? await prisma.quizTentativa.findMany({ where: { usuarioId, moduloId: { in: moduloIds } }, orderBy: { criadoEm: "desc" } })
    : [];
  const melhorQuizPorModulo = {};
  for (const t of quizTentativas) {
    if (!melhorQuizPorModulo[t.moduloId] || t.aprovado) {
      if (!melhorQuizPorModulo[t.moduloId]) melhorQuizPorModulo[t.moduloId] = t;
      else if (t.aprovado) melhorQuizPorModulo[t.moduloId] = t;
    }
  }

  let moduloAnteriorLiberado = true;
  let aulaAtual = null;
  let moduloAtualId = null;
  let totalAulas = 0;
  let aulasConcluidas = 0;

  const modulos = curso.modulos.map((modulo) => {
    let aulaAnteriorConcluida = true;
    const aulas = modulo.aulas.map((aula) => {
      totalAulas += 1;
      const p = progressoPorAula[aula.id];
      const concluida = !!p?.concluida;
      if (concluida) aulasConcluidas += 1;
      const bloqueada = !moduloAnteriorLiberado || !aulaAnteriorConcluida;
      if (!bloqueada && !concluida && !aulaAtual) { aulaAtual = aula; moduloAtualId = modulo.id; }
      aulaAnteriorConcluida = concluida;
      return {
        ...aula,
        percentualAssistido: p?.percentualAssistido || 0,
        ultimaPosicaoSegundos: p?.ultimaPosicaoSegundos || 0,
        concluida,
        bloqueada,
      };
    });

    const todasAulasConcluidas = aulas.length > 0 && aulas.every((a) => a.concluida);
    const temQuestoes = modulo.questoes.length > 0;
    const tentativa = melhorQuizPorModulo[modulo.id];
    const quizAprovado = temQuestoes ? !!tentativa?.aprovado : todasAulasConcluidas;
    const quizLiberado = moduloAnteriorLiberado && todasAulasConcluidas;

    const liberado = moduloAnteriorLiberado;
    moduloAnteriorLiberado = quizAprovado;

    return {
      id: modulo.id,
      nome: modulo.nome,
      descricao: modulo.descricao,
      ordem: modulo.ordem,
      liberado,
      aulas,
      quiz: {
        temQuestoes,
        totalQuestoes: modulo.questoes.length,
        liberado: quizLiberado,
        aprovado: quizAprovado,
        tentativasUsadas: quizTentativas.filter((t) => t.moduloId === modulo.id).length,
        ultimaNota: tentativa?.nota ?? null,
      },
    };
  });

  const provaFinalLiberada = curso.modulos.length > 0 && moduloAnteriorLiberado;
  const provaTentativas = await prisma.provaTentativa.findMany({
    where: { usuarioId, cursoId: curso.id, finalizadoEm: { not: null } },
    orderBy: { iniciadoEm: "desc" },
  });
  const provaFinalAprovada = provaTentativas.some((t) => t.aprovado);

  const progressoPct = totalAulas > 0 ? Math.round((aulasConcluidas / totalAulas) * 100) : 0;

  return {
    curso,
    modulos,
    progressoPct,
    aulaAtual,
    moduloAtualId,
    provaFinalLiberada,
    provaFinalAprovada,
    provaTentativasUsadas: provaTentativas.length,
  };
}

// grava/atualiza o progresso de uma aula (chamado a cada poucos segundos pelo player)
export async function registrarProgressoAula(usuarioId, aulaId, { percentualAssistido, ultimaPosicaoSegundos }) {
  const aula = await prisma.aula.findUnique({ where: { id: Number(aulaId) }, include: { modulo: { include: { curso: true } } } });
  if (!aula) return null;
  await obterMatriculaValida(usuarioId, aula.modulo.cursoId);
  const limite = aula.modulo.curso.percentualMinimoAula;
  const pctAtual = Math.max(0, Math.min(100, Math.round(percentualAssistido || 0)));

  const existente = await prisma.progressoAula.findUnique({ where: { usuarioId_aulaId: { usuarioId, aulaId: aula.id } } });
  const maiorPct = Math.max(existente?.percentualAssistido || 0, pctAtual);
  const jaConcluida = existente?.concluida || maiorPct >= limite;

  const registro = await prisma.progressoAula.upsert({
    where: { usuarioId_aulaId: { usuarioId, aulaId: aula.id } },
    update: {
      percentualAssistido: maiorPct,
      ultimaPosicaoSegundos: ultimaPosicaoSegundos ?? existente?.ultimaPosicaoSegundos ?? 0,
      concluida: jaConcluida,
      concluidaEm: jaConcluida && !existente?.concluida ? new Date() : existente?.concluidaEm,
    },
    create: {
      usuarioId,
      aulaId: aula.id,
      percentualAssistido: maiorPct,
      ultimaPosicaoSegundos: ultimaPosicaoSegundos || 0,
      concluida: jaConcluida,
      concluidaEm: jaConcluida ? new Date() : null,
    },
  });

  await atualizarProgressoMatricula(usuarioId, aula.modulo.cursoId);
  return registro;
}

// marca aulas que não são vídeo (texto/pdf/imagem/link) como concluídas com um clique
export async function marcarAulaConcluida(usuarioId, aulaId) {
  return registrarProgressoAula(usuarioId, aulaId, { percentualAssistido: 100 });
}

export async function atualizarProgressoMatricula(usuarioId, cursoId) {
  const resultado = await calcularProgressoCurso(cursoId, usuarioId);
  if (!resultado) return;
  const status = resultado.provaFinalAprovada ? "CONCLUIDA" : "ATIVA";
  // nunca reabre uma matrícula cancelada/expirada por conta de progresso antigo
  await prisma.matricula.updateMany({
    where: { usuarioId, cursoId: Number(cursoId), status: { in: ["ATIVA", "CONCLUIDA"] } },
    data: { progressoPct: resultado.progressoPct, status, concluidoEm: resultado.provaFinalAprovada ? new Date() : null },
  });
}

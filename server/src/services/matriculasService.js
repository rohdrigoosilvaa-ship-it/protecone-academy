import prisma from "../db/prisma.js";
import { ErroApi } from "../utils/erros.js";
import { criarNotificacao } from "./notificacoesService.js";

// Única porta de entrada para verificar se um aluno pode acessar o
// conteúdo de um curso — chamada por progresso/quiz/prova-final, não só
// pela tela do curso, para que a autorização valha mesmo por URL direta.
export async function obterMatriculaValida(usuarioId, cursoId) {
  const matricula = await prisma.matricula.findUnique({
    where: { usuarioId_cursoId: { usuarioId, cursoId: Number(cursoId) } },
  });
  if (!matricula || matricula.status === "CANCELADA") {
    throw new ErroApi(403, "Acesso não autorizado a este curso.");
  }
  if (matricula.expiraEm && matricula.expiraEm < new Date()) {
    if (matricula.status !== "EXPIRADA") {
      await prisma.matricula.update({ where: { id: matricula.id }, data: { status: "EXPIRADA" } });
    }
    throw new ErroApi(403, "Acesso não autorizado a este curso.");
  }
  if (!matricula.iniciadoEm) {
    await prisma.matricula.update({ where: { id: matricula.id }, data: { iniciadoEm: new Date() } });
  }
  return matricula;
}

// ADMIN matricula um aluno num curso publicado. Reativa uma matrícula
// cancelada em vez de duplicar (o histórico nunca é apagado).
export async function matricular(usuarioId, cursoId, { expiraEm } = {}) {
  usuarioId = Number(usuarioId);
  cursoId = Number(cursoId);
  const [curso, aluno] = await Promise.all([
    prisma.curso.findUnique({ where: { id: cursoId } }),
    prisma.usuario.findUnique({ where: { id: usuarioId } }),
  ]);
  if (!curso) throw new ErroApi(404, "Curso não encontrado");
  if (curso.status !== "PUBLICADO") throw new ErroApi(400, "Só é possível matricular alunos em cursos publicados");
  if (!aluno || !aluno.ativo) throw new ErroApi(404, "Aluno não encontrado ou inativo");

  const existente = await prisma.matricula.findUnique({ where: { usuarioId_cursoId: { usuarioId, cursoId } } });

  if (existente) {
    if (existente.status !== "CANCELADA") throw new ErroApi(409, "Este aluno já está matriculado neste curso.");
    const reativada = await prisma.matricula.update({
      where: { id: existente.id },
      data: { status: "ATIVA", expiraEm: expiraEm ? new Date(expiraEm) : null },
    });
    await criarNotificacao(usuarioId, "MATRICULA", `Você foi matriculado no treinamento "${curso.nome}".`, `/cursos/${curso.id}`);
    return reativada;
  }

  const matricula = await prisma.matricula.create({
    data: { usuarioId, cursoId, expiraEm: expiraEm ? new Date(expiraEm) : null },
  });
  await criarNotificacao(usuarioId, "MATRICULA", `Você foi matriculado no treinamento "${curso.nome}".`, `/cursos/${curso.id}`);
  return matricula;
}

// matrícula em massa (seção 13) — mesma regra do individual, aluno por
// aluno, devolvendo um resumo do que deu certo/já existia/falhou
export async function matricularVarios(usuarioIds, cursoId, opts) {
  const resultado = { matriculados: [], jaMatriculados: [], erros: [] };
  for (const usuarioId of usuarioIds) {
    try {
      await matricular(usuarioId, cursoId, opts);
      resultado.matriculados.push(Number(usuarioId));
    } catch (e) {
      if (e.status === 409) resultado.jaMatriculados.push(Number(usuarioId));
      else resultado.erros.push({ usuarioId: Number(usuarioId), erro: e.message });
    }
  }
  return resultado;
}

export async function cancelar(id) {
  const matricula = await prisma.matricula.findUnique({ where: { id: Number(id) } });
  if (!matricula) throw new ErroApi(404, "Matrícula não encontrada");
  return prisma.matricula.update({ where: { id: matricula.id }, data: { status: "CANCELADA" } });
}

export async function listarMinhas(usuarioId) {
  const matriculas = await prisma.matricula.findMany({
    where: { usuarioId, status: { in: ["ATIVA", "CONCLUIDA"] } },
    include: { curso: { include: { categoria: true } } },
    orderBy: { matriculadoEm: "desc" },
  });
  return matriculas.map(comStatusEfetivo);
}

export async function listarPorCurso(cursoId) {
  const matriculas = await prisma.matricula.findMany({
    where: { cursoId: Number(cursoId) },
    include: { usuario: true },
    orderBy: { matriculadoEm: "desc" },
  });
  return matriculas.map(comStatusEfetivo);
}

export async function listarPorAluno(usuarioId) {
  const matriculas = await prisma.matricula.findMany({
    where: { usuarioId: Number(usuarioId) },
    include: { curso: true },
    orderBy: { matriculadoEm: "desc" },
  });
  return matriculas.map(comStatusEfetivo);
}

// mostra EXPIRADA na listagem mesmo antes do aluno tentar acessar de novo —
// a gravação efetiva no banco acontece só em obterMatriculaValida (no
// momento de acesso), pra não escrever a cada listagem
function comStatusEfetivo(matricula) {
  if (matricula.status === "ATIVA" && matricula.expiraEm && matricula.expiraEm < new Date()) {
    return { ...matricula, status: "EXPIRADA" };
  }
  return matricula;
}

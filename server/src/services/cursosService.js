import prisma from "../db/prisma.js";
import { ErroApi } from "../utils/erros.js";
import { obter as obterConfiguracoes } from "./configuracoesService.js";

const cursoInclude = {
  categoria: true,
  _count: { select: { modulos: true, matriculas: true } },
};

// catálogo — ADMIN vê tudo, ALUNO só cursos publicados
export async function listar(user) {
  const where = user.perfil === "ADMIN" ? {} : { status: "PUBLICADO" };
  const cursos = await prisma.curso.findMany({ where, include: cursoInclude, orderBy: [{ ordem: "asc" }, { criadoEm: "desc" }] });

  if (user.perfil === "ADMIN") return cursos;

  const matriculas = await prisma.matricula.findMany({ where: { usuarioId: user.id } });
  const matriculaPorCurso = Object.fromEntries(matriculas.map((m) => [m.cursoId, m]));
  return cursos.map((c) => ({ ...c, matricula: matriculaPorCurso[c.id] || null }));
}

export async function obter(id, user) {
  const curso = await prisma.curso.findUnique({
    where: { id: Number(id) },
    include: {
      categoria: true,
      modulos: { orderBy: { ordem: "asc" }, include: { aulas: { orderBy: { ordem: "asc" } }, questoes: true } },
    },
  });
  if (!curso) throw new ErroApi(404, "Curso não encontrado");
  if (curso.status !== "PUBLICADO" && user.perfil !== "ADMIN") throw new ErroApi(404, "Curso não encontrado");
  return curso;
}

export async function criar(dados) {
  if (!dados.nome || !dados.descricao) throw new ErroApi(400, "Nome e descrição são obrigatórios");
  const padroes = await obterConfiguracoes();
  return prisma.curso.create({
    data: {
      nome: dados.nome,
      descricao: dados.descricao,
      imagemCapaUrl: dados.imagemCapaUrl || null,
      cargaHoraria: dados.cargaHoraria || "",
      categoriaId: dados.categoriaId ? Number(dados.categoriaId) : null,
      status: dados.status || "RASCUNHO",
      percentualMinimoAula: Number(dados.percentualMinimoAula) || padroes.percentualMinimoAulaPadrao,
      notaMinimaQuiz: Number(dados.notaMinimaQuiz) || padroes.notaMinimaQuizPadrao,
      notaMinimaProva: Number(dados.notaMinimaProva) || padroes.notaMinimaProvaPadrao,
      maxTentativas: Number(dados.maxTentativas) || padroes.maxTentativasPadrao,
      tempoProvaMinutos: dados.tempoProvaMinutos ? Number(dados.tempoProvaMinutos) : null,
      numQuestoesProva: Number(dados.numQuestoesProva) || padroes.numQuestoesProvaPadrao,
      certificadoHabilitado: dados.certificadoHabilitado !== false,
    },
  });
}

export async function atualizar(id, dados) {
  const data = {};
  const campos = [
    "nome", "descricao", "imagemCapaUrl", "status", "cargaHoraria",
    "instrutor", "objetivos", "publicoAlvo", "preRequisitos", "competencias",
  ];
  const numericos = [
    "percentualMinimoAula", "notaMinimaQuiz",
    "notaMinimaProva", "maxTentativas", "tempoProvaMinutos", "numQuestoesProva", "categoriaId",
  ];
  for (const c of campos) if (dados[c] !== undefined) data[c] = dados[c];
  for (const c of numericos) if (dados[c] !== undefined) data[c] = dados[c] === null || dados[c] === "" ? null : Number(dados[c]);
  if (dados.certificadoHabilitado !== undefined) data.certificadoHabilitado = !!dados.certificadoHabilitado;

  return prisma.curso.update({ where: { id: Number(id) }, data });
}

export async function excluir(id) {
  const matriculas = await prisma.matricula.count({ where: { cursoId: Number(id) } });
  if (matriculas > 0) {
    throw new ErroApi(409, "Não é possível excluir um curso com alunos matriculados. Arquive o curso em vez disso.");
  }
  await prisma.curso.delete({ where: { id: Number(id) } });
}

// duplica curso + módulos + aulas + materiais + banco de questões (não
// duplica matrículas/progresso/certificados — a cópia começa "zerada")
export async function duplicar(id) {
  const original = await prisma.curso.findUnique({
    where: { id: Number(id) },
    include: {
      modulos: { orderBy: { ordem: "asc" }, include: { aulas: { orderBy: { ordem: "asc" }, include: { materiais: true } } } },
      questoes: true,
    },
  });
  if (!original) throw new ErroApi(404, "Curso não encontrado");

  return prisma.$transaction(async (tx) => {
    const { id: _id, criadoEm, atualizadoEm, modulos, questoes, ...dadosCurso } = original;
    const copia = await tx.curso.create({
      data: { ...dadosCurso, nome: `${dadosCurso.nome} (cópia)`, status: "RASCUNHO" },
    });

    const mapaModulos = {};
    for (const modulo of modulos) {
      const { id: moduloIdAntigo, cursoId, aulas, ...dadosModulo } = modulo;
      const novoModulo = await tx.modulo.create({ data: { ...dadosModulo, cursoId: copia.id } });
      mapaModulos[moduloIdAntigo] = novoModulo.id;

      for (const aula of aulas) {
        const { id: aulaIdAntiga, moduloId, materiais, ...dadosAula } = aula;
        const novaAula = await tx.aula.create({ data: { ...dadosAula, moduloId: novoModulo.id } });
        if (materiais.length) {
          await tx.material.createMany({
            data: materiais.map(({ id, aulaId, ...m }) => ({ ...m, aulaId: novaAula.id })),
          });
        }
      }
    }

    if (questoes.length) {
      await tx.questao.createMany({
        data: questoes.map(({ id, cursoId, moduloId, criadoEm: _c, ...q }) => ({
          ...q,
          cursoId: copia.id,
          moduloId: moduloId ? mapaModulos[moduloId] : null,
        })),
      });
    }

    return copia;
  // curso com muitos módulos/aulas pode levar alguns segundos (várias idas
  // ao banco em sequência) — o timeout padrão de transação interativa do
  // Prisma (5s) é curto demais num pooler remoto (Neon)
  }, { timeout: 30000 });
}

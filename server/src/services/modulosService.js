import prisma from "../db/prisma.js";

export async function listarPorCurso(cursoId) {
  return prisma.modulo.findMany({ where: { cursoId: Number(cursoId) }, orderBy: { ordem: "asc" } });
}

export async function criar(cursoId, { nome, descricao }) {
  const ultimo = await prisma.modulo.findFirst({ where: { cursoId: Number(cursoId) }, orderBy: { ordem: "desc" } });
  return prisma.modulo.create({
    data: { cursoId: Number(cursoId), nome, descricao: descricao || null, ordem: (ultimo?.ordem ?? -1) + 1 },
  });
}

export async function atualizar(id, { nome, descricao }) {
  const data = {};
  if (nome !== undefined) data.nome = nome;
  if (descricao !== undefined) data.descricao = descricao;
  return prisma.modulo.update({ where: { id: Number(id) }, data });
}

export async function excluir(id) {
  await prisma.modulo.delete({ where: { id: Number(id) } });
}

// reordenar: recebe a lista de ids na nova ordem
export async function reordenar(cursoId, idsEmOrdem) {
  await prisma.$transaction(
    idsEmOrdem.map((id, i) => prisma.modulo.update({ where: { id: Number(id) }, data: { ordem: i } }))
  );
  return listarPorCurso(cursoId);
}

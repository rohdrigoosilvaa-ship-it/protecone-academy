import prisma from "../db/prisma.js";

export async function listar() {
  return prisma.categoria.findMany({ orderBy: { nome: "asc" } });
}

export async function criar(nome) {
  return prisma.categoria.create({ data: { nome } });
}

export async function renomear(id, nome) {
  return prisma.categoria.update({ where: { id: Number(id) }, data: { nome } });
}

export async function excluir(id) {
  await prisma.categoria.delete({ where: { id: Number(id) } });
}

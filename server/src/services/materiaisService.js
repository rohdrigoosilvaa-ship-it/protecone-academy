import prisma from "../db/prisma.js";

export async function criar(aulaId, { nome, tipo, url }) {
  return prisma.material.create({ data: { aulaId: Number(aulaId), nome, tipo: tipo || "LINK", url } });
}

export async function excluir(id) {
  await prisma.material.delete({ where: { id: Number(id) } });
}

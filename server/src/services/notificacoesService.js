import prisma from "../db/prisma.js";

export async function criarNotificacao(usuarioId, tipo, mensagem, link = null) {
  return prisma.notificacao.create({ data: { usuarioId, tipo, mensagem, link } });
}

export async function listar(usuarioId) {
  return prisma.notificacao.findMany({ where: { usuarioId }, orderBy: { criadoEm: "desc" }, take: 50 });
}

export async function marcarLida(usuarioId, id) {
  await prisma.notificacao.updateMany({ where: { id: Number(id), usuarioId }, data: { lida: true } });
}

export async function marcarTodasLidas(usuarioId) {
  await prisma.notificacao.updateMany({ where: { usuarioId, lida: false }, data: { lida: true } });
}

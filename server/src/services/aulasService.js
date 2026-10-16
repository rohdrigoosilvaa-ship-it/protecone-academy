import prisma from "../db/prisma.js";

const include = { materiais: true };

export async function listarPorModulo(moduloId) {
  return prisma.aula.findMany({ where: { moduloId: Number(moduloId) }, orderBy: { ordem: "asc" }, include });
}

export async function obter(id) {
  return prisma.aula.findUnique({ where: { id: Number(id) }, include: { ...include, modulo: { include: { curso: true } } } });
}

export async function criar(moduloId, dados) {
  const ultimo = await prisma.aula.findFirst({ where: { moduloId: Number(moduloId) }, orderBy: { ordem: "desc" } });
  return prisma.aula.create({
    data: {
      moduloId: Number(moduloId),
      nome: dados.nome,
      descricao: dados.descricao || null,
      tipo: dados.tipo || "VIDEO",
      provedorVideo: dados.provedorVideo || null,
      videoId: dados.videoId || null,
      videoUrl: dados.videoUrl || null,
      conteudoTexto: dados.conteudoTexto || null,
      duracaoSegundos: dados.duracaoSegundos ? Number(dados.duracaoSegundos) : null,
      ordem: (ultimo?.ordem ?? -1) + 1,
    },
    include,
  });
}

export async function atualizar(id, dados) {
  const data = {};
  const campos = ["nome", "descricao", "tipo", "provedorVideo", "videoId", "videoUrl", "conteudoTexto"];
  for (const c of campos) if (dados[c] !== undefined) data[c] = dados[c];
  if (dados.duracaoSegundos !== undefined) data.duracaoSegundos = dados.duracaoSegundos ? Number(dados.duracaoSegundos) : null;
  return prisma.aula.update({ where: { id: Number(id) }, data, include });
}

export async function excluir(id) {
  await prisma.aula.delete({ where: { id: Number(id) } });
}

export async function reordenar(moduloId, idsEmOrdem) {
  await prisma.$transaction(
    idsEmOrdem.map((id, i) => prisma.aula.update({ where: { id: Number(id) }, data: { ordem: i } }))
  );
  return listarPorModulo(moduloId);
}

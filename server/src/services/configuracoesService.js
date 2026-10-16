import prisma from "../db/prisma.js";

// upsert garante que a linha única sempre exista, mesmo antes de qualquer edição
export async function obter() {
  return prisma.configuracaoPlataforma.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });
}

export async function atualizar(dados) {
  const campos = ["percentualMinimoAulaPadrao", "notaMinimaQuizPadrao", "notaMinimaProvaPadrao", "maxTentativasPadrao", "numQuestoesProvaPadrao"];
  const data = {};
  for (const c of campos) if (dados[c] !== undefined) data[c] = Number(dados[c]);
  return prisma.configuracaoPlataforma.upsert({
    where: { id: 1 },
    update: data,
    create: { id: 1, ...data },
  });
}

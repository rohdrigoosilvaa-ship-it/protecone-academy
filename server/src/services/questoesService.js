import prisma from "../db/prisma.js";
import { ErroApi } from "../utils/erros.js";

export async function listar({ cursoId, moduloId, dificuldade, bancoGeral }) {
  const where = {};
  if (cursoId) where.cursoId = Number(cursoId);
  if (moduloId) where.moduloId = Number(moduloId);
  if (bancoGeral === "true") where.moduloId = null;
  if (dificuldade) where.dificuldade = dificuldade;
  return prisma.questao.findMany({ where, orderBy: { id: "asc" } });
}

function validar(dados) {
  if (!dados.enunciado) throw new ErroApi(400, "Enunciado é obrigatório");
  if (!Array.isArray(dados.alternativas) || dados.alternativas.length !== 4) throw new ErroApi(400, "Informe exatamente 4 alternativas");
  const idx = Number(dados.respostaCorretaIndex);
  if (Number.isNaN(idx) || idx < 0 || idx > 3) throw new ErroApi(400, "Índice da resposta correta inválido");
}

export async function criar(cursoId, dados) {
  validar(dados);
  return prisma.questao.create({
    data: {
      cursoId: Number(cursoId),
      moduloId: dados.moduloId ? Number(dados.moduloId) : null,
      enunciado: dados.enunciado,
      alternativas: dados.alternativas,
      respostaCorretaIndex: Number(dados.respostaCorretaIndex),
      explicacao: dados.explicacao || null,
      pontuacao: Number(dados.pontuacao) || 1,
      dificuldade: dados.dificuldade || "MEDIO",
    },
  });
}

export async function atualizar(id, dados) {
  if (dados.alternativas || dados.respostaCorretaIndex !== undefined) validar({ ...dados, enunciado: dados.enunciado || "x" });
  const data = {};
  const campos = ["enunciado", "alternativas", "explicacao", "dificuldade"];
  for (const c of campos) if (dados[c] !== undefined) data[c] = dados[c];
  if (dados.respostaCorretaIndex !== undefined) data.respostaCorretaIndex = Number(dados.respostaCorretaIndex);
  if (dados.pontuacao !== undefined) data.pontuacao = Number(dados.pontuacao);
  if (dados.moduloId !== undefined) data.moduloId = dados.moduloId ? Number(dados.moduloId) : null;
  return prisma.questao.update({ where: { id: Number(id) }, data });
}

export async function excluir(id) {
  await prisma.questao.delete({ where: { id: Number(id) } });
}

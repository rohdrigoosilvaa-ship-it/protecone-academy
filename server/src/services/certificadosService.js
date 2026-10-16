import prisma from "../db/prisma.js";
import { ErroApi } from "../utils/erros.js";
import { criarNotificacao } from "./notificacoesService.js";

export async function emitirSeNecessario(usuarioId, cursoId) {
  const curso = await prisma.curso.findUnique({ where: { id: Number(cursoId) } });
  if (!curso?.certificadoHabilitado) return null;

  const existente = await prisma.certificado.findUnique({ where: { usuarioId_cursoId: { usuarioId, cursoId: curso.id } } });
  if (existente) return existente;

  const ano = new Date().getFullYear();
  const total = await prisma.certificado.count();
  const codigo = `PSA-${ano}-${String(total + 1).padStart(6, "0")}`;

  const certificado = await prisma.certificado.create({
    data: { codigo, usuarioId, cursoId: curso.id, cargaHoraria: curso.cargaHoraria },
  });
  await criarNotificacao(usuarioId, "CERTIFICADO", `Parabéns! Seu certificado do treinamento "${curso.nome}" está disponível.`, `/certificados`);
  return certificado;
}

export async function listarMinhas(usuarioId) {
  return prisma.certificado.findMany({ where: { usuarioId }, include: { curso: true }, orderBy: { emitidoEm: "desc" } });
}

export async function listarTodos() {
  return prisma.certificado.findMany({ include: { curso: true, usuario: true }, orderBy: { emitidoEm: "desc" } });
}

export async function obterParaEmissao(id, usuarioId, perfil) {
  const certificado = await prisma.certificado.findUnique({ where: { id: Number(id) }, include: { curso: true, usuario: true } });
  if (!certificado) throw new ErroApi(404, "Certificado não encontrado");
  if (perfil !== "ADMIN" && certificado.usuarioId !== usuarioId) throw new ErroApi(403, "Sem permissão");
  return certificado;
}

export async function validarPorCodigo(codigo) {
  const certificado = await prisma.certificado.findUnique({
    where: { codigo: (codigo || "").toUpperCase().trim() },
    include: { curso: true, usuario: true },
  });
  if (!certificado) return null;
  return {
    valido: true,
    codigo: certificado.codigo,
    nome: certificado.usuario.nome,
    curso: certificado.curso.nome,
    cargaHoraria: certificado.cargaHoraria,
    emitidoEm: certificado.emitidoEm,
  };
}

// admin: reemitir com um novo código (ex.: correção de nome do aluno)
export async function reemitir(id) {
  const atual = await prisma.certificado.findUnique({ where: { id: Number(id) } });
  if (!atual) throw new ErroApi(404, "Certificado não encontrado");
  const ano = new Date().getFullYear();
  const total = await prisma.certificado.count();
  const codigo = `PSA-${ano}-${String(total + 1).padStart(6, "0")}`;
  return prisma.certificado.update({ where: { id: atual.id }, data: { codigo, emitidoEm: new Date() } });
}

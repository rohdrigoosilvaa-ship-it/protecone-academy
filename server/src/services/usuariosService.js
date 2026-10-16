import prisma from "../db/prisma.js";
import { hashSenha, paraPublico } from "./authService.js";
import { ErroApi } from "../utils/erros.js";

export async function listar() {
  const usuarios = await prisma.usuario.findMany({ orderBy: { nome: "asc" } });
  return usuarios.map(paraPublico);
}

export async function criar({ nome, email, senha, perfil }) {
  if (!nome || !email || !senha) throw new ErroApi(400, "Nome, e-mail e senha são obrigatórios");
  const existente = await prisma.usuario.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (existente) throw new ErroApi(409, "Já existe um usuário com este e-mail");
  const usuario = await prisma.usuario.create({
    data: {
      nome,
      email: email.toLowerCase().trim(),
      senhaHash: await hashSenha(senha),
      perfil: perfil === "ADMIN" ? "ADMIN" : "ALUNO",
    },
  });
  return paraPublico(usuario);
}

export async function atualizar(id, patch) {
  const data = {};
  if (patch.nome !== undefined) data.nome = patch.nome;
  if (patch.perfil !== undefined) data.perfil = patch.perfil === "ADMIN" ? "ADMIN" : "ALUNO";
  if (patch.ativo !== undefined) data.ativo = !!patch.ativo;
  if (patch.senha) data.senhaHash = await hashSenha(patch.senha);
  const usuario = await prisma.usuario.update({ where: { id: Number(id) }, data });
  return paraPublico(usuario);
}

export async function excluir(id) {
  await prisma.usuario.delete({ where: { id: Number(id) } });
}

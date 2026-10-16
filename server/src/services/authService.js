import bcrypt from "bcryptjs";
import prisma from "../db/prisma.js";
import { gerarToken } from "../middleware/auth.js";
import { ErroApi } from "../utils/erros.js";

export async function login(email, senha) {
  const usuario = await prisma.usuario.findUnique({ where: { email: email?.toLowerCase().trim() } });
  if (!usuario || !usuario.ativo) throw new ErroApi(401, "E-mail ou senha inválidos");
  const ok = await bcrypt.compare(senha || "", usuario.senhaHash);
  if (!ok) throw new ErroApi(401, "E-mail ou senha inválidos");
  await prisma.usuario.update({ where: { id: usuario.id }, data: { ultimoLoginEm: new Date() } });
  const token = gerarToken(usuario);
  return { token, usuario: paraPublico(usuario) };
}

export async function me(id) {
  const usuario = await prisma.usuario.findUnique({ where: { id } });
  if (!usuario) throw new ErroApi(404, "Usuário não encontrado");
  return paraPublico(usuario);
}

export function paraPublico(usuario) {
  const { senhaHash, ...resto } = usuario;
  return resto;
}

export async function hashSenha(senha) {
  return bcrypt.hash(senha, 10);
}

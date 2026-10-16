import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import prisma from "../db/prisma.js";

export function gerarToken(usuario) {
  return jwt.sign(
    { id: usuario.id, email: usuario.email, nome: usuario.nome, perfil: usuario.perfil },
    env.jwtSecret,
    { expiresIn: "12h" }
  );
}

// exige login válido; revalida "ativo" no banco a cada request
export async function auth(req, res, next) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) return res.status(401).json({ erro: "Não autenticado" });
  try {
    const decodificado = jwt.verify(token, env.jwtSecret);
    const usuario = await prisma.usuario.findUnique({ where: { id: decodificado.id } });
    if (!usuario || !usuario.ativo) return res.status(401).json({ erro: "Conta inativa" });
    req.user = decodificado;
    next();
  } catch {
    return res.status(401).json({ erro: "Sessão expirada. Entre novamente." });
  }
}

export function requirePerfil(...perfis) {
  return (req, res, next) => {
    if (!perfis.includes(req.user.perfil)) {
      return res.status(403).json({ erro: "Você não tem permissão para esta ação" });
    }
    next();
  };
}

import * as authService from "../services/authService.js";
import { assincrono } from "../utils/erros.js";

export const login = assincrono(async (req, res) => {
  const { email, senha } = req.body;
  const r = await authService.login(email, senha);
  res.json(r);
});

export const me = assincrono(async (req, res) => {
  const usuario = await authService.me(req.user.id);
  res.json({ usuario });
});

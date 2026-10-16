import * as progressoService from "../services/progressoService.js";
import { assincrono } from "../utils/erros.js";

export const registrar = assincrono(async (req, res) => {
  res.json(await progressoService.registrarProgressoAula(req.user.id, req.params.aulaId, req.body));
});

export const marcarConcluida = assincrono(async (req, res) => {
  res.json(await progressoService.marcarAulaConcluida(req.user.id, req.params.aulaId));
});

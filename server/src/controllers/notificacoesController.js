import * as notificacoesService from "../services/notificacoesService.js";
import { assincrono } from "../utils/erros.js";

export const listar = assincrono(async (req, res) => res.json(await notificacoesService.listar(req.user.id)));
export const marcarLida = assincrono(async (req, res) => { await notificacoesService.marcarLida(req.user.id, req.params.id); res.status(204).end(); });
export const marcarTodasLidas = assincrono(async (req, res) => { await notificacoesService.marcarTodasLidas(req.user.id); res.status(204).end(); });

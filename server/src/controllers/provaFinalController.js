import * as provaFinalService from "../services/provaFinalService.js";
import { assincrono } from "../utils/erros.js";

export const iniciar = assincrono(async (req, res) => res.json(await provaFinalService.iniciar(req.params.cursoId, req.user.id)));
export const submeter = assincrono(async (req, res) => res.json(await provaFinalService.submeter(req.params.tentativaId, req.user.id, req.body.respostas)));

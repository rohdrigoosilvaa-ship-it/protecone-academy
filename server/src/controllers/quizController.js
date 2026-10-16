import * as quizService from "../services/quizService.js";
import { assincrono } from "../utils/erros.js";

export const obter = assincrono(async (req, res) => res.json(await quizService.obter(req.params.moduloId, req.user.id)));
export const submeter = assincrono(async (req, res) => res.json(await quizService.submeter(req.params.moduloId, req.user.id, req.body.respostas)));

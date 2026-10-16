import * as configuracoesService from "../services/configuracoesService.js";
import { assincrono } from "../utils/erros.js";

export const obter = assincrono(async (req, res) => res.json(await configuracoesService.obter()));
export const atualizar = assincrono(async (req, res) => res.json(await configuracoesService.atualizar(req.body)));

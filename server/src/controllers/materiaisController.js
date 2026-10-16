import * as materiaisService from "../services/materiaisService.js";
import { assincrono } from "../utils/erros.js";

export const criar = assincrono(async (req, res) => res.status(201).json(await materiaisService.criar(req.params.aulaId, req.body)));
export const excluir = assincrono(async (req, res) => { await materiaisService.excluir(req.params.id); res.status(204).end(); });

import * as questoesService from "../services/questoesService.js";
import { assincrono } from "../utils/erros.js";

export const listar = assincrono(async (req, res) => res.json(await questoesService.listar(req.query)));
export const criar = assincrono(async (req, res) => res.status(201).json(await questoesService.criar(req.params.cursoId, req.body)));
export const atualizar = assincrono(async (req, res) => res.json(await questoesService.atualizar(req.params.id, req.body)));
export const excluir = assincrono(async (req, res) => { await questoesService.excluir(req.params.id); res.status(204).end(); });

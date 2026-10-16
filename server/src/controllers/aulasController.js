import * as aulasService from "../services/aulasService.js";
import { assincrono } from "../utils/erros.js";

export const listarPorModulo = assincrono(async (req, res) => res.json(await aulasService.listarPorModulo(req.params.moduloId)));
export const obter = assincrono(async (req, res) => res.json(await aulasService.obter(req.params.id)));
export const criar = assincrono(async (req, res) => res.status(201).json(await aulasService.criar(req.params.moduloId, req.body)));
export const atualizar = assincrono(async (req, res) => res.json(await aulasService.atualizar(req.params.id, req.body)));
export const excluir = assincrono(async (req, res) => { await aulasService.excluir(req.params.id); res.status(204).end(); });
export const reordenar = assincrono(async (req, res) => res.json(await aulasService.reordenar(req.params.moduloId, req.body.ids)));

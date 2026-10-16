import * as modulosService from "../services/modulosService.js";
import { assincrono } from "../utils/erros.js";

export const listarPorCurso = assincrono(async (req, res) => res.json(await modulosService.listarPorCurso(req.params.cursoId)));
export const criar = assincrono(async (req, res) => res.status(201).json(await modulosService.criar(req.params.cursoId, req.body)));
export const atualizar = assincrono(async (req, res) => res.json(await modulosService.atualizar(req.params.id, req.body)));
export const excluir = assincrono(async (req, res) => { await modulosService.excluir(req.params.id); res.status(204).end(); });
export const reordenar = assincrono(async (req, res) => res.json(await modulosService.reordenar(req.params.cursoId, req.body.ids)));

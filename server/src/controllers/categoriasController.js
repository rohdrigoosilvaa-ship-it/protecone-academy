import * as categoriasService from "../services/categoriasService.js";
import { assincrono } from "../utils/erros.js";

export const listar = assincrono(async (req, res) => res.json(await categoriasService.listar()));
export const criar = assincrono(async (req, res) => res.status(201).json(await categoriasService.criar(req.body.nome)));
export const renomear = assincrono(async (req, res) => res.json(await categoriasService.renomear(req.params.id, req.body.nome)));
export const excluir = assincrono(async (req, res) => { await categoriasService.excluir(req.params.id); res.status(204).end(); });

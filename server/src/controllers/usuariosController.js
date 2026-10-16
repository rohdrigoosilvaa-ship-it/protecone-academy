import * as usuariosService from "../services/usuariosService.js";
import { assincrono } from "../utils/erros.js";

export const listar = assincrono(async (req, res) => res.json(await usuariosService.listar()));

export const criar = assincrono(async (req, res) => {
  res.status(201).json(await usuariosService.criar(req.body));
});

export const atualizar = assincrono(async (req, res) => {
  res.json(await usuariosService.atualizar(req.params.id, req.body));
});

export const excluir = assincrono(async (req, res) => {
  await usuariosService.excluir(req.params.id);
  res.status(204).end();
});

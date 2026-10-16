import * as matriculasService from "../services/matriculasService.js";
import { assincrono } from "../utils/erros.js";

export const matricular = assincrono(async (req, res) => {
  res.status(201).json(await matriculasService.matricular(req.body.usuarioId, req.body.cursoId, { expiraEm: req.body.expiraEm }));
});

export const matricularVarios = assincrono(async (req, res) => {
  res.status(201).json(await matriculasService.matricularVarios(req.body.usuarioIds, req.body.cursoId, { expiraEm: req.body.expiraEm }));
});

export const cancelar = assincrono(async (req, res) => res.json(await matriculasService.cancelar(req.params.id)));

export const minhas = assincrono(async (req, res) => res.json(await matriculasService.listarMinhas(req.user.id)));

export const porCurso = assincrono(async (req, res) => res.json(await matriculasService.listarPorCurso(req.params.cursoId)));

export const porAluno = assincrono(async (req, res) => res.json(await matriculasService.listarPorAluno(req.params.usuarioId)));

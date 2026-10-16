import * as cursosService from "../services/cursosService.js";
import * as progressoService from "../services/progressoService.js";
import * as matriculasService from "../services/matriculasService.js";
import { assincrono } from "../utils/erros.js";

export const listar = assincrono(async (req, res) => res.json(await cursosService.listar(req.user)));

export const obter = assincrono(async (req, res) => res.json(await cursosService.obter(req.params.id, req.user)));

// admin pode inspecionar a estrutura de qualquer curso (gestão de
// conteúdo); aluno só acessa progresso de curso em que tem matrícula
// válida — checado aqui, não só escondido no front (ponto 8 do escopo)
export const obterProgresso = assincrono(async (req, res) => {
  if (req.user.perfil !== "ADMIN") await matriculasService.obterMatriculaValida(req.user.id, req.params.id);
  const r = await progressoService.calcularProgressoCurso(req.params.id, req.user.id);
  res.json(r);
});

export const criar = assincrono(async (req, res) => res.status(201).json(await cursosService.criar(req.body)));

export const atualizar = assincrono(async (req, res) => res.json(await cursosService.atualizar(req.params.id, req.body)));

export const excluir = assincrono(async (req, res) => { await cursosService.excluir(req.params.id); res.status(204).end(); });

export const duplicar = assincrono(async (req, res) => res.status(201).json(await cursosService.duplicar(req.params.id)));

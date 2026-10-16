import * as relatoriosService from "../services/relatoriosService.js";
import { assincrono } from "../utils/erros.js";

export const dashboardAdmin = assincrono(async (req, res) => res.json(await relatoriosService.dashboardAdmin()));
export const buscarAlunos = assincrono(async (req, res) => res.json(await relatoriosService.buscarAlunos(req.query.q || "")));
export const relatorioAluno = assincrono(async (req, res) => {
  const r = await relatoriosService.relatorioAluno(req.params.usuarioId);
  if (!r) return res.status(404).json({ erro: "Aluno não encontrado" });
  res.json(r);
});
export const relatorioCurso = assincrono(async (req, res) => {
  const r = await relatoriosService.relatorioCurso(req.params.cursoId);
  if (!r) return res.status(404).json({ erro: "Curso não encontrado" });
  res.json(r);
});

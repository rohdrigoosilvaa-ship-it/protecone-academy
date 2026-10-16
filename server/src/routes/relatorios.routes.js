import { Router } from "express";
import * as relatoriosController from "../controllers/relatoriosController.js";
import { auth, requirePerfil } from "../middleware/auth.js";

const router = Router();
router.use(auth, requirePerfil("ADMIN"));

router.get("/dashboard", relatoriosController.dashboardAdmin);
router.get("/alunos/busca", relatoriosController.buscarAlunos);
router.get("/alunos/:usuarioId", relatoriosController.relatorioAluno);
router.get("/cursos/:cursoId", relatoriosController.relatorioCurso);

export default router;

import { Router } from "express";
import authRoutes from "./auth.routes.js";
import usuariosRoutes from "./usuarios.routes.js";
import categoriasRoutes from "./categorias.routes.js";
import cursosRoutes from "./cursos.routes.js";
import modulosRoutes from "./modulos.routes.js";
import aulasRoutes from "./aulas.routes.js";
import materiaisRoutes from "./materiais.routes.js";
import matriculasRoutes from "./matriculas.routes.js";
import progressoRoutes from "./progresso.routes.js";
import questoesRoutes from "./questoes.routes.js";
import quizRoutes from "./quiz.routes.js";
import provaFinalRoutes from "./provaFinal.routes.js";
import certificadosRoutes from "./certificados.routes.js";
import notificacoesRoutes from "./notificacoes.routes.js";
import relatoriosRoutes from "./relatorios.routes.js";
import configuracoesRoutes from "./configuracoes.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/usuarios", usuariosRoutes);
router.use("/categorias", categoriasRoutes);
router.use("/cursos", cursosRoutes);
router.use("/modulos", modulosRoutes);
router.use("/aulas", aulasRoutes);
router.use("/materiais", materiaisRoutes);
router.use("/matriculas", matriculasRoutes);
router.use("/progresso", progressoRoutes);
router.use("/questoes", questoesRoutes);
router.use("/quiz", quizRoutes);
router.use("/prova-final", provaFinalRoutes);
router.use("/certificados", certificadosRoutes);
router.use("/notificacoes", notificacoesRoutes);
router.use("/relatorios", relatoriosRoutes);
router.use("/configuracoes", configuracoesRoutes);

export default router;

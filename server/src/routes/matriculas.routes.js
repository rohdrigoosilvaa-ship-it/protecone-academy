import { Router } from "express";
import * as matriculasController from "../controllers/matriculasController.js";
import { auth, requirePerfil } from "../middleware/auth.js";

const router = Router();
router.use(auth);

// aluno: só a própria lista
router.get("/minhas", matriculasController.minhas);

// admin: matricular/cancelar/consultar
router.post("/", requirePerfil("ADMIN"), matriculasController.matricular);
router.post("/em-massa", requirePerfil("ADMIN"), matriculasController.matricularVarios);
router.patch("/:id/cancelar", requirePerfil("ADMIN"), matriculasController.cancelar);
router.get("/curso/:cursoId", requirePerfil("ADMIN"), matriculasController.porCurso);
router.get("/aluno/:usuarioId", requirePerfil("ADMIN"), matriculasController.porAluno);

export default router;

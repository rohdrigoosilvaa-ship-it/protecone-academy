import { Router } from "express";
import * as modulosController from "../controllers/modulosController.js";
import { auth, requirePerfil } from "../middleware/auth.js";

const router = Router();
router.use(auth);

router.get("/curso/:cursoId", modulosController.listarPorCurso);
router.post("/curso/:cursoId", requirePerfil("ADMIN"), modulosController.criar);
router.put("/curso/:cursoId/reordenar", requirePerfil("ADMIN"), modulosController.reordenar);
router.put("/:id", requirePerfil("ADMIN"), modulosController.atualizar);
router.delete("/:id", requirePerfil("ADMIN"), modulosController.excluir);

export default router;

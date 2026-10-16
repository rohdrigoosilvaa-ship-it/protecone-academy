import { Router } from "express";
import * as aulasController from "../controllers/aulasController.js";
import { auth, requirePerfil } from "../middleware/auth.js";

const router = Router();
router.use(auth);

router.get("/modulo/:moduloId", aulasController.listarPorModulo);
router.post("/modulo/:moduloId", requirePerfil("ADMIN"), aulasController.criar);
router.put("/modulo/:moduloId/reordenar", requirePerfil("ADMIN"), aulasController.reordenar);
router.get("/:id", aulasController.obter);
router.put("/:id", requirePerfil("ADMIN"), aulasController.atualizar);
router.delete("/:id", requirePerfil("ADMIN"), aulasController.excluir);

export default router;

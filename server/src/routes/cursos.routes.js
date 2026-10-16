import { Router } from "express";
import * as cursosController from "../controllers/cursosController.js";
import { auth, requirePerfil } from "../middleware/auth.js";

const router = Router();
router.use(auth);

router.get("/", cursosController.listar);
router.get("/:id", cursosController.obter);
router.get("/:id/progresso", cursosController.obterProgresso);
router.post("/", requirePerfil("ADMIN"), cursosController.criar);
router.post("/:id/duplicar", requirePerfil("ADMIN"), cursosController.duplicar);
router.put("/:id", requirePerfil("ADMIN"), cursosController.atualizar);
router.delete("/:id", requirePerfil("ADMIN"), cursosController.excluir);

export default router;

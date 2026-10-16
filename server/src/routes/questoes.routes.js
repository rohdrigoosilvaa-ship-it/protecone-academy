import { Router } from "express";
import * as questoesController from "../controllers/questoesController.js";
import { auth, requirePerfil } from "../middleware/auth.js";

const router = Router();
router.use(auth, requirePerfil("ADMIN"));

router.get("/", questoesController.listar);
router.post("/curso/:cursoId", questoesController.criar);
router.put("/:id", questoesController.atualizar);
router.delete("/:id", questoesController.excluir);

export default router;

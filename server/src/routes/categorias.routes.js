import { Router } from "express";
import * as categoriasController from "../controllers/categoriasController.js";
import { auth, requirePerfil } from "../middleware/auth.js";

const router = Router();

router.get("/", auth, categoriasController.listar);
router.post("/", auth, requirePerfil("ADMIN"), categoriasController.criar);
router.put("/:id", auth, requirePerfil("ADMIN"), categoriasController.renomear);
router.delete("/:id", auth, requirePerfil("ADMIN"), categoriasController.excluir);

export default router;

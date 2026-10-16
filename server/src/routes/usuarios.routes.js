import { Router } from "express";
import * as usuariosController from "../controllers/usuariosController.js";
import { auth, requirePerfil } from "../middleware/auth.js";

const router = Router();
router.use(auth, requirePerfil("ADMIN"));

router.get("/", usuariosController.listar);
router.post("/", usuariosController.criar);
router.patch("/:id", usuariosController.atualizar);
router.delete("/:id", usuariosController.excluir);

export default router;

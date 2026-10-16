import { Router } from "express";
import * as materiaisController from "../controllers/materiaisController.js";
import { auth, requirePerfil } from "../middleware/auth.js";

const router = Router();
router.use(auth, requirePerfil("ADMIN"));

router.post("/aula/:aulaId", materiaisController.criar);
router.delete("/:id", materiaisController.excluir);

export default router;

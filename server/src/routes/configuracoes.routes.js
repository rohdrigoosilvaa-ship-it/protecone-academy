import { Router } from "express";
import * as configuracoesController from "../controllers/configuracoesController.js";
import { auth, requirePerfil } from "../middleware/auth.js";

const router = Router();
router.use(auth, requirePerfil("ADMIN"));

router.get("/", configuracoesController.obter);
router.put("/", configuracoesController.atualizar);

export default router;

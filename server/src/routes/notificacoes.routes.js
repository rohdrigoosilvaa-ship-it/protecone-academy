import { Router } from "express";
import * as notificacoesController from "../controllers/notificacoesController.js";
import { auth } from "../middleware/auth.js";

const router = Router();
router.use(auth);

router.get("/", notificacoesController.listar);
router.patch("/:id/lida", notificacoesController.marcarLida);
router.patch("/lidas", notificacoesController.marcarTodasLidas);

export default router;

import { Router } from "express";
import * as progressoController from "../controllers/progressoController.js";
import { auth } from "../middleware/auth.js";

const router = Router();
router.use(auth);

router.patch("/aula/:aulaId", progressoController.registrar);
router.post("/aula/:aulaId/concluir", progressoController.marcarConcluida);

export default router;

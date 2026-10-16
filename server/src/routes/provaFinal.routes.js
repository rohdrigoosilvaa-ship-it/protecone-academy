import { Router } from "express";
import * as provaFinalController from "../controllers/provaFinalController.js";
import { auth } from "../middleware/auth.js";

const router = Router();
router.use(auth);

router.post("/curso/:cursoId/iniciar", provaFinalController.iniciar);
router.post("/tentativa/:tentativaId/submeter", provaFinalController.submeter);

export default router;

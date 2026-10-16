import { Router } from "express";
import * as quizController from "../controllers/quizController.js";
import { auth } from "../middleware/auth.js";

const router = Router();
router.use(auth);

router.get("/modulo/:moduloId", quizController.obter);
router.post("/modulo/:moduloId/submeter", quizController.submeter);

export default router;

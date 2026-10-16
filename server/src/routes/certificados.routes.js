import { Router } from "express";
import * as certificadosController from "../controllers/certificadosController.js";
import { auth, requirePerfil } from "../middleware/auth.js";

const router = Router();

// pública — validação de certificado, sem login (seção 15 do escopo)
router.get("/validar/:codigo", certificadosController.validar);

router.use(auth);
router.get("/minhas", certificadosController.minhas);
router.get("/:id/pdf", certificadosController.baixarPdf);
router.get("/", requirePerfil("ADMIN"), certificadosController.todas);
router.post("/:id/reemitir", requirePerfil("ADMIN"), certificadosController.reemitir);

export default router;

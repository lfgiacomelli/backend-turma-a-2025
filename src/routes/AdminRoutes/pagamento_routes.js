import express from "express";

import PagamentosController from "../../controllers/AdminController/PagamentosController.js";

import authMiddlewareAdmin from "../../middlewares/authMiddlewareAdmin.js";

const router = express.Router();

router.get("/", authMiddlewareAdmin, PagamentosController.listar);
router.get('/verificar-hoje', authMiddlewareAdmin, PagamentosController.verificarPagamentosHoje);
router.post("/gerar-diarias", authMiddlewareAdmin, PagamentosController.gerarDiarias);
router.put("/atualizar-status/:id", authMiddlewareAdmin, PagamentosController.atualizarStatus);

export default router;
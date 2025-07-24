import express from "express";

import PagamentosController from "../../controllers/AdminController/PagamentosController.js";

const router = express.Router();

router.get("/", PagamentosController.listar);
router.post("/gerar-diarias", PagamentosController.gerarDiarias);
router.put("/atualizar-status/:id", PagamentosController.atualizarStatus);

export default router;
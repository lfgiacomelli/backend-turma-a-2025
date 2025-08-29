import express from 'express';
import RelatorioController from '../../controllers/AdminController/RelatorioController.js';
import authMiddlewareAdmin from '../../middlewares/authMiddlewareAdmin.js';

const router = express.Router();

router.get('/', authMiddlewareAdmin, RelatorioController.getRelatorios);
router.get('/faturamento', authMiddlewareAdmin, RelatorioController.faturamentoDiario);
router.get('/recusadas', authMiddlewareAdmin, RelatorioController.solicitacoesRecusadas);

export default router;

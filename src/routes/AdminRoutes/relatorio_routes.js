import express from 'express';
import RelatorioController from '../../controllers/AdminController/RelatorioController.js';
import authMiddleware from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, RelatorioController.getRelatorios);
router.get('/faturamento', authMiddleware, RelatorioController.faturamentoDiario);

export default router;

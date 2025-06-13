import express from 'express';
import { gerarPagamentoPix, verificarStatusPagamento } from '../controllers/PaymentController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/pix', authMiddleware, gerarPagamentoPix);

router.get('/status/:id', authMiddleware, verificarStatusPagamento);

export default router;

import express from 'express';
import ViagemController from '../../controllers/AdminController/ViagemController.js';
import authMiddleware from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, ViagemController.listar);
router.get('/finalizadas', authMiddleware, ViagemController.contadorDeViagens);
router.get('/pendentes', authMiddleware, ViagemController.listarEmAndamento);
router.get('/:id', authMiddleware, ViagemController.detalhes);
router.post('/finalizar/:id', authMiddleware, ViagemController.finalizar);
router.post('/finalizar-todas', authMiddleware, ViagemController.finalizarTodas);

export default router;

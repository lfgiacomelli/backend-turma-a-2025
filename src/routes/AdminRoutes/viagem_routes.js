import express from 'express';
import ViagemController from '../../controllers/AdminController/ViagemController.js';
import authMiddlewareAdmin from '../../middlewares/authMiddlewareAdmin.js';

const router = express.Router();

router.get('/', authMiddlewareAdmin, ViagemController.listar);
router.get('/finalizadas', authMiddlewareAdmin, ViagemController.contadorDeViagens);
router.get('/pendentes', authMiddlewareAdmin, ViagemController.listarEmAndamento);
router.get('/:id', authMiddlewareAdmin, ViagemController.detalhes);
router.post('/finalizar/:id', authMiddlewareAdmin, ViagemController.finalizar);
router.post('/finalizar-todas', authMiddlewareAdmin, ViagemController.finalizarTodas);

export default router;

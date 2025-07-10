import express from 'express';
import SolicitacaoController from '../../controllers/AdminController/SolicitacaoController.js';
import authMiddleware from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, SolicitacaoController.listar);
router.get('/pendentes', authMiddleware, SolicitacaoController.listarPendentes);
router.post('/aceitar/:id', authMiddleware, SolicitacaoController.aceitar);
router.post('/recusar/:id', authMiddleware, SolicitacaoController.recusar);

export default router;

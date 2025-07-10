import express from 'express';
import SolicitacaoController from '../../controllers/AdminController/SolicitacaoController.js';
import authMiddlewareAdmin from '../../middlewares/authMiddlewareAdmin.js';

const router = express.Router();

router.get('/', authMiddlewareAdmin, SolicitacaoController.listar);
router.get('/pendentes', authMiddlewareAdmin, SolicitacaoController.listarPendentes);
router.post('/aceitar/:id', authMiddlewareAdmin, SolicitacaoController.aceitar);
router.post('/recusar/:id', authMiddlewareAdmin, SolicitacaoController.recusar);

export default router;

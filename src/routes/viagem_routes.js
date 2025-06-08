import express from 'express';
import ViagemController from '../controllers/ViagemController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();


router.get('/:id', authMiddleware, ViagemController.getViagemPorUsuario);
router.get('/solicitacao/:solicitacaoId/funcionario', authMiddleware, ViagemController.getFuncionarioPorViagem);
router.get('/andamento/:id', authMiddleware, ViagemController.verificarUltimaViagem);
router.get('/viagem/:id', authMiddleware, ViagemController.getViagemById);
router.get('/andamento/:id', authMiddleware, ViagemController.viagemEmAndamento);
router.get('/naoavaliada/:id', authMiddleware, ViagemController.getUltimaViagemNaoAvaliada);

export default router;

import express from 'express';
import SolicitacaoController from '../controllers/SolicitacaoController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
const router = express.Router();

router.post('/', authMiddleware, SolicitacaoController.createSolicitacao); 
router.patch('/:id', authMiddleware, SolicitacaoController.updateSolicitacao);
router.delete('/:id', authMiddleware, SolicitacaoController.cancelarSolicitacao); 
router.get('/', authMiddleware, SolicitacaoController.getSolicitacao);
router.get('/:id', authMiddleware, SolicitacaoController.getSolicitacaoById);

export default router;

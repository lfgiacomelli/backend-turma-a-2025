import express from 'express';
import SolicitacaoController from '../controllers/SolicitacaoController.js';

const router = express.Router();

router.post('/solicitacao', SolicitacaoController.createSolicitacao);
router.patch('/solicitacao/:id', SolicitacaoController.updateSolicitacao);
router.delete('/solicitacao/:id', SolicitacaoController.deleteSolicitacao);
router.get('/solicitacao/:id', SolicitacaoController.getSolicitacao);

export default router;
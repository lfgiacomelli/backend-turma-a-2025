import express from 'express';
import SolicitacaoController from '../controllers/SolicitacaoController.js';

const router = express.Router();

router.post('/', SolicitacaoController.createSolicitacao); 
router.patch('/:id', SolicitacaoController.updateSolicitacao);
router.delete('/:id', SolicitacaoController.cancelarSolicitacao); 
router.get('/', SolicitacaoController.getSolicitacao);

export default router;

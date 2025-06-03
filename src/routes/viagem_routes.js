import express from 'express';
import ViagemController from '../controllers/ViagemController.js';

const router = express.Router();

router.get('/:id', ViagemController.getViagemPorUsuario);

router.get('/solicitacao/:solicitacaoId/funcionario', ViagemController.getFuncionarioPorViagem);

router.get('/andamento/:id', ViagemController.verificarUltimaViagem);
router.get('/viagem/:id', ViagemController.getViagemById);
router.get('/andamento/:id', ViagemController.viagemEmAndamento);

export default router;

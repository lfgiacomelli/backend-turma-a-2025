import express from 'express';
import ViagemController from '../controllers/ViagemController.js';

const router = express.Router();
router.get('/:id', ViagemController.getViagemPorUsuario);
router.get('/solicitacao/:solicitacaoId/funcionario', ViagemController.getFuncionarioPorViagem);
router.get('/:via_codigo', ViagemController.getViagemPorId);
router.get('/andamento/:id', ViagemController.verificarAndamento);
router.get('/usuario/:usu_codigo', ViagemController.getViagensPorUsuario);

export default router;








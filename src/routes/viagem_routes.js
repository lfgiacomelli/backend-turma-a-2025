import express from 'express';
import ViagemController from '../controllers/ViagemController.js';

const router = express.Router();

router.post('/', ViagemController.createViagem);
router.get('/:id', ViagemController.getViagemPorUsuario);
router.put('/:id', ViagemController.updateViagem);
router.delete('/:id', ViagemController.deleteViagem);

router.get('/solicitacao/:solicitacaoId/funcionario', ViagemController.getFuncionarioPorViagem);

export default router;
import express from 'express';

import FuncionarioController from '../../controllers/AdminController/FuncionarioController.js';

import authMiddleware from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, FuncionarioController.listar);
router.get('/ativos', authMiddleware, FuncionarioController.listarAtivos);
router.post('/adicionar', authMiddleware, FuncionarioController.adicionar);
router.put('/editar/:id', authMiddleware, FuncionarioController.editar);
router.delete('/excluir/:id', authMiddleware, FuncionarioController.excluir);
router.patch('/ativar-desativar/:id', authMiddleware, FuncionarioController.ativarDesativar);
export default router;


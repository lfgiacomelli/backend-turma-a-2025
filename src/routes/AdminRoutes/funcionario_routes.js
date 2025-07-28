import express from 'express';

import upload from '../../middlewares/uploads.js';

import FuncionarioController from '../../controllers/AdminController/FuncionarioController.js';

import authMiddlewareAdmin from '../../middlewares/authMiddlewareAdmin.js';

const router = express.Router();

router.get('/', authMiddlewareAdmin, FuncionarioController.listar);
router.get('/ativos', authMiddlewareAdmin, FuncionarioController.listarAtivos);
router.post('/adicionar', upload.single('foto'), FuncionarioController.adicionar);
router.put('/editar/:id', authMiddlewareAdmin, FuncionarioController.editar);
router.delete('/excluir/:id', authMiddlewareAdmin, FuncionarioController.excluir);
router.patch('/ativar-desativar/:id', authMiddlewareAdmin, FuncionarioController.ativarDesativar);
export default router;


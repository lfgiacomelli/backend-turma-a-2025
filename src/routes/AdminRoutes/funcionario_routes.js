import express from 'express';


import FuncionarioController from '../../controllers/AdminController/FuncionarioController.js';

import authMiddlewareAdmin from '../../middlewares/authMiddlewareAdmin.js';

const router = express.Router();

router.get('/', authMiddlewareAdmin, FuncionarioController.listar);
router.get('/ativos', authMiddlewareAdmin, FuncionarioController.listarAtivos);
router.get('/viagens/:funCodigo', authMiddlewareAdmin, FuncionarioController.viagensDoFuncionario);
router.get('/listar-sem-moto', authMiddlewareAdmin,FuncionarioController.verificarFuncionariosSemMoto);
router.get('/viagens-em-andamento/:id', authMiddlewareAdmin, FuncionarioController.viagensEmAndamento);
router.get('/ganhos-diarios/:funCodigo', authMiddlewareAdmin, FuncionarioController.estimarGanhosDiarios);

router.post('/adicionar', authMiddlewareAdmin, FuncionarioController.adicionar);

router.put('/editar/:id', authMiddlewareAdmin, FuncionarioController.editar);

router.patch('/ativar-desativar/:id', authMiddlewareAdmin, FuncionarioController.ativarDesativar);

router.delete('/excluir/:id', authMiddlewareAdmin, FuncionarioController.excluir);
export default router;

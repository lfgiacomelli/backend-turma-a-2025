import express from 'express';
const router = express.Router();

import FuncionarioController from '../controllers/FuncionarioController.js';

router.post('/funcionario', FuncionarioController.createFuncionario);
router.patch('/funcionario/:id', FuncionarioController.updateFuncionario);
router.delete('/funcionario/:id', FuncionarioController.deleteFuncionario);
router.get('/funcionario/:id', FuncionarioController.getFuncionario);

export default router;
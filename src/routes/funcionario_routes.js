import express from 'express';
const router = express.Router();

import FuncionarioController from '../controllers/FuncionarioController.js';

router.post('/', FuncionarioController.createFuncionario); 
router.patch('/:id', FuncionarioController.updateFuncionario);
router.delete('/:id', FuncionarioController.deleteFuncionario);
router.get('/', FuncionarioController.getFuncionario);

export default router;

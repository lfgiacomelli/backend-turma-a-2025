import express from 'express';
const router = express.Router();

import FuncionarioController from '../controllers/FuncionarioController.js';
router.get('/:id', FuncionarioController.getFuncionarioById);

export default router;

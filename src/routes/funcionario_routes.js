import express from 'express';
import FuncionarioController from '../controllers/FuncionarioController.js';
import authMiddleware from '../middlewares/authMiddleware.js'

const router = express.Router();
router.get('/:id', authMiddleware, FuncionarioController.getFuncionarioById);

export default router;

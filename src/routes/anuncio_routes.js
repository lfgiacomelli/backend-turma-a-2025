import express from 'express';
const router = express.Router();
import authMiddleware from '../middlewares/authMiddleware.js';

import AnuncioController from '../controllers/AnuncioController.js';

router.get('/', authMiddleware, AnuncioController.listarTodos);

export default router;

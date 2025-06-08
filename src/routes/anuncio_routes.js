import express from 'express';
const router = express.Router();
import AnuncioController from '../controllers/AnuncioController.js';

router.get('/', AnuncioController.listarTodos);

export default router;

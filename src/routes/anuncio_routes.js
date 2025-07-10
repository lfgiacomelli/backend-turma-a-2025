import express from 'express';
import AnuncioController from '../controllers/AnuncioController.js';

const router = express.Router();

router.get('/', AnuncioController.listarTodos);

export default router;

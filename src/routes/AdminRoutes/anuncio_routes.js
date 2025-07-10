import express from 'express';
import AnuncioController from '../../controllers/AdminController/AnuncioController.js';
import authMiddleware from '../../middlewares/authMiddleware.js';

const router = express.Router();


router.get('/', authMiddleware, AnuncioController.listar);
router.post('/adicionar', authMiddleware, AnuncioController.adicionar);
router.put('/editar/:id', authMiddleware, AnuncioController.editar);
router.delete('/excluir/:id', authMiddleware, AnuncioController.excluir);

export default router;

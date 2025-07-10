import express from 'express';
import AnuncioController from '../../controllers/AdminController/AnuncioController.js';
import authMiddlewareAdmin from '../../middlewares/authMiddlewareAdmin.js';

const router = express.Router();


router.get('/', authMiddlewareAdmin, AnuncioController.listar);
router.post('/adicionar', authMiddlewareAdmin, AnuncioController.adicionar);
router.put('/editar/:id', authMiddlewareAdmin, AnuncioController.editar);
router.delete('/excluir/:id', authMiddlewareAdmin, AnuncioController.excluir);

export default router;

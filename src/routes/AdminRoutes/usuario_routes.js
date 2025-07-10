import express from 'express';
import UsuarioController from '../../controllers/AdminController/UsuarioController.js';
import authMiddleware from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, UsuarioController.listar);
router.put('/admin-editar', authMiddleware, UsuarioController.adminEditar);
router.put('/status/:id', authMiddleware, UsuarioController.alternarStatus);
router.delete('/excluir/:id', authMiddleware, UsuarioController.excluir);

export default router;

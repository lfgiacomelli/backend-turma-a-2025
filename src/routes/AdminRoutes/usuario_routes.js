import express from 'express';
import UsuarioController from '../../controllers/AdminController/UsuarioController.js';
import authMiddlewareAdmin from '../../middlewares/authMiddlewareAdmin.js';

const router = express.Router();

router.get('/', authMiddlewareAdmin, UsuarioController.listar);
router.put('/admin-editar', authMiddlewareAdmin, UsuarioController.adminEditar);
router.put('/status/:id', authMiddlewareAdmin, UsuarioController.alternarStatus);
router.delete('/excluir/:id', authMiddlewareAdmin, UsuarioController.excluir);

export default router;

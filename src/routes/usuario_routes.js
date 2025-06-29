import express from 'express';
const router = express.Router();
import authMiddleware from '../middlewares/authMiddleware.js';

import UsuarioController from '../controllers/UsuarioController.js';

router.get('/:id', authMiddleware, UsuarioController.getUsuarioById);
router.post('/', UsuarioController.createUsuario);
router.get('/', authMiddleware, UsuarioController.getAllUsuarios);
router.patch('/:id', authMiddleware, UsuarioController.updateUsuario);
router.delete('/:id', authMiddleware, UsuarioController.deleteUsuario);

router.get('/:id/banimento', authMiddleware, UsuarioController.verificarBanimento);

export default router;

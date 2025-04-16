import express from 'express';
const router = express.Router();

import UsuarioController from '../controllers/UsuarioController.js';

router.post('/', UsuarioController.createUsuario);
router.patch('/:id', UsuarioController.updateUsuario);
router.delete('/:id', UsuarioController.deleteUsuario); 

export default router;

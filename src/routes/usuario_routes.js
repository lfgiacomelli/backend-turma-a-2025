import express from 'express';
const router = express.Router();

import UsuarioController from '../controllers/UsuarioController.js';

router.post('/', UsuarioController.createUsuario);
router.patch('/:id', UsuarioController.updateUsuario);
router.delete('/:id', UsuarioController.deleteUsuario); 
router.get('/:id', UsuarioController.getUsuario);

export default router;

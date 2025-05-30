import express from 'express';
const router = express.Router();

import UsuarioController from '../controllers/UsuarioController.js';

router.get('/:id', UsuarioController.getUsuarioById);
router.post('/', UsuarioController.createUsuario);           
router.get('/', UsuarioController.getAllUsuarios);           
router.patch('/:id', UsuarioController.updateUsuario);   
router.delete('/:id', UsuarioController.deleteUsuario);  

export default router;

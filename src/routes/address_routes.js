import express from 'express';
import AddressController from '../controllers/AddressController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/:id', authMiddleware, AddressController.listar);
router.post('/adicionar', authMiddleware, AddressController.createAddress);
router.put('/editar/:id', authMiddleware, AddressController.editAddress);
router.delete('/excluir/:id', authMiddleware, AddressController.deleteAddress);

export default router;
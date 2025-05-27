import express from 'express';
import ViagemController from '../controllers/ViagemController.js';

const router = express.Router();

router.post('/', ViagemController.createViagem);
router.patch('/:id', ViagemController.updateViagem);
router.delete('/:id', ViagemController.deleteViagem);
router.get('/:id', ViagemController.getViagemPorUsuario);

export default router;

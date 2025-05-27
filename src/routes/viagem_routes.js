import express from 'express';
import ViagemController from '../controllers/ViagemController.js';

const router = express.Router();

router.get('/:id', ViagemController.getViagemPorUsuario);

export default router;

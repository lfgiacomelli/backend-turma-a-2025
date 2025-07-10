import express from 'express';
import MotocicletaController from '../../controllers/AdminController/MotocicletaController.js';
import authMiddleware from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, MotocicletaController.listar);
router.post('/adicionar', authMiddleware, MotocicletaController.adicionar);
router.put('/editar/:id', authMiddleware, MotocicletaController.editar);
router.delete('/excluir/:id', authMiddleware, MotocicletaController.excluir);

export default router;

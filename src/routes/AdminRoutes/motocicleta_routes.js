import express from 'express';
import MotocicletaController from '../../controllers/AdminController/MotocicletaController.js';
import authMiddlewareAdmin from '../../middlewares/authMiddlewareAdmin.js';

const router = express.Router();

router.get('/', authMiddlewareAdmin, MotocicletaController.listar);
router.get('/funcionario/:funCodigo', authMiddlewareAdmin, MotocicletaController.getMotorcycleById);

router.post('/adicionar', authMiddlewareAdmin, MotocicletaController.adicionar);

router.put('/editar/:id', authMiddlewareAdmin, MotocicletaController.editar);

router.delete('/excluir/:id', authMiddlewareAdmin, MotocicletaController.excluir);

export default router;

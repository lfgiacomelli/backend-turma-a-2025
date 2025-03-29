import {express} from 'express';
import UsuarioController from '../controllers/UsuarioController.js';

const router = express.Router();

router.post('/usuario', UsuarioController.createUsuario);
router.patch('/usuario/:id', UsuarioController.updateUsuario);
router.delete('/usuario/:id', UsuarioController.deleteUsuario);
router.get('/usuario/:id', UsuarioController.getUsuario);

export default router;
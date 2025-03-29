import {express} from 'express';

import ViagemController from '../controllers/ViagemController.js';

const router = express.Router();

router.post('/viagem', ViagemController.createViagem);
router.patch('/viagem/:id', ViagemController.updateViagem);
router.delete('/viagem/:id', ViagemController.deleteViagem);
router.get('/viagem/:id', ViagemController.getViagem);

export default router;
import {express} from 'express';

import AdminController from '../controllers/AdminController';

const router = express.Router();
router.post('/admin', AdminController.createAdmin);
router.patch('/admin/:id', AdminController.updateAdmin);
router.delete('/admin/:id', AdminController.deleteAdmin);
router.get('/admin/:id', AdminController.getAdmin);

export default router;
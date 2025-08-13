import express from 'express';
import PushNotifications from '../../controllers/AdminController/PushNotifications.js';

const router = express.Router();

router.get('/', PushNotifications.listar);
router.post('/enviar', PushNotifications.enviar);

export default router;

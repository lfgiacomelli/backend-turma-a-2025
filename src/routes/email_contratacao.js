import express from 'express';

import EmailController from '../controllers/EmailController.js';

const router = express.Router();

router.post('/contratacao', EmailController.enviarEmail);

export default router;
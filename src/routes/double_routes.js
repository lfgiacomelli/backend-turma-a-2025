import express from 'express';
const router = express.Router();

import DoubleController from '../controllers/DoubleController.js';

router.post('/double', DoubleController.createDouble);

export default router;
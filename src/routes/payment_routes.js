import express from 'express';
import PaymentController from '../controllers/PaymentController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/create-payment', authMiddleware, PaymentController.createPayment);
router.get('/status/:payment_id', authMiddleware, PaymentController.getPaymentStatus);
router.get('/get-payments/:usu_codigo', authMiddleware, PaymentController.getPaymentByUser);

export default router;

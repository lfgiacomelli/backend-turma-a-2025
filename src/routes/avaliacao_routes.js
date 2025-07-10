import express from 'express';
import AvaliacaoController from '../controllers/AvaliacaoController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, AvaliacaoController.createAvaliacao);

router.patch('/:id', authMiddleware, AvaliacaoController.updateAvaliacao);

router.delete('/:id', authMiddleware, AvaliacaoController.deleteAvaliacao);

router.get('/', AvaliacaoController.getAvaliacoes);

router.get('/usuario/:id', authMiddleware, AvaliacaoController.getAvaliacoesByUsuario);


export default router;

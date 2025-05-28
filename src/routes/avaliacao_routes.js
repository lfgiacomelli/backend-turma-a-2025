import express from 'express';
import AvaliacaoController from '../controllers/AvaliacaoController.js';

const router = express.Router();

router.post('/', AvaliacaoController.createAvaliacao);

router.patch('/:id', AvaliacaoController.updateAvaliacao);

router.delete('/:id', AvaliacaoController.deleteAvaliacao);

router.get('/', AvaliacaoController.getAllAvaliacoes);

router.get('/usuario/:id', AvaliacaoController.getAvaliacoesByUsuario);


export default router;

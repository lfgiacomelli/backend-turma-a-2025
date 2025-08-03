import express from 'express';
import multer from 'multer';
import path from 'path';
import FotoFuncionarioController from '../../controllers/AdminController/FotoFuncionarioController.js';
import authMiddlewareAdmin from '../../middlewares/authMiddlewareAdmin.js';

const router = express.Router();

const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        cb(null, `cnh_${timestamp}${ext}`);
    }
});

const upload = multer({ storage });

router.get('/listar-sem-foto', authMiddlewareAdmin, FotoFuncionarioController.listarSemFoto);
router.get('/exibir-fotos', authMiddlewareAdmin, FotoFuncionarioController.exibirFotos);
router.post('/upload-foto-cnh', upload.single('file'), authMiddlewareAdmin, FotoFuncionarioController.uploadFoto);

export default router;

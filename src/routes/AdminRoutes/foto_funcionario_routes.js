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

router.post('/upload-foto-cnh', upload.single('file'), authMiddlewareAdmin, FotoFuncionarioController.uploadFoto);
router.get('/listar-sem-foto', authMiddlewareAdmin, FotoFuncionarioController.listarSemFoto);

export default router;

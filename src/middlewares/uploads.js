import multer from 'multer';
import path from 'path';
import fs from 'fs';

const pastaUpload = path.resolve('uploads');
if (!fs.existsSync(pastaUpload)) {
  fs.mkdirSync(pastaUpload);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, pastaUpload);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const nomeArquivo = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, nomeArquivo);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!tiposPermitidos.includes(file.mimetype)) {
      return cb(new Error('Tipo de arquivo não suportado'), false);
    }
    cb(null, true);
  },
});

export default upload;

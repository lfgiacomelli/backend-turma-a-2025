import express from 'express';
import DownloadController from '../controllers/DownloadController.js';

const router = express.Router();

router.get('/app', DownloadController.downloadApp);

export default router;
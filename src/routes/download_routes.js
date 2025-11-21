import express from 'express';
import DownloadController from '../controllers/DownloadController';

const router = express.Router();

router.get('/app', DownloadController.downloadApp);

export default router;
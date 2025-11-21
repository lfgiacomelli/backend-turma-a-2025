import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DownloadController {
  downloadApp(req, res) {
    try {
      const filePath = path.resolve(__dirname, '../../uploads/zoomx.apk');
      console.log("Enviando arquivo:", filePath);
      return res.download(filePath, 'ZoomX.apk');
    } catch (error) {
      console.error(' Erro ao baixar APK:', error);
      return res.status(500).json({ erro: 'Erro ao baixar o arquivo' });
    }
  }
}

export default new DownloadController();

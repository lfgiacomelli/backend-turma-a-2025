const path = require('path');

class DownloadController {
  downloadApp(req, res) {
    try {
      const filePath = path.resolve(__dirname, '../../uploads/zoomx.apk');
      return res.download(filePath, 'ZoomX.apk');
    } catch (error) {
      console.error('Erro ao baixar APK:', error);
      return res.status(500).json({ erro: 'Erro ao baixar o arquivo' });
    }
  }
}

module.exports = new DownloadController();

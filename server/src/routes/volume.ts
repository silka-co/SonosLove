import { Router } from 'express';
import type { SonosService } from '../services/SonosService.js';

export function createVolumeRouter(sonosService: SonosService): Router {
  const router = Router();

  router.get('/:speakerId', async (req, res) => {
    try {
      const volume = await sonosService.getVolume(req.params.speakerId);
      res.json({ volume });
    } catch (err) {
      res.status(500).json({ message: 'Failed to get volume' });
    }
  });

  router.post('/:speakerId', async (req, res) => {
    try {
      const { volume } = req.body;
      if (volume === undefined || volume < 0 || volume > 100) {
        res.status(400).json({ message: 'volume (0-100) required' });
        return;
      }
      await sonosService.setVolume(req.params.speakerId, volume);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: 'Failed to set volume' });
    }
  });

  return router;
}

import { Router } from 'express';
import type { SonosService } from '../services/SonosService.js';

export function createPlaybackRouter(sonosService: SonosService): Router {
  const router = Router();

  router.post('/play', async (req, res) => {
    try {
      const { speakerId } = req.body;
      await sonosService.play(speakerId);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: 'Failed to play' });
    }
  });

  router.post('/pause', async (req, res) => {
    try {
      const { speakerId } = req.body;
      await sonosService.pause(speakerId);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: 'Failed to pause' });
    }
  });

  router.post('/next', async (req, res) => {
    try {
      const { speakerId } = req.body;
      await sonosService.next(speakerId);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: 'Failed to skip' });
    }
  });

  router.post('/prev', async (req, res) => {
    try {
      const { speakerId } = req.body;
      await sonosService.previous(speakerId);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: 'Failed to go back' });
    }
  });

  router.post('/seek', async (req, res) => {
    try {
      const { speakerId, positionSeconds } = req.body;
      if (!speakerId || positionSeconds === undefined) {
        res.status(400).json({ message: 'speakerId and positionSeconds required' });
        return;
      }
      await sonosService.seek(speakerId, positionSeconds);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: 'Failed to seek' });
    }
  });

  return router;
}

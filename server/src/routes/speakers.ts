import { Router } from 'express';
import type { SonosService } from '../services/SonosService.js';

export function createSpeakersRouter(sonosService: SonosService): Router {
  const router = Router();

  router.get('/', (_req, res) => {
    try {
      const speakers = sonosService.getSpeakers();
      res.json(speakers);
    } catch (err) {
      res.status(500).json({ message: 'Failed to get speakers' });
    }
  });

  router.post('/group', async (req, res) => {
    try {
      const { coordinator, members } = req.body;
      if (!coordinator || !Array.isArray(members)) {
        res.status(400).json({ message: 'coordinator and members[] required' });
        return;
      }
      await sonosService.groupSpeakers(coordinator, members);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: 'Failed to group speakers' });
    }
  });

  router.post('/add-to-group', async (req, res) => {
    try {
      const { coordinator, member } = req.body;
      if (!coordinator || !member) {
        res.status(400).json({ message: 'coordinator and member required' });
        return;
      }
      await sonosService.addToGroup(coordinator, member);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: 'Failed to add speaker to group' });
    }
  });

  router.post('/ungroup', async (req, res) => {
    try {
      const { speakerId } = req.body;
      if (!speakerId) {
        res.status(400).json({ message: 'speakerId required' });
        return;
      }
      await sonosService.ungroupSpeaker(speakerId);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: 'Failed to ungroup speaker' });
    }
  });

  return router;
}

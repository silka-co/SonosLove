import { Router } from 'express';
import type { SonosService } from '../services/SonosService.js';

export function createStatusRouter(sonosService: SonosService): Router {
  const router = Router();

  router.get('/', (_req, res) => {
    const speakers = sonosService.getSpeakers();
    res.json({
      sonos: speakers.length > 0,
      speakerCount: speakers.length,
      onlineCount: speakers.filter((s) => s.online).length,
    });
  });

  return router;
}

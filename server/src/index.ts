import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { config } from './config.js';
import { logger } from './utils/logger.js';
import { initDatabase } from './db/database.js';
import { SonosService } from './services/SonosService.js';
import { webSocketService } from './services/WebSocketService.js';
import { RouterMonitorService } from './services/RouterMonitorService.js';
import { createPlaybackRouter } from './routes/playback.js';
import { createVolumeRouter } from './routes/volume.js';
import { createSpeakersRouter } from './routes/speakers.js';
import { createMonitoringRouter } from './routes/monitoring.js';
import { createStatusRouter } from './routes/status.js';

async function main() {
  const app = express();
  const httpServer = createServer(app);

  // Middleware
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors({ origin: config.frontendUrl }));
  app.use(express.json());

  // Initialize database
  const db = initDatabase(config.dbPath);

  // Initialize Sonos
  const sonosService = SonosService.getInstance();
  try {
    await sonosService.initialize();
    logger.info(`Sonos initialized — found ${sonosService.getSpeakers().length} speakers`);
  } catch (err) {
    logger.warn('Sonos initialization failed — will retry on requests:', err);
  }

  // Initialize WebSocket
  webSocketService.initialize(httpServer);

  // Wire Sonos events to WebSocket
  sonosService.onStateChange((speakers) => {
    webSocketService.emitSpeakerState(speakers);
  });
  sonosService.onNowPlayingChange((nowPlaying) => {
    webSocketService.emitNowPlaying(nowPlaying);
  });

  // Start speaker state heartbeat (every 5s)
  setInterval(() => {
    const speakers = sonosService.getSpeakers();
    webSocketService.emitSpeakerState(speakers);
  }, 5000);

  // Initialize router monitoring (if credentials are configured)
  if (config.router.password) {
    const routerMonitor = new RouterMonitorService(db, config.sonosSpeakers);
    routerMonitor.onChange((data) => {
      webSocketService.emitDeviceOnline(data);
    });
    routerMonitor.start(60_000);
    logger.info('Router monitoring started');
  } else {
    logger.warn('Router monitoring disabled — no ROUTER_PASSWORD configured');
  }

  // Mount routes
  app.use('/api/playback', createPlaybackRouter(sonosService));
  app.use('/api/volume', createVolumeRouter(sonosService));
  app.use('/api/speakers', createSpeakersRouter(sonosService));
  app.use('/api/monitoring', createMonitoringRouter(db));
  app.use('/api/status', createStatusRouter(sonosService));

  // Start server
  httpServer.listen(config.port, () => {
    logger.info(`SonosLove server running on http://localhost:${config.port}`);
  });

  // Graceful shutdown
  const shutdown = () => {
    logger.info('Shutting down...');
    db.close();
    httpServer.close();
    process.exit(0);
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

main().catch((err) => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});

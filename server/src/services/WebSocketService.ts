import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import type { ServerToClientEvents, ClientToServerEvents } from '../types/socket-events.js';
import type { SpeakerState, NowPlayingState } from '../types/index.js';
import { logger } from '../utils/logger.js';

class WebSocketService {
  private static instance: WebSocketService;
  private io: Server<ClientToServerEvents, ServerToClientEvents> | null = null;

  private constructor() {}

  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  initialize(httpServer: HttpServer): void {
    this.io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
      },
    });

    this.io.on('connection', (socket) => {
      logger.info(`WebSocket client connected: ${socket.id}`);

      socket.on('subscribe:speaker', (data) => {
        logger.debug(`Client ${socket.id} subscribed to speaker ${data.speakerId}`);
      });

      socket.on('disconnect', () => {
        logger.info(`WebSocket client disconnected: ${socket.id}`);
      });
    });

    logger.info('WebSocket server initialized');
  }

  emitSpeakerState(speakers: SpeakerState[]): void {
    this.io?.emit('speaker:state', speakers);
  }

  emitNowPlaying(state: NowPlayingState): void {
    this.io?.emit('nowPlaying:update', state);
  }

  emitProgress(data: { positionSeconds: number; durationSeconds: number }): void {
    this.io?.emit('nowPlaying:progress', data);
  }

  emitDeviceOnline(data: { mac: string; ip: string; name: string; online: boolean }): void {
    this.io?.emit('device:online', data);
  }

  emitError(data: { message: string; code: string }): void {
    this.io?.emit('error', data);
  }

  getConnectedCount(): number {
    return this.io?.engine?.clientsCount ?? 0;
  }
}

export const webSocketService = WebSocketService.getInstance();

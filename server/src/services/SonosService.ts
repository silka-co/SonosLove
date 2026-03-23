import { SonosManager, SonosDevice } from '@svrooij/sonos';
import type { Track } from '@svrooij/sonos/lib/models';
import { EventEmitter } from 'events';
import type { SpeakerState, NowPlayingState } from '../types/index.js';
import { logger } from '../utils/logger.js';

type StateChangeCallback = (speakers: SpeakerState[]) => void;
type NowPlayingChangeCallback = (nowPlaying: NowPlayingState) => void;

export class SonosService {
  private static instance: SonosService;
  private manager: SonosManager;
  private emitter: EventEmitter;
  private initialized = false;
  private cachedSpeakers: SpeakerState[] = [];
  private pollInterval: ReturnType<typeof setInterval> | null = null;

  private constructor() {
    this.manager = new SonosManager();
    this.emitter = new EventEmitter();
  }

  static getInstance(): SonosService {
    if (!SonosService.instance) {
      SonosService.instance = new SonosService();
    }
    return SonosService.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      logger.info('Discovering Sonos speakers via UPnP...');
      await this.manager.InitializeWithDiscovery(10);
      logger.info(`Discovered ${this.manager.Devices.length} Sonos speaker(s)`);
    } catch (err) {
      logger.warn('UPnP discovery failed:', err);
    }

    this.initialized = true;
    await this.refreshSpeakerState();
    this.startPolling();
  }

  private startPolling(): void {
    this.pollInterval = setInterval(async () => {
      try {
        await this.refreshSpeakerState();
      } catch (err) {
        logger.debug('Polling error (non-fatal):', err);
      }
    }, 5000);
  }

  private async refreshSpeakerState(): Promise<void> {
    const speakers = await this.buildSpeakerStates();
    this.cachedSpeakers = speakers;
    this.emitter.emit('stateChange', speakers);

    // Check now-playing: find any speaker that's playing, then query its
    // group coordinator for metadata (AirPlay metadata lives on the coordinator)
    for (const s of speakers) {
      if (s.playbackState === 'playing') {
        // Find the group coordinator for this speaker
        const device = this.getDevice(s.id);
        const coordId = device?.Coordinator?.Uuid ?? s.id;
        const np = await this.getNowPlaying(coordId);
        // Tag the now-playing with the room the user sees, not the coordinator's id
        np.speakerId = s.id;
        this.emitter.emit('nowPlayingChange', np);
        break;
      }
    }
  }

  getSpeakers(): SpeakerState[] {
    return this.cachedSpeakers;
  }

  private getDevice(speakerId: string): SonosDevice | undefined {
    return this.manager.Devices.find((d) => d.Uuid === speakerId);
  }

  private getDeviceOrThrow(speakerId: string): SonosDevice {
    const device = this.getDevice(speakerId);
    if (!device) throw new Error(`Speaker not found: ${speakerId}`);
    return device;
  }

  private getDefaultDevice(speakerId?: string): SonosDevice {
    if (speakerId) return this.getDeviceOrThrow(speakerId);
    const coordinator = this.manager.Devices.find((d) => d.Coordinator?.Uuid === d.Uuid);
    if (coordinator) return coordinator;
    if (this.manager.Devices.length > 0) return this.manager.Devices[0];
    throw new Error('No Sonos speakers available');
  }

  private async buildSpeakerStates(): Promise<SpeakerState[]> {
    const speakers: SpeakerState[] = [];

    // Deduplicate stereo pairs: multiple devices with the same name are a
    // stereo pair — keep only one per unique name (prefer the coordinator).
    const seen = new Map<string, SonosDevice>();
    for (const device of this.manager.Devices) {
      const name = device.Name;
      const existing = seen.get(name);
      if (!existing) {
        seen.set(name, device);
      } else {
        // Prefer the coordinator
        const isCoord = device.Coordinator?.Uuid === device.Uuid;
        if (isCoord) seen.set(name, device);
      }
    }
    const visibleDevices = Array.from(seen.values());

    for (const device of visibleDevices) {
      try {
        const state = await this.buildOneSpeakerState(device);
        speakers.push(state);
      } catch (err) {
        logger.debug(`Failed to query speaker ${device.Name}: ${err}`);
        speakers.push({
          id: device.Uuid,
          name: device.Name,
          ip: device.Host,
          model: '',
          volume: 0,
          muted: false,
          isCoordinator: false,
          groupId: '',
          groupMembers: [],
          playbackState: 'stopped',
          online: false,
        });
      }
    }

    return speakers;
  }

  private async buildOneSpeakerState(device: SonosDevice): Promise<SpeakerState> {
    let volume = 0;
    let muted = false;
    let playbackState: SpeakerState['playbackState'] = 'stopped';

    try {
      const volResult = await device.RenderingControlService.GetVolume({ InstanceID: 0, Channel: 'Master' });
      volume = volResult.CurrentVolume ?? 0;
    } catch { /* unreachable speaker */ }

    try {
      const muteResult = await device.RenderingControlService.GetMute({ InstanceID: 0, Channel: 'Master' });
      muted = muteResult.CurrentMute ?? false;
    } catch { /* unreachable speaker */ }

    try {
      const transportInfo = await device.AVTransportService.GetTransportInfo({ InstanceID: 0 });
      const raw = transportInfo.CurrentTransportState ?? '';
      playbackState = parsePlaybackState(raw);
    } catch { /* unreachable speaker */ }

    const isCoordinator = device.Coordinator?.Uuid === device.Uuid;
    const groupId = device.GroupName ?? device.Uuid;
    const groupMembers = this.manager.Devices
      .filter((d) => d.GroupName === device.GroupName && d.Uuid !== device.Uuid)
      .map((d) => d.Uuid);

    return {
      id: device.Uuid,
      name: device.Name,
      ip: device.Host,
      model: '',
      volume,
      muted,
      isCoordinator,
      groupId,
      groupMembers,
      playbackState,
      online: true,
    };
  }

  async play(speakerId?: string): Promise<void> {
    const device = this.getDefaultDevice(speakerId);
    await device.AVTransportService.Play({ InstanceID: 0, Speed: '1' });
    logger.info(`Play: ${device.Name}`);
  }

  async pause(speakerId?: string): Promise<void> {
    const device = this.getDefaultDevice(speakerId);
    await device.AVTransportService.Pause({ InstanceID: 0 });
    logger.info(`Pause: ${device.Name}`);
  }

  async next(speakerId?: string): Promise<void> {
    const device = this.getDefaultDevice(speakerId);
    await device.AVTransportService.Next({ InstanceID: 0 });
    logger.info(`Next: ${device.Name}`);
  }

  async previous(speakerId?: string): Promise<void> {
    const device = this.getDefaultDevice(speakerId);
    await device.AVTransportService.Previous({ InstanceID: 0 });
    logger.info(`Previous: ${device.Name}`);
  }

  async seek(speakerId: string, positionSeconds: number): Promise<void> {
    const device = this.getDeviceOrThrow(speakerId);
    const h = Math.floor(positionSeconds / 3600);
    const m = Math.floor((positionSeconds % 3600) / 60);
    const s = Math.floor(positionSeconds % 60);
    const target = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    await device.AVTransportService.Seek({ InstanceID: 0, Unit: 'REL_TIME', Target: target });
    logger.info(`Seek: ${device.Name} to ${target}`);
  }

  async setVolume(speakerId: string, volume: number): Promise<void> {
    const device = this.getDeviceOrThrow(speakerId);
    const clamped = Math.max(0, Math.min(100, Math.round(volume)));
    await device.RenderingControlService.SetVolume({ InstanceID: 0, Channel: 'Master', DesiredVolume: clamped });
    logger.info(`SetVolume: ${device.Name} to ${clamped}`);
  }

  async getVolume(speakerId: string): Promise<number> {
    const device = this.getDeviceOrThrow(speakerId);
    const result = await device.RenderingControlService.GetVolume({ InstanceID: 0, Channel: 'Master' });
    return result.CurrentVolume ?? 0;
  }

  async groupSpeakers(coordinatorId: string, memberIds: string[]): Promise<void> {
    const coordinator = this.getDeviceOrThrow(coordinatorId);
    for (const memberId of memberIds) {
      const member = this.getDeviceOrThrow(memberId);
      await member.AVTransportService.SetAVTransportURI({
        InstanceID: 0,
        CurrentURI: `x-rincon:${coordinator.Uuid}`,
        CurrentURIMetaData: '',
      });
      logger.info(`Grouped: ${member.Name} -> ${coordinator.Name}`);
    }
  }

  async addToGroup(coordinatorId: string, newMemberId: string): Promise<void> {
    const coordinator = this.getDeviceOrThrow(coordinatorId);
    const member = this.getDeviceOrThrow(newMemberId);
    await member.AVTransportService.SetAVTransportURI({
      InstanceID: 0,
      CurrentURI: `x-rincon:${coordinator.Uuid}`,
      CurrentURIMetaData: '',
    });
    logger.info(`Added to group: ${member.Name} -> ${coordinator.Name}`);
  }

  async ungroupSpeaker(speakerId: string): Promise<void> {
    const device = this.getDeviceOrThrow(speakerId);
    try {
      await device.AVTransportService.BecomeCoordinatorOfStandaloneGroup({ InstanceID: 0 });
      logger.info(`Ungrouped: ${device.Name}`);
    } catch (err) {
      // Speaker might already be standalone — that's fine
      logger.debug(`Ungroup (already standalone?): ${device.Name}: ${err}`);
    }
  }

  async getNowPlaying(speakerId: string): Promise<NowPlayingState> {
    const device = this.getDeviceOrThrow(speakerId);
    try {
      const positionInfo = await device.AVTransportService.GetPositionInfo({ InstanceID: 0 });
      const transportInfo = await device.AVTransportService.GetTransportInfo({ InstanceID: 0 });
      const isPlaying = transportInfo.CurrentTransportState === 'PLAYING';

      // TrackMetaData can be a parsed Track object or a raw DIDL-Lite XML string
      const meta = positionInfo.TrackMetaData;
      let trackTitle = '';
      let artist = '';
      let album = '';
      let albumArtUrl = '';

      if (meta && typeof meta === 'object') {
        // Library successfully parsed the DIDL-Lite metadata
        const track = meta as Track;
        trackTitle = track.Title ?? '';
        artist = track.Artist ?? '';
        album = track.Album ?? '';
        albumArtUrl = track.AlbumArtUri ?? '';
      } else if (typeof meta === 'string' && meta.length > 0) {
        // Raw DIDL-Lite XML — extract fields with regex
        trackTitle = extractXmlTag(meta, 'dc:title') ?? '';
        artist = extractXmlTag(meta, 'dc:creator') ?? '';
        album = extractXmlTag(meta, 'upnp:album') ?? '';
        albumArtUrl = extractXmlTag(meta, 'upnp:albumArtURI') ?? '';
      }

      // Don't show raw x-rincon URIs as track titles
      if (trackTitle.startsWith('x-rincon:') || trackTitle.startsWith('x-sonos:')) {
        trackTitle = '';
      }

      // Make album art URLs absolute if they're relative
      if (albumArtUrl && !albumArtUrl.startsWith('http')) {
        albumArtUrl = `http://${device.Host}:1400${albumArtUrl}`;
      }

      return {
        speakerId: device.Uuid,
        trackTitle,
        artist,
        album,
        albumArtUrl,
        durationSeconds: parseDuration(positionInfo.TrackDuration ?? '0:00:00'),
        positionSeconds: parseDuration(positionInfo.RelTime ?? '0:00:00'),
        isPlaying,
      };
    } catch (err) {
      logger.error(`Failed to get now playing for ${device.Name}:`, err);
      return {
        speakerId: device.Uuid,
        trackTitle: '',
        artist: '',
        album: '',
        albumArtUrl: '',
        durationSeconds: 0,
        positionSeconds: 0,
        isPlaying: false,
      };
    }
  }

  onStateChange(callback: StateChangeCallback): void {
    this.emitter.on('stateChange', callback);
  }

  onNowPlayingChange(callback: NowPlayingChangeCallback): void {
    this.emitter.on('nowPlayingChange', callback);
  }
}

function parsePlaybackState(raw: string): SpeakerState['playbackState'] {
  const n = raw.toUpperCase();
  if (n === 'PLAYING') return 'playing';
  if (n === 'PAUSED_PLAYBACK' || n === 'PAUSED') return 'paused';
  if (n === 'TRANSITIONING') return 'transitioning';
  return 'stopped';
}

function parseDuration(duration: string): number {
  const parts = duration.split(':').map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] || 0;
}

function extractXmlTag(xml: string, tag: string): string | undefined {
  const regex = new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, 'i');
  const match = xml.match(regex);
  return match?.[1] || undefined;
}

const BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(body.message || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Speakers
  getSpeakers: () => request<import('../types').SpeakerState[]>('/speakers'),
  groupSpeakers: (coordinator: string, members: string[]) =>
    request('/speakers/group', { method: 'POST', body: JSON.stringify({ coordinator, members }) }),
  ungroupSpeaker: (speakerId: string) =>
    request('/speakers/ungroup', { method: 'POST', body: JSON.stringify({ speakerId }) }),

  // Playback
  play: (speakerId?: string) =>
    request('/playback/play', { method: 'POST', body: JSON.stringify({ speakerId }) }),
  pause: (speakerId?: string) =>
    request('/playback/pause', { method: 'POST', body: JSON.stringify({ speakerId }) }),
  next: (speakerId?: string) =>
    request('/playback/next', { method: 'POST', body: JSON.stringify({ speakerId }) }),
  prev: (speakerId?: string) =>
    request('/playback/prev', { method: 'POST', body: JSON.stringify({ speakerId }) }),
  seek: (speakerId: string, positionSeconds: number) =>
    request('/playback/seek', { method: 'POST', body: JSON.stringify({ speakerId, positionSeconds }) }),

  // Volume
  getVolume: (speakerId: string) =>
    request<{ volume: number }>(`/volume/${speakerId}`),
  setVolume: (speakerId: string, volume: number) =>
    request(`/volume/${speakerId}`, { method: 'POST', body: JSON.stringify({ volume }) }),

  // Monitoring
  getMonitoringLogs: (hours = 24) =>
    request<import('../types').DeviceRecord[]>(`/monitoring/logs?hours=${hours}`),
  getMonitoringStatus: () =>
    request<Record<string, { online: boolean; lastSeen: string }>>('/monitoring/status'),

  // Health
  getStatus: () => request<{ sonos: boolean; router: boolean; speakerCount: number }>('/status'),
};

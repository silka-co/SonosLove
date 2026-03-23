# SonosLove

A local web app that talks directly to your Sonos speakers via UPnP, bypassing the Sonos app and its cloud infrastructure. Built because the Sonos app keeps losing track of speakers that are clearly on the network.

## What it does

- **Discovers speakers directly** via UPnP on your local network — finds speakers even when the Sonos app says "Not Connected"
- **Playback control** — play, pause, skip, volume from any browser on your home network
- **Now Playing** — shows album art, track title, artist, album, and progress bar for whatever's streaming (Apple Music, Spotify, etc.)
- **Speaker selection** — tap rooms to add/remove them from the playing group, Apple Music style
- **Real-time updates** — WebSocket-powered, updates across all devices instantly
- **Stereo pair support** — stereo pairs show as a single room, controls both speakers
- **Home theater groups** — Beam + Sub groups work as one unit
- **Network monitoring** — tracks which speakers are online/offline over time via router SSH

## Requirements

- **Node.js** 18+ (recommended: 20+)
- **Sonos speakers** on the same Wi-Fi network as the machine running SonosLove
- A computer on your home network to run the server (Mac, PC, Raspberry Pi, etc.)

## Installation

### 1. Clone the repo

```bash
git clone https://github.com/silka-co/SonosLove.git
cd SonosLove
```

### 2. Install dependencies

```bash
npm install
```

This installs both client and server dependencies via npm workspaces.

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your details:

```env
# Router SSH credentials (for network monitoring — optional)
ROUTER_HOST=192.168.1.1
ROUTER_USER=admin
ROUTER_PASSWORD=your_router_password
ROUTER_SSH_PORT=22

# Server
PORT=3001
FRONTEND_URL=http://localhost:5173

# SQLite (for monitoring logs)
DB_PATH=./data/sonoslove.db

# Known Sonos speaker MACs for monitoring (name:MAC pairs, comma-separated)
# Find MACs in your router's client list or on the speaker labels
SONOS_SPEAKERS=Kitchen:AA:BB:CC:DD:EE:01,Living Room:AA:BB:CC:DD:EE:02,Bedroom:AA:BB:CC:DD:EE:03
```

#### Finding your speaker MAC addresses

- **From your router**: Log into your router's admin page and look at the client list. Sonos speakers show up as "SonosZP"
- **From the Sonos app**: Settings > System > tap a speaker > About
- **On the speaker**: Printed on a label on the bottom/back of each speaker

#### Stereo pairs

For stereo pairs, list both speakers. SonosLove automatically detects pairs and shows them as a single room:

```env
SONOS_SPEAKERS=Kitchen Left:AA:BB:CC:DD:EE:01,Kitchen Right:AA:BB:CC:DD:EE:02
```

### 4. Start the app

```bash
npm run dev
```

This starts both the backend (Express on port 3001) and frontend (Vite on port 5173).

### 5. Open in browser

Navigate to `http://localhost:5173` on any device on your home network.

To access from your phone/tablet, use your computer's local IP instead of localhost:

```
http://192.168.1.xxx:5173
```

Find your computer's IP with `ifconfig` (Mac/Linux) or `ipconfig` (Windows).

## Usage

### How it works with Apple Music / Spotify

1. Start playing music from Apple Music or Spotify on any Sonos speaker (via AirPlay or Spotify Connect)
2. Open SonosLove in your browser
3. You'll see the currently playing track with album art and controls
4. Use the speaker list to add/remove rooms — tap a room to include it, tap again to remove it
5. Control playback (play/pause/skip/volume) directly from SonosLove

### Speaker selection

The speaker list works like Apple Music's AirPlay picker:
- Tap a room to add it to the playing group
- Tap again to remove it
- Behind the scenes, SonosLove groups/ungroups speakers via Sonos UPnP — you never see "grouping" UI

**Important**: SonosLove and Apple Music are two separate control systems. Changes made in SonosLove (like adding a room) won't be reflected in Apple Music's AirPlay picker, and vice versa. Pick one controller at a time for the best experience.

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite |
| Backend | Node.js, Express, TypeScript |
| Sonos control | `@svrooij/sonos` (local UPnP/SOAP) |
| Real-time | socket.io (WebSocket) |
| Monitoring DB | SQLite via `better-sqlite3` |
| Router monitoring | SSH via `ssh2` |
| Styling | CSS Modules, dark theme |

## Project structure

```
SonosLove/
  client/                  # React frontend
    src/
      pages/
        NowPlayingPage.tsx  # Main view — album art, controls, speaker list
      components/
        nowplaying/         # Album art, track info, transport controls, volume
        speakers/           # SpeakerRow, OnlineIndicator
        layout/             # AppShell
      hooks/                # useSocket, useNowPlaying, useSpeakers
      services/             # API client, socket.io client
  server/                  # Express backend
    src/
      routes/              # REST API endpoints
      services/
        SonosService.ts     # Core — UPnP speaker discovery and control
        WebSocketService.ts # Real-time event broadcasting
        RouterMonitorService.ts # SSH-based network monitoring
      db/                  # SQLite for monitoring logs
```

## Troubleshooting

### Speakers not showing up

- Make sure your Sonos speakers are on the **same Wi-Fi network** as the machine running SonosLove
- Speakers connected via SonosNet (through a wired speaker) should still be discoverable via UPnP
- If a speaker recently lost connection, it may need a power cycle to rejoin the network
- The initial Sonos app setup (connecting speakers to Wi-Fi) must be done through the official Sonos app — SonosLove cannot configure Wi-Fi credentials

### "Not Connected" in Sonos app but SonosLove sees them

This is exactly the problem SonosLove solves. The Sonos app uses cloud-assisted discovery which can fail. SonosLove uses direct UPnP discovery on your local network, which is more reliable.

### Can't access from phone

Make sure your phone is on the same Wi-Fi network and use your computer's local IP address instead of `localhost`.

## Roadmap

- [ ] Built-in music player (browse and play music directly, no AirPlay needed)
- [ ] Docker container for easy deployment on Raspberry Pi / NAS
- [ ] Remote access via Tailscale/VPN
- [ ] PWA support (Add to Home Screen)

## License

MIT

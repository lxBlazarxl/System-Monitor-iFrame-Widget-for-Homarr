# Homarr Widgets

This project is basically made to display custom system monitoring widgets as iframes inside the Homarr dashboard. It comes with displays for all your essential system stats, like CPU, RAM, CPU Temperature, SSD, HDD, Network, etc. It also includes a bonus Last.fm API which will show what you're playing currently on Spotify.

## Features
- **System Monitoring Widgets:** CPU, Memory, Disk (SSD/HDD), Network, Uptime, Temperature.
- **Media Integration:** Last.fm "Now Playing" integration, which pulls scrobbles from your Spotify account (requires Last.fm account and API key).
- **Web Dashboard:** Express server serving interactive widgets designed to be embedded in Homarr.

## Installation and Setup

1. Clone the Repository:
   ```bash
   git clone https://github.com/lxBlazarxl/System-Monitor-iFrame-Widget-for-Homarr.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env` and fill in your credentials.
   ```bash
   cp .env.example .env
   ```

4. Install as `systemd` service:

- **Install Service:** Creates and enables the systemd service.
  ```bash
  sudo ./iframeinstall
  ```

- **Start Service:** Starts the background service.
  ```bash
  sudo ./iframestart
  ```

- **Stop Service:** Stops the running service.
  ```bash
  sudo ./iframestop
  ```

- **Uninstall Service:** Stops, disables, and removes the service file.
  ```bash
  sudo ./iframedelete
  ```

## Available Widgets & API Endpoints

Go the URL `http://YOUR_SERVER_IP:3000/`, with any of the following endpoints:

### System Monitoring
| Widget | HTML Path | API Path | Description |
| :--- | :--- | :--- | :--- |
| **CPU** | `/cpu` | `/api/cpu` | Real-time CPU usage percentage. |
| **Memory** | `/memory` | `/api/memory` | RAM usage (Total, Used, Free). |
| **SSD** | `/ssd` | `/api/ssd` | Primary SSD storage usage. |
| **HDD** | `/hdd` | `/api/hdd` | Secondary HDD storage usage. |
| **Temperature**| `/temp` | `/api/temp` | CPU Package and Core temperatures. |
| **Network** | `/network` | `/api/network` | Real-time RX/TX speeds and totals. |
| **Uptime** | `/uptime` | `/api/uptime` | System uptime duration. |

### Integrations & Visuals
| Widget | HTML Path | API Path | Description |
| :--- | :--- | :--- | :--- |
| **Spotify** | `/spotify` | `/api/spotify/now-playing` | "Now Playing" via Last.fm API. |
| **Top Albums** | - | `/api/spotify/top-albums` | Top 10 albums from the last 7 days. |
| **Blackhole** | `/blackhole` | - | Animated 3D Three.js Galaxy/Blackhole for fun. |
| **Time/Greet** | `/time` | `/api/time` | Digital clock and context-aware greeting. |
| **Combined** | `/uptime-network`| `/api/uptime-network`| Uptime and Network stats in one view. |

## Development

To run the server manually for testing:
```bash
npm start
```

## License
MIT

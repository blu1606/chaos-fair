# deKAOS Node UI

**Self-hostable HUD for deKAOS Node Operators**

A standalone React web interface for monitoring and controlling deKAOS entropy nodes. This UI connects to the local `dekaos-node` daemon to display real-time audio spectrum analysis, entropy metrics, epoch status, and rewards.

![Node UI Screenshot](docs/node-ui-screenshot.png)

## Features

- 🎵 **Real-time Spectrum Analyzer** - 64-band audio visualization with entropy scoring
- 📊 **Entropy Metrics** - Spectral entropy, ZCR, RMS level monitoring
- ⏱️ **Epoch Countdown** - Track submission deadlines and commit status
- 💰 **Rewards Tracking** - View earned/pending KAOS and SOL rewards
- 🎛️ **Control Deck** - Initialize, capture, pause, submit controls
- 📝 **Terminal Logs** - Real-time daemon logs with export functionality
- 🌐 **WebSocket Support** - Real-time audio levels (fallback to polling)
- 🐳 **Docker Ready** - Multi-stage build with NGINX

## Quick Start

### Option 1: Docker (Recommended)

```bash
# Pull the latest image
docker pull ghcr.io/dekaos/node-ui:latest

# Run with local daemon
docker run -d \
  -p 3000:3000 \
  -e VITE_NODE_API_URL=http://host.docker.internal:3001/api \
  ghcr.io/dekaos/node-ui:latest

# Access UI
open http://localhost:3000
```

### Option 2: Docker Compose (Full Stack)

```bash
# Clone the repo
git clone https://github.com/dekaos/node-ui.git
cd node-ui

# Start UI + Daemon
docker-compose up -d

# View logs
docker-compose logs -f
```

### Option 3: Local Development

```bash
# Clone and install
git clone https://github.com/dekaos/node-ui.git
cd node-ui
npm install

# Configure environment
cp .env.example .env
# Edit .env with your daemon URL

# Start development server
npm run dev

# Build for production
npm run build
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_NODE_API_URL` | `http://localhost:3001/api` | Daemon API endpoint |
| `VITE_SUPABASE_URL` | - | Supabase URL (optional) |
| `VITE_SUPABASE_ANON_KEY` | - | Supabase key (optional) |
| `VITE_SOLANA_RPC_URL` | `https://api.mainnet-beta.solana.com` | Solana RPC |
| `VITE_SOLANA_NETWORK` | `mainnet-beta` | Network name |
| `VITE_ENABLE_MOCK_FALLBACK` | `true` | Mock data when daemon unavailable |
| `VITE_ENABLE_WEBSOCKET` | `true` | Use WebSocket for real-time data |

### Daemon API Endpoints

The UI expects the daemon to expose these endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/status` | GET | Node status (capturing, epoch, etc.) |
| `/api/devices` | GET | List audio devices |
| `/api/levels` | GET | Current audio levels |
| `/api/epoch` | GET | Epoch information |
| `/api/rewards` | GET | Rewards info |
| `/api/initialize` | POST | Initialize node |
| `/api/capture` | POST | Start audio capture |
| `/api/stop` | POST | Stop capture |
| `/api/pause` | POST | Pause capture |
| `/api/resume` | POST | Resume capture |
| `/api/submit` | POST | Submit commit |
| `/api/claim` | POST | Claim rewards |
| `/api/logs` | GET | Fetch logs |
| `/ws/levels` | WS | Real-time audio levels |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Node Operator Machine                    │
│                                                              │
│  ┌──────────────────┐      ┌─────────────────────────────┐  │
│  │   Node UI        │      │   dekaos-node Daemon        │  │
│  │   (Port 3000)    │◄────►│   (Port 3001)               │  │
│  │                  │ HTTP │                             │  │
│  │  - Spectrum      │  +   │  - Audio Capture            │  │
│  │  - Metrics       │  WS  │  - Entropy Calculation      │  │
│  │  - Controls      │      │  - Solana Submission        │  │
│  │  - Logs          │      │  - Wallet Management        │  │
│  └──────────────────┘      └─────────────────────────────┘  │
│          │                              │                    │
│          │                              │                    │
│          ▼                              ▼                    │
│  ┌──────────────┐            ┌─────────────────────┐        │
│  │  Browser     │            │  Microphone         │        │
│  │  localhost   │            │  Audio Input        │        │
│  └──────────────┘            └─────────────────────┘        │
│                                         │                    │
└─────────────────────────────────────────┼────────────────────┘
                                          │
                                          ▼
                              ┌─────────────────────┐
                              │  Solana Network     │
                              │  (Mainnet/Devnet)   │
                              └─────────────────────┘
```

## Deployment Options

### 1. Local Development
```bash
# Run daemon
cd ../crates/dekaos-node && cargo run

# Run UI (separate terminal)
npm run dev
```

### 2. Docker Single Container
```bash
docker run -d \
  --name dekaos-ui \
  -p 3000:3000 \
  -e VITE_NODE_API_URL=http://your-daemon:3001/api \
  ghcr.io/dekaos/node-ui:latest
```

### 3. Docker Full Stack
```bash
docker-compose up -d
```

### 4. Cloud Deployment (Render/Fly.io)

```yaml
# fly.toml
app = "dekaos-node-ui"

[build]
  dockerfile = "Dockerfile"

[build.args]
  VITE_NODE_API_URL = "https://your-daemon.fly.dev/api"

[[services]]
  internal_port = 3000
  protocol = "tcp"

  [[services.ports]]
    handlers = ["http"]
    port = 80

  [[services.ports]]
    handlers = ["tls", "http"]
    port = 443
```

### 5. Reverse Proxy (NGINX/Traefik)

```nginx
# nginx.conf - Example for custom domain
server {
    listen 443 ssl;
    server_name node.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## Design System

The UI uses the deKAOS design system:

- **Background**: `#020617` (Slate-950)
- **Primary**: `#8b5cf6` (Violet)
- **Secondary**: `#06b6d4` (Cyan)
- **Accent**: `#f59e0b` (Amber)
- **Matrix**: `#22d3ee` (Cyan for data)

Fonts:
- **Headers**: Space Grotesk
- **Body**: DM Sans
- **Code/Logs**: Fira Code

## Development

### Project Structure

```
node-ui/
├── src/
│   ├── components/node/    # Node-specific components
│   ├── config/node.ts      # Configuration
│   ├── hooks/              # Custom hooks
│   ├── services/nodeApi.ts # Daemon API service
│   ├── types/node.ts       # TypeScript types
│   └── pages/NodeUI.tsx    # Main page
├── node-ui/
│   ├── Dockerfile          # Production build
│   ├── docker-compose.yml  # Full stack
│   ├── nginx.conf          # NGINX config
│   └── .env.example        # Environment template
└── docs/
    └── operator-guide.md   # Operator documentation
```

### Building

```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Docker build
docker build -f node-ui/Dockerfile -t dekaos-node-ui .
```

### Testing

```bash
# Run tests
npm run test

# Type checking
npm run typecheck

# Lint
npm run lint
```

## Troubleshooting

### UI shows "Daemon Disconnected"

1. Check daemon is running: `curl http://localhost:3001/api/health`
2. Verify `VITE_NODE_API_URL` is correct
3. Check CORS settings on daemon

### WebSocket not connecting

1. Enable WebSocket in `.env`: `VITE_ENABLE_WEBSOCKET=true`
2. Check firewall allows WS connections
3. Verify daemon supports `/ws/levels` endpoint

### Docker: Cannot access audio device

```bash
# Linux: Add user to audio group
sudo usermod -aG audio $USER

# Docker: Mount audio device
docker run --device /dev/snd ...
```

## Migration from Monorepo

If migrating from the Turborepo monorepo structure:

1. Copy `app/node-ui` to new repo
2. Remove Turborepo config (`turbo.json`, workspace refs)
3. Update imports to use local paths (not `@dekaos/*`)
4. Add standalone `package.json` (no workspace dependencies)
5. Configure `.env` with daemon URL

See [Migration Guide](docs/migration-guide.md) for detailed steps.

## License

MIT © deKAOS Labs

## Links

- [deKAOS Website](https://dekaos.network)
- [Operator Guide](docs/operator-guide.md)
- [Daemon Repository](https://github.com/dekaos/dekaos-node)
- [Discord](https://discord.gg/dekaos)

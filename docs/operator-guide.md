# deKAOS Node Operator Guide

Complete guide for self-hosting the deKAOS Node UI and running an entropy node.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Running the Node](#running-the-node)
5. [Self-Hosting the UI](#self-hosting-the-ui)
6. [Monitoring](#monitoring)
7. [Troubleshooting](#troubleshooting)
8. [Security](#security)

---

## Prerequisites

### Hardware Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| CPU | 2 cores | 4+ cores |
| RAM | 2 GB | 4+ GB |
| Storage | 10 GB | 20+ GB SSD |
| Audio Input | Any microphone | USB condenser mic |
| Network | 10 Mbps | 50+ Mbps |

### Software Requirements

- **Operating System**: Linux (Ubuntu 22.04+), macOS, or Windows 10+ with WSL2
- **Docker** (recommended): Docker Engine 20.10+ and Docker Compose 2.0+
- **Or Node.js**: v18+ for running UI from source
- **Rust** (optional): For building daemon from source

### Wallet Requirements

- Solana wallet with SOL for staking (minimum 100 SOL recommended)
- Wallet keypair file (`wallet.json`)

---

## Installation

### Option 1: Docker (Recommended)

```bash
# Create data directory
mkdir -p ~/dekaos-node/data

# Download docker-compose
curl -O https://raw.githubusercontent.com/dekaos/node-ui/main/node-ui/docker-compose.yml

# Configure environment
cat > .env << EOF
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_NETWORK=mainnet-beta
NODE_API_URL=http://localhost:3001/api
EOF

# Start the stack
docker-compose up -d
```

### Option 2: Manual Installation

```bash
# 1. Install the daemon
cargo install dekaos-node
# Or download pre-built binary from releases

# 2. Clone the UI
git clone https://github.com/dekaos/node-ui.git
cd node-ui

# 3. Install dependencies
npm install

# 4. Configure
cp .env.example .env
nano .env

# 5. Build
npm run build
```

### Option 3: Pre-built Binary + UI

```bash
# Download daemon
wget https://github.com/dekaos/dekaos-node/releases/latest/download/dekaos-node-linux-amd64
chmod +x dekaos-node-linux-amd64

# Download UI
wget https://github.com/dekaos/node-ui/releases/latest/download/node-ui-dist.tar.gz
tar -xzf node-ui-dist.tar.gz

# Serve UI with any static file server
npx serve -l 3000 dist/
```

---

## Configuration

### Daemon Configuration

Create `~/.dekaos/config.toml`:

```toml
[node]
# Your Solana wallet keypair path
wallet_path = "/path/to/wallet.json"

# Stake amount in SOL
stake_amount = 100.0

# Log level: debug, info, warn, error
log_level = "info"

[api]
# API server settings
host = "127.0.0.1"  # Use 0.0.0.0 for remote access
port = 3001

# CORS allowed origins (comma-separated)
cors_origins = "http://localhost:3000"

[audio]
# Audio device (leave empty for default)
device_name = ""

# Sample rate (44100 or 48000)
sample_rate = 44100

# Buffer size
buffer_size = 1024

[solana]
# RPC endpoint
rpc_url = "https://api.mainnet-beta.solana.com"

# Network: mainnet-beta, testnet, devnet
network = "mainnet-beta"

# Commitment level
commitment = "confirmed"

[entropy]
# Minimum entropy score to submit (0.0 - 1.0)
min_entropy_threshold = 0.7

# Auto-submit when threshold reached
auto_submit = true
```

### UI Configuration

Create `.env` in the UI directory:

```bash
# Required: Daemon API URL
VITE_NODE_API_URL=http://localhost:3001/api

# Optional: Supabase for on-chain queries
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# Optional: Custom Solana RPC
VITE_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# Features
VITE_ENABLE_MOCK_FALLBACK=true
VITE_ENABLE_WEBSOCKET=true
```

---

## Running the Node

### Starting the Daemon

```bash
# Using installed binary
dekaos-node start

# Or with Docker
docker run -d \
  --name dekaos-daemon \
  -p 3001:3001 \
  -v ~/.dekaos:/data \
  --device /dev/snd \
  ghcr.io/dekaos/dekaos-node:latest

# Check status
curl http://localhost:3001/api/health
```

### Starting the UI

```bash
# Development
npm run dev

# Production (with static server)
npm run build
npx serve -l 3000 dist/

# Or with Docker
docker run -d \
  --name dekaos-ui \
  -p 3000:3000 \
  -e VITE_NODE_API_URL=http://host.docker.internal:3001/api \
  ghcr.io/dekaos/node-ui:latest
```

### Verifying Operation

1. Open http://localhost:3000 in your browser
2. Check the Node Identity box shows your node ID
3. Verify the connection indicator shows "LIVE"
4. Start audio capture using the Control Deck
5. Monitor entropy metrics in real-time

---

## Self-Hosting the UI

### Behind a Reverse Proxy

#### NGINX

```nginx
server {
    listen 443 ssl http2;
    server_name node.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    # UI
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    # Optional: Proxy daemon API too
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### Traefik

```yaml
# traefik.yml
http:
  routers:
    node-ui:
      rule: "Host(`node.yourdomain.com`)"
      service: node-ui
      tls:
        certResolver: letsencrypt

  services:
    node-ui:
      loadBalancer:
        servers:
          - url: "http://localhost:3000"
```

### Cloud Deployment

#### Fly.io

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Create app
fly launch --name dekaos-node-ui

# Set secrets
fly secrets set VITE_NODE_API_URL=https://your-daemon.fly.dev/api

# Deploy
fly deploy
```

#### Render

1. Create new "Static Site" on Render
2. Connect your repository
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Add environment variables

---

## Monitoring

### Health Checks

```bash
# Daemon health
curl http://localhost:3001/api/health

# UI health
curl http://localhost:3000/health
```

### Prometheus Metrics (if enabled)

```bash
# Daemon metrics
curl http://localhost:3001/metrics
```

### Log Management

```bash
# View daemon logs
docker logs -f dekaos-daemon

# Export UI logs
# Use the "Export" button in the Terminal Logs section
```

---

## Troubleshooting

### Common Issues

#### "Daemon Disconnected"

1. Check daemon is running:
   ```bash
   curl http://localhost:3001/api/health
   ```

2. Verify port is accessible:
   ```bash
   netstat -tlnp | grep 3001
   ```

3. Check firewall rules:
   ```bash
   sudo ufw status
   sudo ufw allow 3001
   ```

#### Audio Not Capturing

1. List audio devices:
   ```bash
   arecord -l  # Linux
   # Or check daemon logs
   ```

2. Verify microphone permissions:
   ```bash
   # Linux: Add user to audio group
   sudo usermod -aG audio $USER
   ```

3. Test audio input:
   ```bash
   arecord -d 5 -f cd test.wav
   aplay test.wav
   ```

#### Low Entropy Score

1. Check microphone is capturing ambient noise (not silence)
2. Increase microphone sensitivity
3. Ensure microphone is not muted
4. Try different microphone or location

#### Transaction Failures

1. Check SOL balance:
   ```bash
   solana balance
   ```

2. Verify RPC endpoint is responsive:
   ```bash
   curl https://api.mainnet-beta.solana.com -X POST \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}'
   ```

---

## Security

### Network Security

1. **Firewall**: Only expose necessary ports
   ```bash
   # Allow only UI port publicly, keep daemon local
   ufw allow 3000
   ufw deny 3001  # Daemon API should be internal
   ```

2. **TLS**: Always use HTTPS in production
   ```bash
   certbot certonly --nginx -d node.yourdomain.com
   ```

3. **Authentication**: Add basic auth for remote access
   ```nginx
   location / {
       auth_basic "Node UI";
       auth_basic_user_file /etc/nginx/.htpasswd;
       proxy_pass http://localhost:3000;
   }
   ```

### Wallet Security

1. **Never share your wallet keypair**
2. Use a dedicated wallet for node operations
3. Keep only necessary SOL in the node wallet
4. Regular backup of wallet file:
   ```bash
   cp ~/.dekaos/wallet.json ~/backup/wallet-$(date +%Y%m%d).json
   ```

### Container Security

```yaml
# docker-compose.yml security settings
services:
  daemon:
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
```

---

## Support

- **Discord**: [discord.gg/dekaos](https://discord.gg/dekaos)
- **Docs**: [docs.dekaos.network](https://docs.dekaos.network)
- **Issues**: [GitHub Issues](https://github.com/dekaos/node-ui/issues)

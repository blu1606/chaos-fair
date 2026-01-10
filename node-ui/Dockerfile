# ===========================================
# deKAOS Node UI - Production Dockerfile
# Multi-stage build for self-hosted deployment
# ===========================================

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source files
COPY . .

# Build arguments for environment variables
ARG VITE_NODE_API_URL=http://localhost:3001/api
ARG VITE_SUPABASE_URL=
ARG VITE_SUPABASE_ANON_KEY=
ARG VITE_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
ARG VITE_SOLANA_NETWORK=mainnet-beta
ARG VITE_ENABLE_MOCK_FALLBACK=true
ARG VITE_ENABLE_WEBSOCKET=true

# Set environment variables for build
ENV VITE_NODE_API_URL=$VITE_NODE_API_URL
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_SOLANA_RPC_URL=$VITE_SOLANA_RPC_URL
ENV VITE_SOLANA_NETWORK=$VITE_SOLANA_NETWORK
ENV VITE_ENABLE_MOCK_FALLBACK=$VITE_ENABLE_MOCK_FALLBACK
ENV VITE_ENABLE_WEBSOCKET=$VITE_ENABLE_WEBSOCKET

# Build the application
RUN npm run build

# Stage 2: Production with NGINX
FROM nginx:alpine AS production

# Copy custom nginx config
COPY node-ui/nginx.conf /etc/nginx/nginx.conf

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Expose port
EXPOSE 3000

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

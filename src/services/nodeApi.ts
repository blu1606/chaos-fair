/**
 * deKAOS Node UI - Node Daemon API Service
 * Handles communication with the local node daemon (crates/dekaos-node)
 * Includes graceful fallback when daemon is unavailable
 */

import { NODE_ENDPOINTS, UI_CONFIG, FEATURES } from "@/config/node";
import type {
  NodeHealth,
  NodeStatus,
  AudioDevice,
  AudioLevels,
  EntropyMetrics,
  EpochInfo,
  RewardsInfo,
  LogEntry,
  InitializeRequest,
  InitializeResponse,
  CaptureRequest,
  CaptureResponse,
  SubmitRequest,
  SubmitResponse,
  ClaimRewardsRequest,
  ClaimRewardsResponse,
  NodeApiResponse,
  ConnectionState,
  DaemonConnection,
} from "@/types/node";

// ============================================
// Connection State
// ============================================

let connectionState: DaemonConnection = {
  state: "disconnected",
  lastConnected: null,
  lastError: null,
  retryCount: 0,
  wsConnected: false,
};

const connectionListeners: Set<(state: DaemonConnection) => void> = new Set();

export const getConnectionState = (): DaemonConnection => connectionState;

export const subscribeToConnection = (listener: (state: DaemonConnection) => void) => {
  connectionListeners.add(listener);
  return () => connectionListeners.delete(listener);
};

const updateConnectionState = (updates: Partial<DaemonConnection>) => {
  connectionState = { ...connectionState, ...updates };
  connectionListeners.forEach((listener) => listener(connectionState));
};

// ============================================
// API Helpers
// ============================================

const fetchWithRetry = async <T>(
  url: string,
  options: RequestInit = {},
  retries = UI_CONFIG.apiRetryAttempts
): Promise<NodeApiResponse<T>> => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      updateConnectionState({
        state: "connected",
        lastConnected: new Date(),
        lastError: null,
        retryCount: 0,
      });

      return {
        success: true,
        data,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      if (attempt === retries) {
        updateConnectionState({
          state: "error",
          lastError: errorMessage,
          retryCount: attempt,
        });

        return {
          success: false,
          error: {
            code: "DAEMON_UNREACHABLE",
            message: errorMessage,
          },
          timestamp: new Date().toISOString(),
        };
      }

      updateConnectionState({
        state: "connecting",
        retryCount: attempt + 1,
      });

      await new Promise((resolve) => 
        setTimeout(resolve, UI_CONFIG.apiRetryDelay * (attempt + 1))
      );
    }
  }

  return {
    success: false,
    error: { code: "UNEXPECTED", message: "Retry loop exited unexpectedly" },
    timestamp: new Date().toISOString(),
  };
};

// ============================================
// Mock Data Generators (Fallback)
// ============================================

const generateMockHealth = (): NodeHealth => ({
  status: "healthy",
  daemon_version: "0.1.0-mock",
  uptime_seconds: 3600 * 24 * 42 + 3600 * 3 + 60 * 15,
  last_heartbeat: new Date().toISOString(),
  memory_usage_mb: 256,
  cpu_usage_percent: 12.5,
  network: {
    connected: true,
    peers: 47,
    latency_ms: 45,
  },
  solana: {
    connected: true,
    slot: 245678901,
    epoch: 1247,
  },
});

const generateMockStatus = (): NodeStatus => ({
  node_id: "kaos1x2y3z4a5b6c7d8e9f0g1h2i3j4k5l6m7n8o9p0q1r2s3t4u5v6w7x8y9z0",
  is_capturing: false,
  is_paused: false,
  is_initialized: true,
  current_epoch: 1247,
  next_epoch_in_seconds: 272,
  submission_status: "submitted",
  last_submission_tx: "5H7x9k2m3n4p5q6r7s8t9u0v1w2x3y4z5a6b7c8d9e0f1g2h3i4j5k6l7m8n9o0p",
  entropy_quality: 0.847,
  commits_this_epoch: 15,
  total_commits: 4892,
});

const generateMockDevices = (): AudioDevice[] => [
  {
    id: "default",
    name: "MacBook Pro Microphone",
    is_default: true,
    is_active: true,
    sample_rate: 44100,
    channels: 1,
    format: "float32",
  },
  {
    id: "usb-001",
    name: "Blue Yeti USB Microphone",
    is_default: false,
    is_active: false,
    sample_rate: 48000,
    channels: 2,
    format: "float32",
  },
];

const generateMockLevels = (): AudioLevels => ({
  timestamp: Date.now(),
  rms_level_db: -18.5 + Math.random() * 5,
  peak_level_db: -12.3 + Math.random() * 8,
  noise_floor_db: -48 + Math.random() * 3,
  frequency_bands: Array(64).fill(0).map(() => Math.random() * 0.8 + 0.2),
  spectral_entropy: 0.82 + Math.random() * 0.1,
  zcr: 0.234 + Math.random() * 0.05,
  band_energy: 0.45 + Math.random() * 0.1,
});

const generateMockMetrics = (): EntropyMetrics => ({
  spectral_entropy: 82 + Math.random() * 5,
  band_energy: 45 + Math.random() * 10,
  zcr: 58 + Math.random() * 8,
  rms_level_db: -18.5,
  noise_floor_db: -48,
  quality: "optimal",
  quality_score: 82,
});

const generateMockEpoch = (): EpochInfo => ({
  epoch: 1247,
  slot: 245678901,
  start_time: new Date(Date.now() - 3600000).toISOString(),
  end_time: new Date(Date.now() + 272000).toISOString(),
  time_remaining_seconds: 272,
  commits_required: 10,
  commits_submitted: 15,
  finalization_time: "05:18 UTC",
});

const generateMockRewards = (): RewardsInfo => ({
  earned_this_epoch: { kaos: 0.247, sol: 0 },
  pending: { kaos: 1247, sol: 12.5 },
  total_claimed: { kaos: 45892, sol: 125.5 },
  last_claim_epoch: 1246,
  claimable: true,
});

const generateMockLogs = (): LogEntry[] => [
  { id: 1, timestamp: "10:42:15", level: "success", message: "Captured 44.1kHz" },
  { id: 2, timestamp: "10:42:30", level: "success", message: "Features extracted" },
  { id: 3, timestamp: "10:42:45", level: "success", message: "Entropy: 0.847" },
  { id: 4, timestamp: "10:42:50", level: "info", message: "Preparing commit..." },
  { id: 5, timestamp: "10:42:51", level: "success", message: "Submitting commit" },
  { id: 6, timestamp: "10:42:52", level: "success", message: "Tx: 5H...xyz" },
  { id: 7, timestamp: "10:42:53", level: "success", message: "Confirmed!" },
  { id: 8, timestamp: "10:43:00", level: "info", message: "Waiting for epoch..." },
];

// ============================================
// API Functions with Fallback
// ============================================

export const nodeApi = {
  // ========== Health & Status ==========
  
  async getHealth(): Promise<NodeApiResponse<NodeHealth>> {
    const response = await fetchWithRetry<NodeHealth>(NODE_ENDPOINTS.health);
    
    if (!response.success && FEATURES.enableMockFallback) {
      return {
        success: true,
        data: generateMockHealth(),
        timestamp: new Date().toISOString(),
      };
    }
    
    return response;
  },

  async getStatus(): Promise<NodeApiResponse<NodeStatus>> {
    const response = await fetchWithRetry<NodeStatus>(NODE_ENDPOINTS.status);
    
    if (!response.success && FEATURES.enableMockFallback) {
      return {
        success: true,
        data: generateMockStatus(),
        timestamp: new Date().toISOString(),
      };
    }
    
    return response;
  },

  // ========== Audio & Devices ==========

  async getDevices(): Promise<NodeApiResponse<AudioDevice[]>> {
    const response = await fetchWithRetry<AudioDevice[]>(NODE_ENDPOINTS.devices);
    
    if (!response.success && FEATURES.enableMockFallback) {
      return {
        success: true,
        data: generateMockDevices(),
        timestamp: new Date().toISOString(),
      };
    }
    
    return response;
  },

  async getLevels(): Promise<NodeApiResponse<AudioLevels>> {
    const response = await fetchWithRetry<AudioLevels>(NODE_ENDPOINTS.levels);
    
    if (!response.success && FEATURES.enableMockFallback) {
      return {
        success: true,
        data: generateMockLevels(),
        timestamp: new Date().toISOString(),
      };
    }
    
    return response;
  },

  async getMetrics(): Promise<NodeApiResponse<EntropyMetrics>> {
    const response = await fetchWithRetry<EntropyMetrics>(`${NODE_ENDPOINTS.levels}/metrics`);
    
    if (!response.success && FEATURES.enableMockFallback) {
      return {
        success: true,
        data: generateMockMetrics(),
        timestamp: new Date().toISOString(),
      };
    }
    
    return response;
  },

  // ========== Epoch & Rewards ==========

  async getEpoch(): Promise<NodeApiResponse<EpochInfo>> {
    const response = await fetchWithRetry<EpochInfo>(NODE_ENDPOINTS.epoch);
    
    if (!response.success && FEATURES.enableMockFallback) {
      return {
        success: true,
        data: generateMockEpoch(),
        timestamp: new Date().toISOString(),
      };
    }
    
    return response;
  },

  async getRewards(): Promise<NodeApiResponse<RewardsInfo>> {
    const response = await fetchWithRetry<RewardsInfo>(NODE_ENDPOINTS.rewards);
    
    if (!response.success && FEATURES.enableMockFallback) {
      return {
        success: true,
        data: generateMockRewards(),
        timestamp: new Date().toISOString(),
      };
    }
    
    return response;
  },

  // ========== Logs ==========

  async getLogs(limit = 50): Promise<NodeApiResponse<LogEntry[]>> {
    const response = await fetchWithRetry<LogEntry[]>(
      `${NODE_ENDPOINTS.logs}?limit=${limit}`
    );
    
    if (!response.success && FEATURES.enableMockFallback) {
      return {
        success: true,
        data: generateMockLogs(),
        timestamp: new Date().toISOString(),
      };
    }
    
    return response;
  },

  // ========== Control Actions ==========

  async initialize(request?: InitializeRequest): Promise<NodeApiResponse<InitializeResponse>> {
    const response = await fetchWithRetry<InitializeResponse>(
      NODE_ENDPOINTS.initialize,
      {
        method: "POST",
        body: JSON.stringify(request || {}),
      }
    );
    
    if (!response.success && FEATURES.enableMockFallback) {
      return {
        success: true,
        data: {
          success: true,
          node_id: "kaos1x2y3z4a5b6c7d8e9f0g1h2i3j4k5l6m7n8o9p0q1r2s3t4u5v6w7x8y9z0",
          message: "Node initialized (mock)",
        },
        timestamp: new Date().toISOString(),
      };
    }
    
    return response;
  },

  async startCapture(request?: CaptureRequest): Promise<NodeApiResponse<CaptureResponse>> {
    const response = await fetchWithRetry<CaptureResponse>(
      NODE_ENDPOINTS.capture,
      {
        method: "POST",
        body: JSON.stringify(request || {}),
      }
    );
    
    if (!response.success && FEATURES.enableMockFallback) {
      return {
        success: true,
        data: {
          success: true,
          session_id: `session_${Date.now()}`,
          message: "Audio capture started (mock)",
        },
        timestamp: new Date().toISOString(),
      };
    }
    
    return response;
  },

  async stopCapture(): Promise<NodeApiResponse<{ success: boolean }>> {
    const response = await fetchWithRetry<{ success: boolean }>(
      NODE_ENDPOINTS.stop,
      { method: "POST" }
    );
    
    if (!response.success && FEATURES.enableMockFallback) {
      return {
        success: true,
        data: { success: true },
        timestamp: new Date().toISOString(),
      };
    }
    
    return response;
  },

  async pause(): Promise<NodeApiResponse<{ success: boolean }>> {
    const response = await fetchWithRetry<{ success: boolean }>(
      NODE_ENDPOINTS.pause,
      { method: "POST" }
    );
    
    if (!response.success && FEATURES.enableMockFallback) {
      return {
        success: true,
        data: { success: true },
        timestamp: new Date().toISOString(),
      };
    }
    
    return response;
  },

  async resume(): Promise<NodeApiResponse<{ success: boolean }>> {
    const response = await fetchWithRetry<{ success: boolean }>(
      NODE_ENDPOINTS.resume,
      { method: "POST" }
    );
    
    if (!response.success && FEATURES.enableMockFallback) {
      return {
        success: true,
        data: { success: true },
        timestamp: new Date().toISOString(),
      };
    }
    
    return response;
  },

  async submit(request?: SubmitRequest): Promise<NodeApiResponse<SubmitResponse>> {
    const response = await fetchWithRetry<SubmitResponse>(
      NODE_ENDPOINTS.submit,
      {
        method: "POST",
        body: JSON.stringify(request || {}),
      }
    );
    
    if (!response.success && FEATURES.enableMockFallback) {
      return {
        success: true,
        data: {
          success: true,
          tx_hash: "5H7x9k2m3n4p5q6r7s8t9u0v1w2x3y4z5a6b7c8d9e0f1g2h3i4j5k6l7m8n9o0p",
          epoch: 1247,
          message: "Commit submitted (mock)",
        },
        timestamp: new Date().toISOString(),
      };
    }
    
    return response;
  },

  async claimRewards(request?: ClaimRewardsRequest): Promise<NodeApiResponse<ClaimRewardsResponse>> {
    const response = await fetchWithRetry<ClaimRewardsResponse>(
      NODE_ENDPOINTS.claim,
      {
        method: "POST",
        body: JSON.stringify(request || {}),
      }
    );
    
    if (!response.success && FEATURES.enableMockFallback) {
      return {
        success: true,
        data: {
          success: true,
          tx_hash: "5C8x9k2m3n4p5q6r7s8t9u0v1w2x3y4z5a6b7c8d9e0f1g2h3i4j5k6l7m8n9o0p",
          claimed: { kaos: 1247, sol: 12.5 },
          message: "Rewards claimed (mock)",
        },
        timestamp: new Date().toISOString(),
      };
    }
    
    return response;
  },
};

// ============================================
// WebSocket Connection
// ============================================

let ws: WebSocket | null = null;
let wsReconnectTimeout: ReturnType<typeof setTimeout> | null = null;
let wsReconnectAttempts = 0;

type WSCallback = (data: AudioLevels) => void;
const wsListeners: Set<WSCallback> = new Set();

export const subscribeToLevels = (callback: WSCallback) => {
  wsListeners.add(callback);
  
  // Start WebSocket if not connected
  if (!ws && FEATURES.enableWebSocket) {
    connectWebSocket();
  }
  
  return () => {
    wsListeners.delete(callback);
    
    // Close WebSocket if no listeners
    if (wsListeners.size === 0 && ws) {
      ws.close();
      ws = null;
    }
  };
};

const connectWebSocket = () => {
  if (ws?.readyState === WebSocket.OPEN) return;
  
  try {
    ws = new WebSocket(NODE_ENDPOINTS.wsLevels);
    
    ws.onopen = () => {
      updateConnectionState({ wsConnected: true });
      wsReconnectAttempts = 0;
      console.log("[NodeUI] WebSocket connected");
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as AudioLevels;
        wsListeners.forEach((callback) => callback(data));
      } catch (error) {
        console.error("[NodeUI] WebSocket parse error:", error);
      }
    };
    
    ws.onclose = () => {
      updateConnectionState({ wsConnected: false });
      ws = null;
      
      // Reconnect with backoff
      if (wsReconnectAttempts < UI_CONFIG.wsMaxReconnectAttempts && wsListeners.size > 0) {
        const delay = UI_CONFIG.wsReconnectDelay * Math.pow(2, wsReconnectAttempts);
        wsReconnectTimeout = setTimeout(() => {
          wsReconnectAttempts++;
          connectWebSocket();
        }, delay);
      }
    };
    
    ws.onerror = (error) => {
      console.error("[NodeUI] WebSocket error:", error);
    };
  } catch (error) {
    console.error("[NodeUI] WebSocket connection failed:", error);
  }
};

export const disconnectWebSocket = () => {
  if (wsReconnectTimeout) {
    clearTimeout(wsReconnectTimeout);
    wsReconnectTimeout = null;
  }
  
  if (ws) {
    ws.close();
    ws = null;
  }
  
  wsReconnectAttempts = 0;
};

export default nodeApi;

/**
 * deKAOS Node UI - Standalone Types
 * Types for daemon API communication
 * Compatible with crates/dekaos-node Rust binary
 */

// ============================================
// Node Identity & Status
// ============================================

export interface NodeIdentity {
  nodeId: string;
  publicKey: string;
  stake: {
    amount: number;
    symbol: "SOL";
  };
  status: "live" | "offline" | "syncing" | "error";
  uptime: string;
  version: string;
}

export interface NodeHealth {
  status: "healthy" | "degraded" | "unhealthy";
  daemon_version: string;
  uptime_seconds: number;
  last_heartbeat: string;
  memory_usage_mb: number;
  cpu_usage_percent: number;
  network: {
    connected: boolean;
    peers: number;
    latency_ms: number;
  };
  solana: {
    connected: boolean;
    slot: number;
    epoch: number;
  };
}

export interface NodeStatus {
  node_id: string;
  is_capturing: boolean;
  is_paused: boolean;
  is_initialized: boolean;
  current_epoch: number;
  next_epoch_in_seconds: number;
  submission_status: "submitted" | "pending" | "failed" | "none";
  last_submission_tx: string | null;
  entropy_quality: number;
  commits_this_epoch: number;
  total_commits: number;
}

// ============================================
// Audio & Entropy
// ============================================

export interface AudioDevice {
  id: string;
  name: string;
  is_default: boolean;
  is_active: boolean;
  sample_rate: number;
  channels: number;
  format: string;
}

export interface AudioLevels {
  timestamp: number;
  rms_level_db: number;
  peak_level_db: number;
  noise_floor_db: number;
  frequency_bands: number[]; // 64 bands for spectrum
  spectral_entropy: number;
  zcr: number; // Zero-crossing rate
  band_energy: number;
}

export interface EntropyMetrics {
  spectral_entropy: number;
  band_energy: number;
  zcr: number;
  rms_level_db: number;
  noise_floor_db: number;
  quality: "optimal" | "good" | "ok" | "low";
  quality_score: number; // 0-100
}

// ============================================
// Epoch & Rewards
// ============================================

export interface EpochInfo {
  epoch: number;
  slot: number;
  start_time: string;
  end_time: string;
  time_remaining_seconds: number;
  commits_required: number;
  commits_submitted: number;
  finalization_time: string;
}

export interface RewardsInfo {
  earned_this_epoch: {
    kaos: number;
    sol: number;
  };
  pending: {
    kaos: number;
    sol: number;
  };
  total_claimed: {
    kaos: number;
    sol: number;
  };
  last_claim_epoch: number;
  claimable: boolean;
}

// ============================================
// Logs
// ============================================

export type LogLevel = "success" | "warning" | "error" | "info" | "debug";

export interface LogEntry {
  id: number;
  timestamp: string;
  level: LogLevel;
  message: string;
  source?: string;
  metadata?: Record<string, unknown>;
}

// ============================================
// Control Actions
// ============================================

export interface InitializeRequest {
  wallet_address?: string;
  audio_device_id?: string;
}

export interface InitializeResponse {
  success: boolean;
  node_id: string;
  message: string;
}

export interface CaptureRequest {
  device_id?: string;
  sample_rate?: number;
}

export interface CaptureResponse {
  success: boolean;
  session_id: string;
  message: string;
}

export interface SubmitRequest {
  epoch: number;
  force?: boolean;
}

export interface SubmitResponse {
  success: boolean;
  tx_hash: string;
  epoch: number;
  message: string;
}

export interface ClaimRewardsRequest {
  epochs?: number[];
}

export interface ClaimRewardsResponse {
  success: boolean;
  tx_hash: string;
  claimed: {
    kaos: number;
    sol: number;
  };
  message: string;
}

// ============================================
// WebSocket Messages
// ============================================

export type WSMessageType = 
  | "audio_levels"
  | "log_entry"
  | "status_update"
  | "epoch_update"
  | "error";

export interface WSMessage<T = unknown> {
  type: WSMessageType;
  timestamp: number;
  data: T;
}

// ============================================
// API Response Wrapper
// ============================================

export interface NodeApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  timestamp: string;
}

// ============================================
// Connection State
// ============================================

export type ConnectionState = "connected" | "connecting" | "disconnected" | "error";

export interface DaemonConnection {
  state: ConnectionState;
  lastConnected: Date | null;
  lastError: string | null;
  retryCount: number;
  wsConnected: boolean;
}

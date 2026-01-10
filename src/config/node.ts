/**
 * deKAOS Node UI - Configuration
 * Environment-based configuration for standalone deployment
 */

// ============================================
// Environment Variables
// ============================================

/**
 * Node Daemon API URL
 * Default: http://localhost:3001/api (daemon runs on separate port from UI)
 * 
 * In Docker: Set to internal service name (e.g., http://daemon:3001/api)
 * In Production: Set to your daemon's public URL
 */
export const NODE_API_URL = import.meta.env.VITE_NODE_API_URL || "http://localhost:3001/api";

/**
 * WebSocket URL for real-time audio levels
 * Derived from NODE_API_URL, replacing http with ws
 */
export const NODE_WS_URL = NODE_API_URL
  .replace(/^http/, "ws")
  .replace(/\/api$/, "/ws");

/**
 * Supabase Configuration (Optional)
 * Only needed for on-chain queries and authentication
 */
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

/**
 * Solana Configuration
 */
export const SOLANA_RPC_URL = import.meta.env.VITE_SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
export const SOLANA_NETWORK = import.meta.env.VITE_SOLANA_NETWORK || "mainnet-beta";

// ============================================
// API Endpoints
// ============================================

export const NODE_ENDPOINTS = {
  // Health & Status
  health: `${NODE_API_URL}/health`,
  status: `${NODE_API_URL}/status`,
  
  // Audio & Devices
  devices: `${NODE_API_URL}/devices`,
  levels: `${NODE_API_URL}/levels`,
  
  // Control Actions
  initialize: `${NODE_API_URL}/initialize`,
  capture: `${NODE_API_URL}/capture`,
  stop: `${NODE_API_URL}/stop`,
  pause: `${NODE_API_URL}/pause`,
  resume: `${NODE_API_URL}/resume`,
  submit: `${NODE_API_URL}/submit`,
  
  // Epoch & Rewards
  epoch: `${NODE_API_URL}/epoch`,
  rewards: `${NODE_API_URL}/rewards`,
  claim: `${NODE_API_URL}/claim`,
  
  // Logs
  logs: `${NODE_API_URL}/logs`,
  
  // WebSocket
  wsLevels: `${NODE_WS_URL}/levels`,
  wsLogs: `${NODE_WS_URL}/logs`,
} as const;

// ============================================
// UI Configuration
// ============================================

export const UI_CONFIG = {
  // Polling intervals (ms) when WebSocket is unavailable
  statusPollInterval: 2000,
  epochPollInterval: 5000,
  rewardsPollInterval: 30000,
  healthPollInterval: 10000,
  
  // Reconnection settings
  wsReconnectDelay: 1000,
  wsMaxReconnectAttempts: 10,
  apiRetryAttempts: 3,
  apiRetryDelay: 1000,
  
  // UI settings
  spectrumBars: 64,
  logMaxEntries: 100,
  toastDuration: 3000,
} as const;

// ============================================
// Feature Flags
// ============================================

export const FEATURES = {
  // Enable mock data when daemon is unavailable
  enableMockFallback: import.meta.env.VITE_ENABLE_MOCK_FALLBACK !== "false",
  
  // Enable WebSocket for real-time updates
  enableWebSocket: import.meta.env.VITE_ENABLE_WEBSOCKET !== "false",
  
  // Enable Supabase integration
  enableSupabase: Boolean(SUPABASE_URL && SUPABASE_ANON_KEY),
  
  // Development mode
  isDevelopment: import.meta.env.DEV,
  
  // Show connection status indicator
  showConnectionStatus: true,
} as const;

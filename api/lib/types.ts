/**
 * Shared TypeScript types for API
 */

// API Response wrapper
export interface ApiResponse<T = unknown> {
  status: 'success' | 'error';
  data?: T;
  error?: string;
  timestamp: string;
}

// Dashboard Stats Response
export interface DashboardStatsData {
  user: {
    name: string | null;
    avatar_url: string | null;
    plan_type: string;
  };
  api_metrics: {
    total_requests: number;
    requests_trend: string;
    requests_this_month: number;
    requests_last_month: number;
  };
  performance: {
    average_latency_ms: number;
    latency_status: 'optimal' | 'warning' | 'critical';
    latency_min: number;
    latency_max: number;
    p99_latency_ms: number;
  };
  credits: {
    available_credits: number;
    used_this_month: number;
    plan_limit: number;
    usage_percent: number;
    auto_refill_enabled: boolean;
  };
  keys: {
    active_keys_count: number;
    nearest_key_expiry_days: number | null;
    expiring_keys: Array<{ id: string; name: string; expires_in_days: number }>;
  };
  alerts: {
    unread_notifications: number;
    warnings: string[];
  };
}

// API Key Permissions
export interface ApiKeyPermissions {
  read_randomness: boolean;
  write_randomness: boolean;
  read_usage: boolean;
  manage_keys: boolean;
  manage_billing: boolean;
}

// API Key types
export interface ApiKey {
  id: string;
  name: string;
  description: string | null;
  key_preview: string;
  permissions: ApiKeyPermissions;
  status: 'active' | 'revoked' | 'expired';
  rate_limit_rpm: number;
  rate_limit_daily: number;
  created_at: string;
  last_used_at: string | null;
  expires_at: string | null;
}

export interface CreateApiKeyRequest {
  name: string;
  description?: string;
  permissions?: ApiKeyPermissions;
  rate_limit_rpm?: number;
  rate_limit_daily?: number;
  expires_at?: string;
}

export interface UpdateApiKeyRequest {
  name?: string;
  description?: string;
  permissions?: ApiKeyPermissions;
  rate_limit_rpm?: number;
  rate_limit_daily?: number;
}

// Randomness types
export interface RandomnessRequest {
  count: number;
  format?: 'hex' | 'base64' | 'uint8' | 'uint32';
}

export interface RandomnessResponse {
  values: string[] | number[];
  format: string;
  count: number;
  entropy_source: string;
  timestamp: string;
}

// Request Logs types
export interface RequestLogItem {
  id: string;
  timestamp: string;
  api_key_name: string;
  endpoint: string;
  method: string;
  response_status: number;
  response_time_ms: number;
  cost_credits: number;
  request_count: number;
  status: 'success' | 'error';
  error_message: string | null;
  ip_address: string;
}

export interface PaginationInfo {
  page: number;
  total_pages: number;
  total_records: number;
  limit: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface RequestLogsResponse {
  data: RequestLogItem[];
  pagination: PaginationInfo;
}

export interface RequestLogsParams {
  page?: number;
  limit?: number;
  status?: 'success' | 'error' | 'all';
  endpoint?: string;
  api_key_id?: string;
  from?: string;
  to?: string;
  sort?: 'latest' | 'oldest' | 'slowest' | 'most_expensive';
}

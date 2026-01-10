/**
 * Mock Data Service for Testing Mode
 * All mock data is centralized here for easy management
 */

// Dashboard KPIs
export const mockKPIs = {
  totalRequests: 127_543,
  requestsChange: 12.5,
  avgLatency: 23,
  latencyChange: -8.3,
  creditsUsed: 8_234,
  creditsTotal: 50_000,
  successRate: 99.7,
  successRateChange: 0.2,
};

// Usage chart data (last 7 days)
export const mockUsageData = [
  { date: '2026-01-04', requests: 15_234, errors: 45 },
  { date: '2026-01-05', requests: 18_456, errors: 32 },
  { date: '2026-01-06', requests: 12_789, errors: 28 },
  { date: '2026-01-07', requests: 21_345, errors: 56 },
  { date: '2026-01-08', requests: 19_876, errors: 41 },
  { date: '2026-01-09', requests: 22_543, errors: 38 },
  { date: '2026-01-10', requests: 17_300, errors: 29 },
];

// Recent requests
export const mockRecentRequests = [
  {
    id: 'req-001',
    endpoint: '/v1/random',
    method: 'POST',
    status: 200,
    latency: 18,
    timestamp: '2026-01-10T14:32:15Z',
    count: 10,
  },
  {
    id: 'req-002',
    endpoint: '/v1/random',
    method: 'POST',
    status: 200,
    latency: 22,
    timestamp: '2026-01-10T14:31:45Z',
    count: 5,
  },
  {
    id: 'req-003',
    endpoint: '/v1/verify',
    method: 'GET',
    status: 200,
    latency: 12,
    timestamp: '2026-01-10T14:30:20Z',
    count: 1,
  },
  {
    id: 'req-004',
    endpoint: '/v1/random',
    method: 'POST',
    status: 429,
    latency: 5,
    timestamp: '2026-01-10T14:28:10Z',
    count: 100,
  },
  {
    id: 'req-005',
    endpoint: '/v1/epoch',
    method: 'GET',
    status: 200,
    latency: 8,
    timestamp: '2026-01-10T14:25:00Z',
    count: 1,
  },
];

// API Keys
export const mockApiKeys = [
  {
    id: 'key-001',
    name: 'Production Key',
    key_preview: 'dk_live_****...X7Kq',
    status: 'active',
    created_at: '2025-12-15T10:00:00Z',
    last_used_at: '2026-01-10T14:32:15Z',
    expires_at: '2026-06-15T10:00:00Z',
    rate_limit_rpm: 1000,
    rate_limit_daily: 100_000,
  },
  {
    id: 'key-002',
    name: 'Development Key',
    key_preview: 'dk_test_****...M2Np',
    status: 'active',
    created_at: '2025-11-20T08:30:00Z',
    last_used_at: '2026-01-09T16:45:00Z',
    expires_at: null,
    rate_limit_rpm: 100,
    rate_limit_daily: 10_000,
  },
  {
    id: 'key-003',
    name: 'Old Staging Key',
    key_preview: 'dk_test_****...P9Lm',
    status: 'revoked',
    created_at: '2025-08-01T12:00:00Z',
    last_used_at: '2025-10-15T09:20:00Z',
    expires_at: '2025-12-01T12:00:00Z',
    rate_limit_rpm: 500,
    rate_limit_daily: 50_000,
  },
];

// Account info
export const mockAccount = {
  id: 'acc-001',
  plan_type: 'pro',
  available_credits: 41_766,
  total_credits: 50_000,
  used_credits: 8_234,
  subscription_start: '2025-12-01T00:00:00Z',
  subscription_end: '2026-12-01T00:00:00Z',
  auto_renew: true,
};

// Playground generation result
export const generateMockRandomness = (count: number) => {
  const data = Array.from({ length: count }, () => 
    Math.floor(Math.random() * 256)
  );
  
  return {
    epoch: 1847293,
    count,
    data,
    timestamp: new Date().toISOString(),
    latency: Math.floor(Math.random() * 20) + 10,
    signature: `0x${Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('')}`,
    proof: `walrus://${Array.from({ length: 44 }, () => 
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[
        Math.floor(Math.random() * 62)
      ]
    ).join('')}`,
  };
};

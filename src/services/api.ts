/**
 * API Service
 * Re-exports from modular API services
 * 
 * @deprecated Import directly from '@/services/api' instead
 */

// Re-export everything for backward compatibility
export {
  fetchDashboardStats,
  fetchDashboardKPIs,
  fetchUsageChart,
  fetchRecentRequests,
} from './api/dashboard';

export {
  fetchApiKeys,
  createApiKey,
  revokeApiKey,
  updateApiKey,
} from './api/keys';

export {
  generateRandomness,
} from './api/randomness';

export {
  fetchAccount,
} from './api/account';

// Re-export types
export type { DashboardStats } from './api/dashboard';
export type { ApiKey, CreateApiKeyRequest } from './api/keys';
export type { RandomnessRequest, RandomnessResponse } from './api/randomness';
export type { Account } from './api/account';

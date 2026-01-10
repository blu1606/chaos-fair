/**
 * API Configuration
 * Manages API base URL for different environments
 */

// Get API base URL from environment or use Supabase Edge Functions as fallback
export const getApiBaseUrl = (): string => {
  // Check for Vercel API URL first (production)
  const vercelApiUrl = import.meta.env.VITE_API_URL;
  if (vercelApiUrl) {
    return vercelApiUrl;
  }

  // Fallback to Supabase Edge Functions
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (supabaseUrl) {
    return `${supabaseUrl}/functions/v1`;
  }

  // Default fallback
  return 'https://pdjuxagaegipvtksffmd.supabase.co/functions/v1';
};

export const API_BASE_URL = getApiBaseUrl();

// API Endpoints
export const API_ENDPOINTS = {
  // Dashboard
  dashboardStats: '/dashboard-stats',
  
  // API Keys
  keys: '/keys',
  keyById: (id: string) => `/keys/${id}`,
  
  // Randomness
  generateRandomness: '/randomness/generate',
  
  // Health
  health: '/health',
} as const;

// Helper to build full URL
export const buildApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};

// Check if using Vercel API
export const isUsingVercelApi = (): boolean => {
  return !!import.meta.env.VITE_API_URL;
};

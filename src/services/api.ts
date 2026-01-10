/**
 * API Service
 * Switches between mock data and real Supabase based on app mode
 */

import { config } from '@/config/appMode';
import { supabase } from '@/integrations/supabase/client';
import * as mockData from './mockData';

// Dashboard Stats API (new edge function)
export const fetchDashboardStats = async () => {
  if (config.useMockData) {
    return {
      status: 'success',
      timestamp: new Date().toISOString(),
      data: {
        user: { name: 'Test User', avatar_url: null, plan_type: 'pro' },
        api_metrics: {
          total_requests: mockData.mockKPIs.totalRequests,
          requests_trend: `+${mockData.mockKPIs.requestsChange}%`,
          requests_this_month: mockData.mockKPIs.totalRequests,
          requests_last_month: Math.round(mockData.mockKPIs.totalRequests * 0.88),
        },
        performance: {
          average_latency_ms: mockData.mockKPIs.avgLatency,
          latency_status: 'optimal' as const,
          latency_min: 8,
          latency_max: 150,
          p99_latency_ms: 95,
        },
        credits: {
          available_credits: mockData.mockKPIs.creditsTotal - mockData.mockKPIs.creditsUsed,
          used_this_month: mockData.mockKPIs.creditsUsed,
          plan_limit: mockData.mockKPIs.creditsTotal,
          usage_percent: Math.round((mockData.mockKPIs.creditsUsed / mockData.mockKPIs.creditsTotal) * 100),
          auto_refill_enabled: false,
        },
        keys: {
          active_keys_count: mockData.mockApiKeys.length,
          nearest_key_expiry_days: 45,
          expiring_keys: [],
        },
        alerts: {
          unread_notifications: 3,
          warnings: [],
        },
      },
    };
  }

  // Call the Edge Function
  const { data, error } = await supabase.functions.invoke('dashboard-stats');
  
  if (error) throw error;
  return data;
};

// Legacy Dashboard APIs (kept for backward compatibility)
export const fetchDashboardKPIs = async (userId: string) => {
  if (config.useMockData) {
    return mockData.mockKPIs;
  }
  
  // Use the new dashboard-stats endpoint
  const stats = await fetchDashboardStats();
  
  return {
    totalRequests: stats.data.api_metrics.total_requests,
    requestsChange: parseFloat(stats.data.api_metrics.requests_trend),
    avgLatency: stats.data.performance.average_latency_ms,
    latencyChange: 0,
    creditsUsed: stats.data.credits.used_this_month,
    creditsTotal: stats.data.credits.plan_limit,
    successRate: 99.5,
    successRateChange: 0,
  };
};

export const fetchUsageChart = async (userId: string, days = 7) => {
  if (config.useMockData) {
    return mockData.mockUsageData;
  }
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const { data, error } = await supabase
    .from('analytics_daily')
    .select('date, total_requests, total_requests_error')
    .eq('user_id', userId)
    .gte('date', startDate.toISOString().split('T')[0])
    .order('date', { ascending: true });

  if (error) throw error;
  
  return data?.map(d => ({
    date: d.date,
    requests: d.total_requests || 0,
    errors: d.total_requests_error || 0,
  })) || [];
};

export const fetchRecentRequests = async (userId: string, limit = 10) => {
  if (config.useMockData) {
    return mockData.mockRecentRequests.slice(0, limit);
  }
  
  const { data, error } = await supabase
    .from('request_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  
  return data?.map(d => ({
    id: d.id,
    endpoint: d.endpoint,
    method: d.method,
    status: d.response_status,
    latency: d.response_time_ms || 0,
    timestamp: d.created_at,
    count: d.request_count || 1,
  })) || [];
};

// API Keys APIs
export const fetchApiKeys = async (userId: string) => {
  if (config.useMockData) {
    return mockData.mockApiKeys;
  }
  
  const { data, error } = await supabase
    .from('api_keys')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const createApiKey = async (userId: string, keyData: {
  name: string;
  description?: string;
  rate_limit_rpm?: number;
  rate_limit_daily?: number;
  expires_at?: string;
}) => {
  if (config.useMockData) {
    // Return mock created key
    return {
      id: `key-${Date.now()}`,
      ...keyData,
      key_preview: `dk_test_****...${Math.random().toString(36).slice(-4).toUpperCase()}`,
      status: 'active',
      created_at: new Date().toISOString(),
      last_used_at: null,
      // Return full key only on creation (mock)
      fullKey: `dk_test_${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`,
    };
  }
  
  // Real API call
  const { data, error } = await supabase.rpc('generate_api_key');
  if (error) throw error;
  
  const fullKey = data as string;
  const keyHash = await supabase.rpc('hash_api_key', { key: fullKey });
  
  const { data: insertedKey, error: insertError } = await supabase
    .from('api_keys')
    .insert({
      user_id: userId,
      name: keyData.name,
      description: keyData.description,
      key_hash: keyHash.data as string,
      key_prefix: fullKey.slice(0, 8),
      key_preview: `${fullKey.slice(0, 8)}****...${fullKey.slice(-4)}`,
      rate_limit_rpm: keyData.rate_limit_rpm || 100,
      rate_limit_daily: keyData.rate_limit_daily || 10000,
      expires_at: keyData.expires_at,
    })
    .select()
    .single();

  if (insertError) throw insertError;
  
  return { ...insertedKey, fullKey };
};

export const revokeApiKey = async (keyId: string) => {
  if (config.useMockData) {
    return { success: true };
  }
  
  const { error } = await supabase
    .from('api_keys')
    .update({ 
      status: 'revoked', 
      revoked_at: new Date().toISOString() 
    })
    .eq('id', keyId);

  if (error) throw error;
  return { success: true };
};

// Account APIs
export const fetchAccount = async (userId: string) => {
  if (config.useMockData) {
    return mockData.mockAccount;
  }
  
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
};

// Playground / Randomness APIs
export const generateRandomness = async (count: number) => {
  if (config.useMockData) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
    return mockData.generateMockRandomness(count);
  }
  
  // TODO: Call real edge function
  // const { data, error } = await supabase.functions.invoke('generate-randomness', {
  //   body: { count }
  // });
  
  throw new Error('Real randomness API not implemented yet');
};

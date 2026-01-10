/**
 * Dashboard API Service
 */

import { config } from '@/config/appMode';
import { API_BASE_URL, API_ENDPOINTS, buildApiUrl } from '@/config/api';
import { supabase } from '@/integrations/supabase/client';
import * as mockData from '../mockData';

export interface DashboardStats {
  status: string;
  timestamp: string;
  data: {
    user: { name: string; avatar_url: string | null; plan_type: string };
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
  };
}

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
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

  // Call the API (Vercel or Supabase Edge Function)
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;

  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(buildApiUrl(API_ENDPOINTS.dashboardStats), {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch dashboard stats');
  }

  return response.json();
};

// Legacy Dashboard APIs (kept for backward compatibility)
export const fetchDashboardKPIs = async (userId: string) => {
  if (config.useMockData) {
    return mockData.mockKPIs;
  }
  
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

/**
 * Analytics API Service - Endpoints Breakdown
 */

import { config } from '@/config/appMode';
import { buildApiUrl, API_ENDPOINTS } from '@/config/api';
import { supabase } from '@/integrations/supabase/client';

export interface EndpointStats {
  endpoint: string;
  method: string;
  requests_count: number;
  requests_percent: number;
  success_count: number;
  error_count: number;
  error_rate_percent: number;
  avg_latency_ms: number;
  p95_latency_ms: number;
  total_cost: number;
  trend: string;
  last_request_at: string | null;
}

export interface EndpointsResponse {
  range: string;
  total_requests: number;
  unique_endpoints: number;
  endpoints: EndpointStats[];
}

export interface EndpointsParams {
  range?: '7d' | '30d' | '90d';
}

const getAuthToken = async (): Promise<string> => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Not authenticated');
  return token;
};

/**
 * Fetch endpoint analytics breakdown
 */
export const fetchEndpointAnalytics = async (
  params: EndpointsParams = {}
): Promise<EndpointsResponse> => {
  if (config.useMockData) {
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 100));
    
    const mockEndpoints: EndpointStats[] = [
      {
        endpoint: '/randomness/generate',
        method: 'POST',
        requests_count: 45230,
        requests_percent: 72,
        success_count: 45100,
        error_count: 130,
        error_rate_percent: 0.29,
        avg_latency_ms: 38,
        p95_latency_ms: 85,
        total_cost: 2261.50,
        trend: '+12%',
        last_request_at: new Date().toISOString(),
      },
      {
        endpoint: '/randomness/vrf',
        method: 'POST',
        requests_count: 8540,
        requests_percent: 14,
        success_count: 8520,
        error_count: 20,
        error_rate_percent: 0.23,
        avg_latency_ms: 52,
        p95_latency_ms: 120,
        total_cost: 8540.00,
        trend: '+28%',
        last_request_at: new Date(Date.now() - 300000).toISOString(),
      },
      {
        endpoint: '/randomness/verify',
        method: 'POST',
        requests_count: 5200,
        requests_percent: 8,
        success_count: 5180,
        error_count: 20,
        error_rate_percent: 0.38,
        avg_latency_ms: 45,
        p95_latency_ms: 95,
        total_cost: 0,
        trend: '+5%',
        last_request_at: new Date(Date.now() - 600000).toISOString(),
      },
      {
        endpoint: '/keys',
        method: 'GET',
        requests_count: 2100,
        requests_percent: 3,
        success_count: 2100,
        error_count: 0,
        error_rate_percent: 0,
        avg_latency_ms: 25,
        p95_latency_ms: 55,
        total_cost: 0,
        trend: '-2%',
        last_request_at: new Date(Date.now() - 1200000).toISOString(),
      },
      {
        endpoint: '/search',
        method: 'GET',
        requests_count: 1850,
        requests_percent: 3,
        success_count: 1840,
        error_count: 10,
        error_rate_percent: 0.54,
        avg_latency_ms: 42,
        p95_latency_ms: 88,
        total_cost: 0,
        trend: '+45%',
        last_request_at: new Date(Date.now() - 1800000).toISOString(),
      },
    ];
    
    return {
      range: params.range || '30d',
      total_requests: mockEndpoints.reduce((sum, e) => sum + e.requests_count, 0),
      unique_endpoints: mockEndpoints.length,
      endpoints: mockEndpoints,
    };
  }
  
  const token = await getAuthToken();
  
  const queryParams = new URLSearchParams();
  if (params.range) queryParams.set('range', params.range);
  
  const url = buildApiUrl(`${API_ENDPOINTS.analyticsEndpoints}${queryParams.toString() ? `?${queryParams}` : ''}`);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch endpoint analytics');
  }

  const result = await response.json();
  return result.data;
};

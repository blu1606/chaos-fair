/**
 * Analytics API Services
 */

import { API_ENDPOINTS, getAuthHeaders, API_CONFIG } from '@/config/api';

// Types
export interface UsageDataPoint {
  date: string;
  requests: number;
  requests_success: number;
  requests_error: number;
  cost: number;
  average_latency_ms: number;
  top_endpoint: string | null;
}

export interface UsageSummary {
  total_requests: number;
  total_requests_success: number;
  total_requests_error: number;
  total_cost: number;
  average_requests_per_day: number;
  average_latency_ms: number;
  error_rate_percent: number;
}

export interface UsageResponse {
  range: string;
  granularity: string;
  data: UsageDataPoint[];
  summary: UsageSummary;
}

export interface UsageParams {
  range?: '7d' | '30d' | '90d';
  granularity?: 'hourly' | 'daily' | 'weekly';
}

// Mock data generator
function generateMockUsageData(range: string, granularity: string): UsageResponse {
  const daysMap: Record<string, number> = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
  };
  
  const days = daysMap[range] || 30;
  const data: UsageDataPoint[] = [];
  
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const baseRequests = Math.floor(Math.random() * 2000) + 500;
    const errorRate = Math.random() * 0.03; // 0-3% error rate
    const errors = Math.floor(baseRequests * errorRate);
    
    data.push({
      date: date.toISOString().split('T')[0],
      requests: baseRequests,
      requests_success: baseRequests - errors,
      requests_error: errors,
      cost: Math.round(baseRequests * 0.1 * 100) / 100,
      average_latency_ms: Math.floor(Math.random() * 30) + 25,
      top_endpoint: '/randomness/generate',
    });
  }

  // Aggregate to weekly if needed
  let finalData = data;
  if (granularity === 'weekly') {
    const weeklyData = new Map<string, UsageDataPoint>();
    
    for (const point of data) {
      const date = new Date(point.date);
      const monday = new Date(date);
      monday.setDate(date.getDate() - date.getDay() + 1);
      const weekKey = monday.toISOString().split('T')[0];
      
      const existing = weeklyData.get(weekKey);
      if (existing) {
        existing.requests += point.requests;
        existing.requests_success += point.requests_success;
        existing.requests_error += point.requests_error;
        existing.cost += point.cost;
      } else {
        weeklyData.set(weekKey, { ...point, date: weekKey });
      }
    }
    
    finalData = Array.from(weeklyData.values());
  }

  const totalRequests = finalData.reduce((sum, d) => sum + d.requests, 0);
  const totalSuccess = finalData.reduce((sum, d) => sum + d.requests_success, 0);
  const totalError = finalData.reduce((sum, d) => sum + d.requests_error, 0);
  const totalCost = finalData.reduce((sum, d) => sum + d.cost, 0);

  return {
    range,
    granularity,
    data: finalData,
    summary: {
      total_requests: totalRequests,
      total_requests_success: totalSuccess,
      total_requests_error: totalError,
      total_cost: Math.round(totalCost * 100) / 100,
      average_requests_per_day: Math.round((totalRequests / days) * 100) / 100,
      average_latency_ms: Math.floor(Math.random() * 20) + 35,
      error_rate_percent: Math.round((totalError / totalRequests) * 10000) / 100,
    },
  };
}

/**
 * Fetch usage analytics data
 */
export async function fetchUsageAnalytics(params: UsageParams = {}): Promise<UsageResponse> {
  const { range = '30d', granularity = 'daily' } = params;

  // Return mock data in testing mode
  if (API_CONFIG.useMockData) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return generateMockUsageData(range, granularity);
  }

  const headers = await getAuthHeaders();
  
  const queryParams = new URLSearchParams();
  queryParams.set('range', range);
  queryParams.set('granularity', granularity);

  const response = await fetch(
    `${API_ENDPOINTS.analyticsUsage}?${queryParams.toString()}`,
    { headers }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch usage analytics');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Fetch usage chart data (legacy compatibility)
 */
export async function fetchUsageChart(
  userId: string,
  days: number = 7
): Promise<Array<{ date: string; requests: number; errors: number }>> {
  const range = days <= 7 ? '7d' : days <= 30 ? '30d' : '90d';
  const data = await fetchUsageAnalytics({ range, granularity: 'daily' });
  
  return data.data.slice(-days).map(point => ({
    date: point.date,
    requests: point.requests,
    errors: point.requests_error,
  }));
}

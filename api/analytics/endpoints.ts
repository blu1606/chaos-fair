/**
 * Analytics by Endpoint Breakdown
 * GET /api/analytics/endpoints
 * 
 * Returns request breakdown by endpoint with latency and cost metrics
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCors } from '../lib/cors';
import { verifyAuth } from '../lib/auth';
import { sendSuccess, sendError, sendServerError, sendUnauthorized } from '../lib/response';
import { supabaseAdmin } from '../lib/supabase';

interface EndpointStats {
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(res, req.method || '')) return;

  if (req.method !== 'GET') {
    return sendError(res, 'Method not allowed', 405);
  }

  try {
    // Authenticate
    const { user, error: authError } = await verifyAuth(req);
    if (!user) {
      return sendUnauthorized(res, authError || 'Unauthorized');
    }

    // Parse query parameters
    const range = (req.query.range as string) || '30d';
    const validRanges = ['7d', '30d', '90d'];
    if (!validRanges.includes(range)) {
      return sendError(res, `Invalid range. Valid: ${validRanges.join(', ')}`);
    }

    // Calculate date range
    const days = parseInt(range.replace('d', ''), 10);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString();

    // Previous period for trend calculation
    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(prevStartDate.getDate() - days);
    const prevStartDateStr = prevStartDate.toISOString();

    // Fetch current period data
    const { data: currentData, error: currentError } = await supabaseAdmin
      .from('request_logs')
      .select('endpoint, method, response_status, response_time_ms, cost_credits, created_at')
      .eq('user_id', user.id)
      .gte('created_at', startDateStr)
      .order('created_at', { ascending: false });

    if (currentError) throw currentError;

    // Fetch previous period data for trend calculation
    const { data: prevData, error: prevError } = await supabaseAdmin
      .from('request_logs')
      .select('endpoint, method')
      .eq('user_id', user.id)
      .gte('created_at', prevStartDateStr)
      .lt('created_at', startDateStr);

    if (prevError) throw prevError;

    // Aggregate by endpoint + method
    const endpointMap = new Map<string, {
      endpoint: string;
      method: string;
      requests: number;
      successes: number;
      errors: number;
      latencies: number[];
      totalCost: number;
      lastRequest: string | null;
    }>();

    const totalRequests = currentData?.length || 0;

    for (const log of currentData || []) {
      const key = `${log.method}:${log.endpoint}`;
      
      if (!endpointMap.has(key)) {
        endpointMap.set(key, {
          endpoint: log.endpoint,
          method: log.method,
          requests: 0,
          successes: 0,
          errors: 0,
          latencies: [],
          totalCost: 0,
          lastRequest: null,
        });
      }

      const stats = endpointMap.get(key)!;
      stats.requests++;
      
      if (log.response_status < 400) {
        stats.successes++;
      } else {
        stats.errors++;
      }
      
      if (log.response_time_ms) {
        stats.latencies.push(log.response_time_ms);
      }
      
      stats.totalCost += log.cost_credits || 0;
      
      if (!stats.lastRequest || log.created_at > stats.lastRequest) {
        stats.lastRequest = log.created_at;
      }
    }

    // Calculate previous period counts for trends
    const prevEndpointCounts = new Map<string, number>();
    for (const log of prevData || []) {
      const key = `${log.method}:${log.endpoint}`;
      prevEndpointCounts.set(key, (prevEndpointCounts.get(key) || 0) + 1);
    }

    // Build response
    const endpointStats: EndpointStats[] = [];

    for (const [key, stats] of endpointMap) {
      // Calculate average latency
      const avgLatency = stats.latencies.length > 0
        ? Math.round(stats.latencies.reduce((a, b) => a + b, 0) / stats.latencies.length)
        : 0;

      // Calculate p95 latency
      let p95Latency = 0;
      if (stats.latencies.length > 0) {
        const sorted = [...stats.latencies].sort((a, b) => a - b);
        const p95Index = Math.floor(sorted.length * 0.95);
        p95Latency = sorted[p95Index] || sorted[sorted.length - 1];
      }

      // Calculate trend
      const prevCount = prevEndpointCounts.get(key) || 0;
      let trend = '0%';
      if (prevCount > 0) {
        const change = ((stats.requests - prevCount) / prevCount) * 100;
        trend = `${change >= 0 ? '+' : ''}${change.toFixed(0)}%`;
      } else if (stats.requests > 0) {
        trend = '+100%';
      }

      endpointStats.push({
        endpoint: stats.endpoint,
        method: stats.method,
        requests_count: stats.requests,
        requests_percent: totalRequests > 0 
          ? Math.round((stats.requests / totalRequests) * 100) 
          : 0,
        success_count: stats.successes,
        error_count: stats.errors,
        error_rate_percent: stats.requests > 0
          ? Math.round((stats.errors / stats.requests) * 100 * 100) / 100
          : 0,
        avg_latency_ms: avgLatency,
        p95_latency_ms: p95Latency,
        total_cost: Math.round(stats.totalCost * 100) / 100,
        trend,
        last_request_at: stats.lastRequest,
      });
    }

    // Sort by request count descending
    endpointStats.sort((a, b) => b.requests_count - a.requests_count);

    return sendSuccess(res, {
      range,
      total_requests: totalRequests,
      unique_endpoints: endpointStats.length,
      endpoints: endpointStats,
    });

  } catch (error) {
    return sendServerError(res, error);
  }
}

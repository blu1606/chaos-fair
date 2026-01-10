/**
 * Analytics Usage API Endpoint
 * GET /api/analytics/usage - Get time-series usage data
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth, AuthenticatedRequest } from '../lib/auth';
import { sendSuccess, sendError, sendBadRequest } from '../lib/response';
import { getSupabaseAdmin } from '../lib/supabase';

// Types
interface UsageDataPoint {
  date: string;
  requests: number;
  requests_success: number;
  requests_error: number;
  cost: number;
  average_latency_ms: number;
  top_endpoint: string | null;
}

interface UsageSummary {
  total_requests: number;
  total_requests_success: number;
  total_requests_error: number;
  total_cost: number;
  average_requests_per_day: number;
  average_latency_ms: number;
  error_rate_percent: number;
}

interface UsageResponse {
  range: string;
  granularity: string;
  data: UsageDataPoint[];
  summary: UsageSummary;
}

// Valid ranges and granularities
const VALID_RANGES = ['7d', '30d', '90d'] as const;
const VALID_GRANULARITIES = ['hourly', 'daily', 'weekly'] as const;

type Range = typeof VALID_RANGES[number];
type Granularity = typeof VALID_GRANULARITIES[number];

// Get date range from range parameter
function getDateRange(range: Range): { startDate: Date; endDate: Date } {
  const endDate = new Date();
  const startDate = new Date();
  
  switch (range) {
    case '7d':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(startDate.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(startDate.getDate() - 90);
      break;
  }
  
  // Set to start of day
  startDate.setHours(0, 0, 0, 0);
  
  return { startDate, endDate };
}

// Get number of days in range
function getDaysInRange(range: Range): number {
  switch (range) {
    case '7d': return 7;
    case '30d': return 30;
    case '90d': return 90;
  }
}

async function handler(
  req: AuthenticatedRequest,
  res: VercelResponse
) {
  if (req.method !== 'GET') {
    return sendError(res, 'Method not allowed', 405);
  }

  try {
    const userId = req.userId!;
    const supabase = getSupabaseAdmin();

    // Parse query parameters
    const range = (req.query.range as string || '30d') as Range;
    const granularity = (req.query.granularity as string || 'daily') as Granularity;

    // Validate parameters
    if (!VALID_RANGES.includes(range)) {
      return sendBadRequest(res, `Invalid range. Must be one of: ${VALID_RANGES.join(', ')}`);
    }

    if (!VALID_GRANULARITIES.includes(granularity)) {
      return sendBadRequest(res, `Invalid granularity. Must be one of: ${VALID_GRANULARITIES.join(', ')}`);
    }

    const { startDate, endDate } = getDateRange(range);
    const daysInRange = getDaysInRange(range);

    // Try to get data from analytics_daily first (cached/aggregated)
    const { data: analyticsData, error: analyticsError } = await supabase
      .from('analytics_daily')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('date', { ascending: true });

    let dataPoints: UsageDataPoint[] = [];

    if (analyticsData && analyticsData.length > 0) {
      // Use cached analytics data
      dataPoints = analyticsData.map(row => ({
        date: row.date,
        requests: row.total_requests || 0,
        requests_success: row.total_requests_success || 0,
        requests_error: row.total_requests_error || 0,
        cost: row.total_cost || 0,
        average_latency_ms: row.average_latency_ms || 0,
        top_endpoint: row.top_endpoint || null,
      }));
    } else {
      // Fall back to aggregating from request_logs
      const { data: logsData, error: logsError } = await supabase
        .from('request_logs')
        .select('created_at, response_status, response_time_ms, cost_credits, endpoint')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true });

      if (logsError) {
        console.error('Error fetching request logs:', logsError);
        return sendError(res, 'Failed to fetch analytics data', 500);
      }

      // Group by date
      const groupedData = new Map<string, {
        requests: number;
        success: number;
        error: number;
        cost: number;
        latencySum: number;
        endpoints: Map<string, number>;
      }>();

      // Initialize all dates in range
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const dateKey = currentDate.toISOString().split('T')[0];
        groupedData.set(dateKey, {
          requests: 0,
          success: 0,
          error: 0,
          cost: 0,
          latencySum: 0,
          endpoints: new Map(),
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Aggregate logs
      for (const log of logsData || []) {
        const dateKey = new Date(log.created_at).toISOString().split('T')[0];
        const group = groupedData.get(dateKey);
        
        if (group) {
          group.requests++;
          if (log.response_status < 400) {
            group.success++;
          } else {
            group.error++;
          }
          group.cost += log.cost_credits || 0;
          group.latencySum += log.response_time_ms || 0;
          
          // Track endpoint counts
          const endpoint = log.endpoint || 'unknown';
          group.endpoints.set(endpoint, (group.endpoints.get(endpoint) || 0) + 1);
        }
      }

      // Convert to data points
      dataPoints = Array.from(groupedData.entries()).map(([date, group]) => {
        // Find top endpoint
        let topEndpoint: string | null = null;
        let maxCount = 0;
        for (const [endpoint, count] of group.endpoints) {
          if (count > maxCount) {
            maxCount = count;
            topEndpoint = endpoint;
          }
        }

        return {
          date,
          requests: group.requests,
          requests_success: group.success,
          requests_error: group.error,
          cost: Math.round(group.cost * 100) / 100,
          average_latency_ms: group.requests > 0 
            ? Math.round(group.latencySum / group.requests) 
            : 0,
          top_endpoint: topEndpoint,
        };
      });

      // Apply weekly aggregation if requested
      if (granularity === 'weekly') {
        const weeklyData = new Map<string, UsageDataPoint>();
        
        for (const point of dataPoints) {
          const date = new Date(point.date);
          // Get the Monday of the week
          const monday = new Date(date);
          monday.setDate(date.getDate() - date.getDay() + 1);
          const weekKey = monday.toISOString().split('T')[0];
          
          const existing = weeklyData.get(weekKey);
          if (existing) {
            existing.requests += point.requests;
            existing.requests_success += point.requests_success;
            existing.requests_error += point.requests_error;
            existing.cost += point.cost;
            // Recalculate average (weighted)
            const totalRequests = existing.requests;
            existing.average_latency_ms = totalRequests > 0
              ? Math.round((existing.average_latency_ms * (totalRequests - point.requests) + point.average_latency_ms * point.requests) / totalRequests)
              : 0;
          } else {
            weeklyData.set(weekKey, { ...point, date: weekKey });
          }
        }
        
        dataPoints = Array.from(weeklyData.values());
      }
    }

    // Calculate summary statistics
    const totalRequests = dataPoints.reduce((sum, d) => sum + d.requests, 0);
    const totalSuccess = dataPoints.reduce((sum, d) => sum + d.requests_success, 0);
    const totalError = dataPoints.reduce((sum, d) => sum + d.requests_error, 0);
    const totalCost = dataPoints.reduce((sum, d) => sum + d.cost, 0);
    const totalLatencySum = dataPoints.reduce((sum, d) => sum + (d.average_latency_ms * d.requests), 0);

    const summary: UsageSummary = {
      total_requests: totalRequests,
      total_requests_success: totalSuccess,
      total_requests_error: totalError,
      total_cost: Math.round(totalCost * 100) / 100,
      average_requests_per_day: Math.round((totalRequests / daysInRange) * 100) / 100,
      average_latency_ms: totalRequests > 0 
        ? Math.round(totalLatencySum / totalRequests) 
        : 0,
      error_rate_percent: totalRequests > 0 
        ? Math.round((totalError / totalRequests) * 10000) / 100 
        : 0,
    };

    const response: UsageResponse = {
      range,
      granularity,
      data: dataPoints,
      summary,
    };

    return sendSuccess(res, response);

  } catch (error) {
    console.error('Analytics usage error:', error);
    return sendError(res, 'Internal server error', 500);
  }
}

export default withAuth(handler);

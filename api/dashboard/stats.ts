/**
 * Dashboard Stats Endpoint
 * GET /api/dashboard/stats
 * 
 * Returns aggregated dashboard statistics for authenticated users
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCors } from '../lib/cors';
import { verifyAuth } from '../lib/auth';
import { sendSuccess, sendError, sendServerError, sendUnauthorized } from '../lib/response';
import { supabaseAdmin } from '../lib/supabase';
import type { DashboardStatsData } from '../lib/types';

// Helper functions
const getLatencyStatus = (p99: number): 'optimal' | 'warning' | 'critical' => {
  if (p99 < 100) return 'optimal';
  if (p99 < 500) return 'warning';
  return 'critical';
};

const calculateTrend = (current: number, previous: number): string => {
  if (previous === 0) return current > 0 ? '+100%' : '0%';
  const change = ((current - previous) / previous) * 100;
  return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
};

const daysBetween = (date1: Date, date2: Date): number => {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  if (handleCors(res, req.method || '')) return;

  // Only allow GET
  if (req.method !== 'GET') {
    return sendError(res, 'Method not allowed', 405);
  }

  // Verify authentication
  const { user, error: authError } = await verifyAuth(req);
  if (!user) {
    return sendUnauthorized(res, authError || 'Unauthorized');
  }

  try {
    const userId = user.id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Parallel queries
    const [
      profileResult,
      accountResult,
      apiKeysResult,
      thisMonthRequestsResult,
      lastMonthRequestsResult,
      latencyResult,
      notificationsResult,
    ] = await Promise.all([
      // User profile
      supabaseAdmin
        .from('profiles')
        .select('name, avatar_url')
        .eq('user_id', userId)
        .single(),

      // Account info
      supabaseAdmin
        .from('accounts')
        .select('plan_type, credit_balance, credit_limit')
        .eq('user_id', userId)
        .single(),

      // API keys
      supabaseAdmin
        .from('api_keys')
        .select('id, name, status, expires_at')
        .eq('user_id', userId),

      // This month's requests
      supabaseAdmin
        .from('request_logs')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', startOfMonth.toISOString()),

      // Last month's requests
      supabaseAdmin
        .from('request_logs')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', startOfLastMonth.toISOString())
        .lte('created_at', endOfLastMonth.toISOString()),

      // Latency stats (last 24h)
      supabaseAdmin
        .from('request_logs')
        .select('response_time_ms')
        .eq('user_id', userId)
        .gte('created_at', new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString())
        .order('response_time_ms', { ascending: true }),

      // Unread notifications
      supabaseAdmin
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false),
    ]);

    // Process results
    const profile = profileResult.data;
    const account = accountResult.data;
    const apiKeys = apiKeysResult.data || [];
    const thisMonthRequests = thisMonthRequestsResult.count || 0;
    const lastMonthRequests = lastMonthRequestsResult.count || 0;
    const latencyData = latencyResult.data || [];
    const unreadNotifications = notificationsResult.count || 0;

    // Calculate latency metrics
    const latencies = latencyData.map(l => l.response_time_ms).filter(Boolean);
    const avgLatency = latencies.length > 0
      ? latencies.reduce((a, b) => a + b, 0) / latencies.length
      : 0;
    const p99Index = Math.floor(latencies.length * 0.99);
    const p99Latency = latencies[p99Index] || avgLatency;

    // Process API keys
    const activeKeys = apiKeys.filter(k => k.status === 'active');
    const expiringKeys = activeKeys
      .filter(k => k.expires_at)
      .map(k => ({
        id: k.id,
        name: k.name,
        expires_in_days: daysBetween(now, new Date(k.expires_at!)),
      }))
      .filter(k => k.expires_in_days <= 30)
      .sort((a, b) => a.expires_in_days - b.expires_in_days);

    // Calculate credits
    const creditBalance = account?.credit_balance || 0;
    const creditLimit = account?.credit_limit || 10000;
    const creditsUsed = creditLimit - creditBalance;
    const usagePercent = Math.round((creditsUsed / creditLimit) * 100);

    // Generate warnings
    const warnings: string[] = [];
    if (activeKeys.length === 0) {
      warnings.push('No active API keys. Create one to start using the API.');
    }
    if (expiringKeys.length > 0) {
      warnings.push(`${expiringKeys.length} API key(s) expiring within 30 days.`);
    }
    if (usagePercent >= 90) {
      warnings.push('Credit usage above 90%. Consider upgrading your plan.');
    }

    const responseData: DashboardStatsData = {
      user: {
        name: profile?.name || user.email.split('@')[0],
        avatar_url: profile?.avatar_url || null,
        plan_type: account?.plan_type || 'free',
      },
      api_metrics: {
        total_requests: thisMonthRequests,
        requests_trend: calculateTrend(thisMonthRequests, lastMonthRequests),
        requests_this_month: thisMonthRequests,
        requests_last_month: lastMonthRequests,
      },
      performance: {
        average_latency_ms: Math.round(avgLatency),
        latency_status: getLatencyStatus(p99Latency),
        latency_min: latencies.length > 0 ? Math.min(...latencies) : 0,
        latency_max: latencies.length > 0 ? Math.max(...latencies) : 0,
        p99_latency_ms: Math.round(p99Latency),
      },
      credits: {
        available_credits: creditBalance,
        used_this_month: creditsUsed,
        plan_limit: creditLimit,
        usage_percent: usagePercent,
        auto_refill_enabled: false,
      },
      keys: {
        active_keys_count: activeKeys.length,
        nearest_key_expiry_days: expiringKeys[0]?.expires_in_days || null,
        expiring_keys: expiringKeys,
      },
      alerts: {
        unread_notifications: unreadNotifications,
        warnings,
      },
    };

    return sendSuccess(res, responseData);
  } catch (error) {
    return sendServerError(res, error);
  }
}

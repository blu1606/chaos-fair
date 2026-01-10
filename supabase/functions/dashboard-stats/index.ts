import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DashboardStatsResponse {
  status: "success" | "error";
  timestamp: string;
  data?: {
    user: {
      name: string;
      avatar_url: string | null;
      plan_type: string;
    };
    api_metrics: {
      total_requests: number;
      requests_trend: string;
      requests_this_month: number;
      requests_last_month: number;
    };
    performance: {
      average_latency_ms: number;
      latency_status: "optimal" | "warning" | "critical";
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
      expiring_keys: Array<{
        id: string;
        name: string;
        expires_at: string;
        days_until_expiry: number;
      }>;
    };
    alerts: {
      unread_notifications: number;
      warnings: string[];
    };
  };
  error?: string;
}

function getLatencyStatus(p99: number): "optimal" | "warning" | "critical" {
  if (p99 < 100) return "optimal";
  if (p99 <= 300) return "warning";
  return "critical";
}

function calculateTrend(current: number, previous: number): string {
  if (previous === 0) return current > 0 ? "+100%" : "0%";
  const change = ((current - previous) / previous) * 100;
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(1)}%`;
}

function daysBetween(date1: Date, date2: Date): number {
  const diffTime = date2.getTime() - date1.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Extract JWT from Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({
          status: "error",
          timestamp: new Date().toISOString(),
          error: "Missing or invalid Authorization header",
        }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    // Initialize Supabase client with user's JWT
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    // Verify user and get user ID
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({
          status: "error",
          timestamp: new Date().toISOString(),
          error: "Invalid or expired token",
        }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = user.id;
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Run all queries in parallel for performance
    const [
      profileResult,
      accountResult,
      apiKeysResult,
      thisMonthRequestsResult,
      lastMonthRequestsResult,
      latencyStatsResult,
      notificationsResult,
    ] = await Promise.all([
      // 1. Get user profile
      supabase
        .from("profiles")
        .select("name, avatar_url, plan_type")
        .eq("id", userId)
        .single(),

      // 2. Get account/credits info
      supabase
        .from("accounts")
        .select("available_credits, used_credits, plan_limit, auto_refill_enabled")
        .eq("user_id", userId)
        .single(),

      // 3. Get active API keys with expiry
      supabase
        .from("api_keys")
        .select("id, name, expires_at, status")
        .eq("user_id", userId)
        .eq("status", "active"),

      // 4. Get this month's request count
      supabase
        .from("request_logs")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("created_at", startOfThisMonth.toISOString()),

      // 5. Get last month's request count
      supabase
        .from("request_logs")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("created_at", startOfLastMonth.toISOString())
        .lte("created_at", endOfLastMonth.toISOString()),

      // 6. Get latency stats from last 30 days
      supabase
        .from("request_logs")
        .select("response_time_ms")
        .eq("user_id", userId)
        .gte("created_at", thirtyDaysAgo.toISOString())
        .not("response_time_ms", "is", null)
        .order("response_time_ms", { ascending: true }),

      // 7. Get unread notifications count
      supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("read", false),
    ]);

    // Check for profile - required
    if (profileResult.error || !profileResult.data) {
      return new Response(
        JSON.stringify({
          status: "error",
          timestamp: new Date().toISOString(),
          error: "User profile not found",
        }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const profile = profileResult.data;
    const account = accountResult.data;
    const apiKeys = apiKeysResult.data || [];
    const requestsThisMonth = thisMonthRequestsResult.count || 0;
    const requestsLastMonth = lastMonthRequestsResult.count || 0;
    const latencyData = latencyStatsResult.data || [];
    const unreadNotifications = notificationsResult.count || 0;

    // Calculate latency statistics
    let avgLatency = 0;
    let minLatency = 0;
    let maxLatency = 0;
    let p99Latency = 0;

    if (latencyData.length > 0) {
      const latencies = latencyData.map((r) => r.response_time_ms).filter((v): v is number => v !== null);
      if (latencies.length > 0) {
        avgLatency = Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length);
        minLatency = latencies[0];
        maxLatency = latencies[latencies.length - 1];
        const p99Index = Math.floor(latencies.length * 0.99);
        p99Latency = latencies[p99Index] || maxLatency;
      }
    }

    // Calculate credits usage this month
    const usedThisMonth = account?.used_credits || 0;
    const availableCredits = account?.available_credits || 0;
    const planLimit = account?.plan_limit || 1000;
    const usagePercent = planLimit > 0 ? Math.round((usedThisMonth / planLimit) * 100) : 0;

    // Process API keys for expiry warnings
    const activeKeysCount = apiKeys.length;
    const expiringKeys = apiKeys
      .filter((key) => key.expires_at)
      .map((key) => {
        const expiresAt = new Date(key.expires_at);
        const daysUntilExpiry = daysBetween(now, expiresAt);
        return {
          id: key.id,
          name: key.name,
          expires_at: key.expires_at,
          days_until_expiry: daysUntilExpiry,
        };
      })
      .filter((key) => key.days_until_expiry <= 30)
      .sort((a, b) => a.days_until_expiry - b.days_until_expiry);

    const nearestKeyExpiryDays = expiringKeys.length > 0 ? expiringKeys[0].days_until_expiry : null;

    // Generate warnings
    const warnings: string[] = [];
    if (activeKeysCount === 0) {
      warnings.push("No API keys configured");
    }
    if (nearestKeyExpiryDays !== null && nearestKeyExpiryDays <= 7) {
      warnings.push(`API key expires in ${nearestKeyExpiryDays} days`);
    }
    if (availableCredits < planLimit * 0.1) {
      warnings.push("Low credit balance");
    }

    // Build response
    const response: DashboardStatsResponse = {
      status: "success",
      timestamp: now.toISOString(),
      data: {
        user: {
          name: profile.name,
          avatar_url: profile.avatar_url,
          plan_type: profile.plan_type,
        },
        api_metrics: {
          total_requests: requestsThisMonth + requestsLastMonth,
          requests_trend: calculateTrend(requestsThisMonth, requestsLastMonth),
          requests_this_month: requestsThisMonth,
          requests_last_month: requestsLastMonth,
        },
        performance: {
          average_latency_ms: avgLatency,
          latency_status: getLatencyStatus(p99Latency),
          latency_min: minLatency,
          latency_max: maxLatency,
          p99_latency_ms: p99Latency,
        },
        credits: {
          available_credits: availableCredits,
          used_this_month: usedThisMonth,
          plan_limit: planLimit,
          usage_percent: usagePercent,
          auto_refill_enabled: account?.auto_refill_enabled || false,
        },
        keys: {
          active_keys_count: activeKeysCount,
          nearest_key_expiry_days: nearestKeyExpiryDays,
          expiring_keys: expiringKeys.slice(0, 5), // Limit to 5 expiring keys
        },
        alerts: {
          unread_notifications: unreadNotifications,
          warnings,
        },
      },
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return new Response(
      JSON.stringify({
        status: "error",
        timestamp: new Date().toISOString(),
        error: "Internal server error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

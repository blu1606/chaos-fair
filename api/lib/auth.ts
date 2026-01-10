/**
 * Authentication utilities for Vercel Functions
 */

import type { VercelRequest } from '@vercel/node';
import { supabaseAdmin } from './supabase';
import crypto from 'crypto';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

export interface ApiKeyInfo {
  id: string;
  user_id: string;
  name: string;
  permissions: {
    read_randomness: boolean;
    write_randomness: boolean;
    read_usage: boolean;
    manage_keys: boolean;
    manage_billing: boolean;
  };
  rate_limit_rpm: number;
  rate_limit_rph: number;
  rate_limit_daily: number;
  status: string;
}

export interface AuthResult {
  user: AuthUser | null;
  error: string | null;
}

export interface ApiKeyAuthResult {
  apiKey: ApiKeyInfo | null;
  error: string | null;
  errorCode?: number;
}

// Import advanced rate limiter
import { getRateLimiter, checkRateLimitAdvanced, type RateLimitConfig, type RateLimitResult } from './rateLimit';

/**
 * Hash API key for lookup
 */
const hashApiKey = (key: string): string => {
  return crypto.createHash('sha256').update(key).digest('hex');
};

/**
 * Simple rate limit check (RPM only) - backward compatible
 */
export const checkRateLimit = (
  apiKeyId: string,
  limitRpm: number
): { allowed: boolean; retryAfter?: number } => {
  const limiter = getRateLimiter();
  // Use sync-like behavior with a cached result
  const now = Date.now();
  const minute = Math.floor(now / 60000);
  const key = `rate:${apiKeyId}:${minute}`;
  
  // For backward compatibility, use simple in-memory check
  const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
  const entry = rateLimitStore.get(key);
  
  if (!entry || entry.resetAt < now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + 60000 });
    return { allowed: true };
  }
  
  if (entry.count >= limitRpm) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }
  
  entry.count++;
  return { allowed: true };
};

/**
 * Advanced rate limit check with RPM, RPH, and daily limits
 */
export const checkAdvancedRateLimit = async (
  apiKeyId: string,
  config: RateLimitConfig
): Promise<RateLimitResult> => {
  return checkRateLimitAdvanced(apiKeyId, config);
};

/**
 * Verify API key from Authorization header (for external API calls)
 */
export const verifyApiKey = async (req: VercelRequest): Promise<ApiKeyAuthResult> => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    return { apiKey: null, error: 'Missing or invalid Authorization header', errorCode: 401 };
  }
  
  const token = authHeader.replace('Bearer ', '');
  
  // Check if it's an API key (starts with kaos_) or JWT
  if (!token.startsWith('kaos_')) {
    return { apiKey: null, error: 'Invalid API key format', errorCode: 401 };
  }
  
  try {
    const keyHash = hashApiKey(token);
    
    // Look up API key by hash
    const { data: apiKey, error } = await supabaseAdmin
      .from('api_keys')
      .select('id, user_id, name, permissions, rate_limit_rpm, rate_limit_rph, rate_limit_daily, status, expires_at')
      .eq('key_hash', keyHash)
      .single();
    
    if (error || !apiKey) {
      return { apiKey: null, error: 'Invalid API key', errorCode: 401 };
    }
    
    // Check if key is active
    if (apiKey.status !== 'active') {
      return { apiKey: null, error: 'API key has been revoked or expired', errorCode: 401 };
    }
    
    // Check expiry
    if (apiKey.expires_at && new Date(apiKey.expires_at) < new Date()) {
      // Update status to expired
      await supabaseAdmin
        .from('api_keys')
        .update({ status: 'expired' })
        .eq('id', apiKey.id);
      
      return { apiKey: null, error: 'API key has expired', errorCode: 401 };
    }
    
    // Update last_used_at
    await supabaseAdmin
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', apiKey.id);
    
    return {
      apiKey: {
        id: apiKey.id,
        user_id: apiKey.user_id,
        name: apiKey.name,
        permissions: apiKey.permissions || {
          read_randomness: true,
          write_randomness: false,
          read_usage: false,
          manage_keys: false,
          manage_billing: false,
        },
        rate_limit_rpm: apiKey.rate_limit_rpm || 100,
        rate_limit_rph: apiKey.rate_limit_rph || 5000,
        rate_limit_daily: apiKey.rate_limit_daily || 100000,
        status: apiKey.status,
      },
      error: null,
    };
  } catch (err) {
    console.error('API key verification error:', err);
    return { apiKey: null, error: 'API key verification failed', errorCode: 500 };
  }
};

/**
 * Verify JWT token from Authorization header (for dashboard/web app)
 */
export const verifyAuth = async (req: VercelRequest): Promise<AuthResult> => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    return { user: null, error: 'Missing or invalid Authorization header' };
  }
  
  const token = authHeader.replace('Bearer ', '');
  
  // If it's an API key, reject (use verifyApiKey instead)
  if (token.startsWith('kaos_')) {
    return { user: null, error: 'JWT required for this endpoint' };
  }
  
  try {
    // Use Supabase to verify the JWT
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !user) {
      return { user: null, error: error?.message || 'Invalid token' };
    }
    
    return {
      user: {
        id: user.id,
        email: user.email || '',
        role: user.role || 'authenticated',
      },
      error: null,
    };
  } catch (err) {
    return { user: null, error: 'Token verification failed' };
  }
};

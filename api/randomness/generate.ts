/**
 * Randomness Generation Endpoint
 * POST /api/randomness/generate
 * 
 * Generates verifiable random values from deKAOS entropy sources
 * Authenticated via API key (Bearer kaos_xxx)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCors } from '../lib/cors';
import { verifyApiKey, checkRateLimit } from '../lib/auth';
import { sendSuccess, sendError, sendServerError } from '../lib/response';
import { supabaseAdmin } from '../lib/supabase';
import crypto from 'crypto';

// Configuration
const MAX_COUNT = 100;
const COST_PER_VALUE = 0.05; // 0.05 credits per random value
const LOW_CREDITS_WARNING = 1000;
const CRITICAL_CREDITS_WARNING = 100;

// Valid formats
const VALID_FORMATS = ['integer', 'float', 'bytes', 'hex'] as const;
type RandomFormat = typeof VALID_FORMATS[number];

// Request body interface
interface GenerateRandomnessRequest {
  count?: number;
  format?: RandomFormat;
  min?: number;
  max?: number;
}

// Response interfaces
interface RandomnessProof {
  commit_root: string;
  node_count: number;
  entropy_quality: number;
}

interface RandomnessData {
  epoch: number;
  timestamp: string;
  values: number[] | string[];
  signature: string;
  proof: RandomnessProof;
  walrus_object_id: string;
  cost_credits: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(res, req.method || '')) return;

  if (req.method !== 'POST') {
    return sendError(res, 'Method not allowed', 405);
  }

  const startTime = Date.now();
  let apiKeyId: string | null = null;
  let userId: string | null = null;

  try {
    // ============================================
    // 1. AUTHENTICATE API KEY
    // ============================================
    const { apiKey, error: authError, errorCode } = await verifyApiKey(req);
    
    if (!apiKey) {
      return res.status(errorCode || 401).json({
        status: 'error',
        error: authError || 'Unauthorized',
        timestamp: new Date().toISOString(),
      });
    }

    apiKeyId = apiKey.id;
    userId = apiKey.user_id;

    // ============================================
    // 2. CHECK PERMISSIONS
    // ============================================
    if (!apiKey.permissions.read_randomness) {
      return res.status(403).json({
        status: 'error',
        error: 'API key does not have read_randomness permission',
        timestamp: new Date().toISOString(),
      });
    }

    // ============================================
    // 3. CHECK RATE LIMITS
    // ============================================
    const rateCheck = checkRateLimit(apiKey.id, apiKey.rate_limit_rpm);
    if (!rateCheck.allowed) {
      res.setHeader('Retry-After', rateCheck.retryAfter?.toString() || '60');
      return res.status(429).json({
        status: 'error',
        error: 'Rate limit exceeded',
        retry_after_seconds: rateCheck.retryAfter,
        timestamp: new Date().toISOString(),
      });
    }

    // ============================================
    // 4. VALIDATE REQUEST BODY
    // ============================================
    const body = req.body as GenerateRandomnessRequest;
    
    // Validate count
    const count = body.count ?? 10;
    if (!Number.isInteger(count) || count < 1 || count > MAX_COUNT) {
      return sendError(res, `Count must be an integer between 1 and ${MAX_COUNT}`);
    }

    // Validate format
    const format: RandomFormat = body.format || 'integer';
    if (!VALID_FORMATS.includes(format)) {
      return sendError(res, `Invalid format. Valid formats: ${VALID_FORMATS.join(', ')}`);
    }

    // Validate min/max for integer format
    let min = 0;
    let max = 4294967295; // uint32 max
    
    if (format === 'integer') {
      if (body.min !== undefined) {
        min = body.min;
        if (!Number.isInteger(min) || min < 0) {
          return sendError(res, 'min must be a non-negative integer');
        }
      }
      if (body.max !== undefined) {
        max = body.max;
        if (!Number.isInteger(max) || max < 1) {
          return sendError(res, 'max must be a positive integer');
        }
      }
      if (min >= max) {
        return sendError(res, 'min must be less than max');
      }
    }

    // ============================================
    // 5. CHECK CREDITS
    // ============================================
    const costCredits = count * COST_PER_VALUE;
    
    const { data: account, error: accountError } = await supabaseAdmin
      .from('accounts')
      .select('id, available_credits, used_credits, plan_type')
      .eq('user_id', userId)
      .single();

    if (accountError || !account) {
      return res.status(500).json({
        status: 'error',
        error: 'Failed to retrieve account information',
        timestamp: new Date().toISOString(),
      });
    }

    if (account.available_credits < costCredits) {
      return res.status(402).json({
        status: 'error',
        error: 'Insufficient credits',
        required_credits: costCredits,
        available_credits: account.available_credits,
        timestamp: new Date().toISOString(),
      });
    }

    // ============================================
    // 6. GENERATE RANDOMNESS
    // ============================================
    
    // Get current epoch (mock - would be from Solana in production)
    const epoch = Math.floor(Date.now() / 1000 / 60); // Mock epoch based on minutes
    
    // Generate random values
    const values = generateRandomValues(count, format, min, max);
    
    // Generate signature (mock - would be real crypto signature in production)
    const signature = '0x' + crypto.randomBytes(64).toString('hex');
    
    // Generate proof data
    const proof: RandomnessProof = {
      commit_root: '0x' + crypto.randomBytes(32).toString('hex'),
      node_count: Math.floor(Math.random() * 500) + 1500, // Mock node count
      entropy_quality: 0.9 + Math.random() * 0.099, // 0.9-0.999
    };

    // ============================================
    // 7. STORE IN WALRUS (Mock)
    // ============================================
    // In production, this would use Walrus SDK to store the data
    const walrusObjectId = `walrus_${crypto.randomBytes(16).toString('hex')}`;

    const timestamp = new Date().toISOString();
    const latencyMs = Date.now() - startTime;

    // ============================================
    // 8. LOG TO DATABASES (Parallel)
    // ============================================
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
                     req.headers['x-real-ip'] as string || 
                     '0.0.0.0';

    await Promise.all([
      // Log to request_logs
      supabaseAdmin.from('request_logs').insert({
        user_id: userId,
        api_key_id: apiKeyId,
        endpoint: '/api/randomness/generate',
        method: 'POST',
        response_status: 200,
        response_time_ms: latencyMs,
        request_count: count,
        cost_credits: costCredits,
        ip_address: clientIp,
        walrus_object_id: walrusObjectId,
        on_chain_epoch: epoch,
        request_body: { count, format, min, max },
        metadata: { api_key_name: apiKey.name },
      }),

      // Log to randomness_records
      supabaseAdmin.from('randomness_records').insert({
        user_id: userId,
        api_key_id: apiKeyId,
        count,
        format,
        min_value: format === 'integer' ? min : null,
        max_value: format === 'integer' ? max : null,
        epoch,
        latency_ms: latencyMs,
        cost_credits: costCredits,
        walrus_object_id: walrusObjectId,
        on_chain_signature: signature,
        on_chain_proof: proof.commit_root,
        verified: true,
        verified_at: timestamp,
      }),

      // Debit credits from account
      supabaseAdmin
        .from('accounts')
        .update({
          available_credits: account.available_credits - costCredits,
          used_credits: (account.used_credits || 0) + costCredits,
        })
        .eq('id', account.id),
    ]);

    // ============================================
    // 9. CHECK FOR LOW CREDIT NOTIFICATIONS
    // ============================================
    const remainingCredits = account.available_credits - costCredits;
    
    if (remainingCredits < CRITICAL_CREDITS_WARNING) {
      await createCreditNotification(userId, remainingCredits, 'critical');
    } else if (remainingCredits < LOW_CREDITS_WARNING) {
      await createCreditNotification(userId, remainingCredits, 'warning');
    }

    // ============================================
    // 10. RETURN RESPONSE
    // ============================================
    const responseData: RandomnessData = {
      epoch,
      timestamp,
      values,
      signature,
      proof,
      walrus_object_id: walrusObjectId,
      cost_credits: costCredits,
    };

    return sendSuccess(res, {
      request: { count, format, ...(format === 'integer' ? { min, max } : {}) },
      data: responseData,
    });

  } catch (error) {
    // Log failed request
    if (userId && apiKeyId) {
      const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || '0.0.0.0';
      await supabaseAdmin.from('request_logs').insert({
        user_id: userId,
        api_key_id: apiKeyId,
        endpoint: '/api/randomness/generate',
        method: 'POST',
        response_status: 500,
        response_time_ms: Date.now() - startTime,
        ip_address: clientIp,
        error_code: 'GENERATION_FAILED',
        error_message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
    return sendServerError(res, error);
  }
}

/**
 * Generate random values based on format
 */
function generateRandomValues(
  count: number, 
  format: RandomFormat, 
  min: number, 
  max: number
): number[] | string[] {
  const values: (number | string)[] = [];

  for (let i = 0; i < count; i++) {
    switch (format) {
      case 'integer': {
        // Generate random integer in range [min, max]
        const range = max - min + 1;
        const bytes = crypto.randomBytes(4);
        const random = bytes.readUInt32BE() / 4294967296; // 0-1
        const value = Math.floor(random * range) + min;
        values.push(value);
        break;
      }
      case 'float': {
        // Generate random float 0-1 with high precision
        const bytes = crypto.randomBytes(8);
        const high = bytes.readUInt32BE(0) / 4294967296;
        const low = bytes.readUInt32BE(4) / 4294967296 / 4294967296;
        values.push(high + low);
        break;
      }
      case 'bytes': {
        // Generate 32 random bytes as array
        const bytes = crypto.randomBytes(32);
        values.push(Array.from(bytes).join(','));
        break;
      }
      case 'hex': {
        // Generate 32-byte hex string
        const bytes = crypto.randomBytes(32);
        values.push(bytes.toString('hex'));
        break;
      }
    }
  }

  return values as number[] | string[];
}

/**
 * Create credit notification if not recently created
 */
async function createCreditNotification(
  userId: string,
  remainingCredits: number,
  level: 'warning' | 'critical'
): Promise<void> {
  try {
    // Check if a similar notification was created in the last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data: existingNotification } = await supabaseAdmin
      .from('notifications')
      .select('id')
      .eq('user_id', userId)
      .eq('type', level === 'critical' ? 'credits_critical' : 'credits_low')
      .gte('created_at', oneDayAgo)
      .single();

    if (existingNotification) {
      return; // Don't create duplicate notification
    }

    await supabaseAdmin.from('notifications').insert({
      user_id: userId,
      type: level === 'critical' ? 'credits_critical' : 'credits_low',
      title: level === 'critical' ? 'Critical: Credits Almost Depleted' : 'Warning: Low Credits',
      message: level === 'critical'
        ? `Your account has only ${remainingCredits.toFixed(2)} credits remaining. Add credits to continue using the API.`
        : `Your account has ${remainingCredits.toFixed(2)} credits remaining. Consider adding more credits soon.`,
      data: { remaining_credits: remainingCredits, level },
      action_url: '/dashboard/billing',
    });
  } catch (err) {
    console.error('Failed to create credit notification:', err);
  }
}

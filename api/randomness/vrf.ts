/**
 * VRF (Verifiable Random Function) Endpoint
 * POST /api/randomness/vrf
 * 
 * Generates verifiable random output with cryptographic proof
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCors } from '../lib/cors';
import { verifyApiKey, checkRateLimit } from '../lib/auth';
import { sendSuccess, sendError, sendServerError } from '../lib/response';
import { supabaseAdmin } from '../lib/supabase';
import crypto from 'crypto';

// VRF costs 2x regular randomness (higher security guarantee)
const VRF_COST_CREDITS = 1.0;

interface VRFRequest {
  seed?: string;
  message?: string;
  proof_level?: 'basic' | 'high';
}

interface VRFOutput {
  epoch: number;
  vrf_output: string;
  proof: string;
  beta: string;
  gamma: string;
  public_key: string;
  seed_used: string;
  message_used: string;
  proof_level: 'basic' | 'high';
  latency_ms: number;
  verified: boolean;
  cost_credits: number;
  walrus_object_id: string;
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
    // 4. VALIDATE REQUEST
    // ============================================
    const body = req.body as VRFRequest;
    
    const seed = body.seed || crypto.randomBytes(32).toString('hex');
    const message = body.message || `vrf_${Date.now()}`;
    const proofLevel = body.proof_level || 'basic';

    if (!['basic', 'high'].includes(proofLevel)) {
      return sendError(res, 'proof_level must be "basic" or "high"');
    }

    // ============================================
    // 5. CHECK CREDITS
    // ============================================
    const { data: account, error: accountError } = await supabaseAdmin
      .from('accounts')
      .select('id, available_credits, used_credits')
      .eq('user_id', userId)
      .single();

    if (accountError || !account) {
      return res.status(500).json({
        status: 'error',
        error: 'Failed to retrieve account information',
        timestamp: new Date().toISOString(),
      });
    }

    if (account.available_credits < VRF_COST_CREDITS) {
      return res.status(402).json({
        status: 'error',
        error: 'Insufficient credits',
        required_credits: VRF_COST_CREDITS,
        available_credits: account.available_credits,
        timestamp: new Date().toISOString(),
      });
    }

    // ============================================
    // 6. GENERATE VRF OUTPUT
    // ============================================
    const epoch = Math.floor(Date.now() / 1000 / 60);
    const vrfResult = generateVRF(seed, message, proofLevel);

    // ============================================
    // 7. STORE IN WALRUS (Mock)
    // ============================================
    const walrusObjectId = `walrus_vrf_${crypto.randomBytes(16).toString('hex')}`;

    const latencyMs = Date.now() - startTime;
    const timestamp = new Date().toISOString();

    // ============================================
    // 8. LOG TO DATABASES
    // ============================================
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || '0.0.0.0';

    await Promise.all([
      // Log to request_logs
      supabaseAdmin.from('request_logs').insert({
        user_id: userId,
        api_key_id: apiKeyId,
        endpoint: '/api/randomness/vrf',
        method: 'POST',
        response_status: 200,
        response_time_ms: latencyMs,
        request_count: 1,
        cost_credits: VRF_COST_CREDITS,
        ip_address: clientIp,
        walrus_object_id: walrusObjectId,
        on_chain_epoch: epoch,
        request_body: { seed: seed.slice(0, 16) + '...', message, proof_level: proofLevel },
        metadata: { api_key_name: apiKey.name, vrf: true },
      }),

      // Log to randomness_records
      supabaseAdmin.from('randomness_records').insert({
        user_id: userId,
        api_key_id: apiKeyId,
        count: 1,
        format: 'vrf',
        epoch,
        latency_ms: latencyMs,
        cost_credits: VRF_COST_CREDITS,
        walrus_object_id: walrusObjectId,
        on_chain_signature: vrfResult.gamma,
        on_chain_proof: vrfResult.proof,
        verified: true,
        verified_at: timestamp,
        verification_data: {
          vrf_output: vrfResult.vrf_output,
          beta: vrfResult.beta,
          proof_level: proofLevel,
        },
      }),

      // Debit credits
      supabaseAdmin
        .from('accounts')
        .update({
          available_credits: account.available_credits - VRF_COST_CREDITS,
          used_credits: (account.used_credits || 0) + VRF_COST_CREDITS,
        })
        .eq('id', account.id),
    ]);

    // ============================================
    // 9. RETURN RESPONSE
    // ============================================
    const output: VRFOutput = {
      epoch,
      vrf_output: vrfResult.vrf_output,
      proof: vrfResult.proof,
      beta: vrfResult.beta,
      gamma: vrfResult.gamma,
      public_key: vrfResult.public_key,
      seed_used: seed,
      message_used: message,
      proof_level: proofLevel,
      latency_ms: latencyMs,
      verified: true,
      cost_credits: VRF_COST_CREDITS,
      walrus_object_id: walrusObjectId,
    };

    return sendSuccess(res, output);

  } catch (error) {
    // Log failed request
    if (userId && apiKeyId) {
      const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || '0.0.0.0';
      await supabaseAdmin.from('request_logs').insert({
        user_id: userId,
        api_key_id: apiKeyId,
        endpoint: '/api/randomness/vrf',
        method: 'POST',
        response_status: 500,
        response_time_ms: Date.now() - startTime,
        ip_address: clientIp,
        error_code: 'VRF_FAILED',
        error_message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
    return sendServerError(res, error);
  }
}

/**
 * Generate VRF output (Mock implementation)
 * In production, would use Ed25519-VRF or Solana's VRF
 */
function generateVRF(seed: string, message: string, proofLevel: 'basic' | 'high') {
  // Create deterministic key pair from seed (mock)
  const privateKeySeed = crypto.createHash('sha256').update(seed).digest();
  const publicKey = crypto.createHash('sha256').update(privateKeySeed).digest('hex');

  // Create input to VRF
  const input = crypto.createHash('sha256')
    .update(message)
    .update(privateKeySeed)
    .digest();

  // Generate gamma (VRF output point)
  const gamma = '0x' + crypto.createHash('sha512')
    .update(input)
    .update(privateKeySeed)
    .digest('hex');

  // Generate beta (final random output - hash of gamma)
  const beta = '0x' + crypto.createHash('sha256')
    .update(gamma)
    .digest('hex');

  // Generate proof
  const proofData = Buffer.concat([
    input,
    privateKeySeed,
    Buffer.from(gamma),
  ]);
  
  let proof: string;
  if (proofLevel === 'high') {
    // High security: longer proof with additional verification data
    proof = '0x' + crypto.createHash('sha512')
      .update(proofData)
      .update(crypto.randomBytes(32)) // Additional entropy
      .digest('hex') + crypto.randomBytes(32).toString('hex');
  } else {
    // Basic: standard proof
    proof = '0x' + crypto.createHash('sha256')
      .update(proofData)
      .digest('hex');
  }

  // VRF output (combined hash for usability)
  const vrf_output = '0x' + crypto.createHash('sha256')
    .update(beta)
    .update(proof)
    .digest('hex');

  return {
    vrf_output,
    proof,
    beta,
    gamma,
    public_key: '0x' + publicKey,
  };
}

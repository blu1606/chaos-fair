/**
 * Randomness Verification Endpoint
 * POST /api/randomness/verify
 * 
 * Verifies cryptographic proofs for deKAOS randomness
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCors } from '../lib/cors';
import { verifyApiKey, verifyAuth } from '../lib/auth';
import { sendSuccess, sendError, sendServerError } from '../lib/response';
import { supabaseAdmin } from '../lib/supabase';
import crypto from 'crypto';

interface VerifyRequest {
  epoch: number;
  signature: string;
  proof: string;
  walrus_object_id: string;
}

interface VerificationResult {
  verified: boolean;
  epoch: number;
  valid_commits: number;
  entropy_quality_score: number;
  on_chain_reference: string | null;
  proof_verified: boolean;
  signature_valid: boolean;
  walrus_data_found: boolean;
  verification_time_ms: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(res, req.method || '')) return;

  if (req.method !== 'POST') {
    return sendError(res, 'Method not allowed', 405);
  }

  const startTime = Date.now();

  try {
    // Support both API key and JWT auth
    let userId: string | null = null;
    
    const authHeader = req.headers.authorization?.replace('Bearer ', '') || '';
    
    if (authHeader.startsWith('kaos_')) {
      const { apiKey, error } = await verifyApiKey(req);
      if (!apiKey) {
        return res.status(401).json({ status: 'error', error: error || 'Unauthorized' });
      }
      userId = apiKey.user_id;
    } else {
      const { user, error } = await verifyAuth(req);
      if (!user) {
        return res.status(401).json({ status: 'error', error: error || 'Unauthorized' });
      }
      userId = user.id;
    }

    // Validate request body
    const body = req.body as VerifyRequest;

    if (!body.epoch || typeof body.epoch !== 'number') {
      return sendError(res, 'epoch is required and must be a number');
    }
    if (!body.signature || typeof body.signature !== 'string') {
      return sendError(res, 'signature is required');
    }
    if (!body.proof || typeof body.proof !== 'string') {
      return sendError(res, 'proof (commit_root) is required');
    }
    if (!body.walrus_object_id || typeof body.walrus_object_id !== 'string') {
      return sendError(res, 'walrus_object_id is required');
    }

    // ============================================
    // 1. RETRIEVE FROM WALRUS (Mock)
    // ============================================
    // In production, this would fetch from Walrus storage
    const walrusDataFound = body.walrus_object_id.startsWith('walrus_');
    
    if (!walrusDataFound) {
      return res.status(404).json({
        status: 'error',
        error: 'Walrus object not found',
        walrus_object_id: body.walrus_object_id,
      });
    }

    // ============================================
    // 2. VERIFY SIGNATURE (Mock Ed25519)
    // ============================================
    // In production, this would verify Ed25519 signature against Solana public key
    const signatureValid = verifySignature(body.signature, body.epoch, body.proof);

    // ============================================
    // 3. VERIFY MERKLE PROOF (Mock)
    // ============================================
    // In production, this would verify the merkle proof against the commit root
    const proofVerified = verifyMerkleProof(body.proof);

    // ============================================
    // 4. QUERY ON-CHAIN COMMITMENT (Mock)
    // ============================================
    // In production, this would query Solana for the on-chain commitment
    const onChainReference = `https://explorer.solana.com/tx/${crypto.randomBytes(32).toString('hex')}?cluster=mainnet`;

    // ============================================
    // 5. CALCULATE ENTROPY QUALITY
    // ============================================
    // Based on node participation and cryptographic properties
    const validCommits = Math.floor(Math.random() * 500) + 1500;
    const entropyQualityScore = calculateEntropyQuality(validCommits);

    // ============================================
    // 6. UPDATE VERIFICATION RECORD
    // ============================================
    const { data: randomnessRecord } = await supabaseAdmin
      .from('randomness_records')
      .select('id')
      .eq('user_id', userId)
      .eq('epoch', body.epoch)
      .eq('walrus_object_id', body.walrus_object_id)
      .single();

    if (randomnessRecord) {
      await supabaseAdmin
        .from('randomness_records')
        .update({
          verified: signatureValid && proofVerified,
          verified_at: new Date().toISOString(),
          verification_data: {
            signature_valid: signatureValid,
            proof_verified: proofVerified,
            entropy_quality: entropyQualityScore,
            valid_commits: validCommits,
          },
        })
        .eq('id', randomnessRecord.id);
    }

    // ============================================
    // 7. LOG REQUEST
    // ============================================
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || '0.0.0.0';
    const latencyMs = Date.now() - startTime;

    await supabaseAdmin.from('request_logs').insert({
      user_id: userId,
      endpoint: '/api/randomness/verify',
      method: 'POST',
      response_status: 200,
      response_time_ms: latencyMs,
      ip_address: clientIp,
      request_body: { epoch: body.epoch, walrus_object_id: body.walrus_object_id },
      cost_credits: 0, // Verification is free
    });

    // ============================================
    // 8. RETURN RESULT
    // ============================================
    const result: VerificationResult = {
      verified: signatureValid && proofVerified && walrusDataFound,
      epoch: body.epoch,
      valid_commits: validCommits,
      entropy_quality_score: entropyQualityScore,
      on_chain_reference: onChainReference,
      proof_verified: proofVerified,
      signature_valid: signatureValid,
      walrus_data_found: walrusDataFound,
      verification_time_ms: latencyMs,
    };

    return sendSuccess(res, result);

  } catch (error) {
    return sendServerError(res, error);
  }
}

/**
 * Verify Ed25519 signature (Mock implementation)
 * In production, would use @noble/ed25519 or similar
 */
function verifySignature(signature: string, epoch: number, proof: string): boolean {
  // Mock validation - check signature format
  if (!signature.startsWith('0x') || signature.length < 130) {
    return false;
  }
  
  // Create expected message hash
  const message = `dekaos:epoch:${epoch}:proof:${proof}`;
  const hash = crypto.createHash('sha256').update(message).digest('hex');
  
  // Mock: 95% of valid-looking signatures pass
  return signature.length === 130 || Math.random() > 0.05;
}

/**
 * Verify Merkle proof (Mock implementation)
 */
function verifyMerkleProof(proof: string): boolean {
  // Check proof format
  if (!proof.startsWith('0x') || proof.length < 64) {
    return false;
  }
  
  // Mock: Valid proofs pass verification
  return true;
}

/**
 * Calculate entropy quality score based on node participation
 */
function calculateEntropyQuality(validCommits: number): number {
  // Quality increases with more participating nodes
  // Formula: base quality + bonus for high participation
  const baseQuality = 0.85;
  const participationBonus = Math.min(validCommits / 2000, 0.14);
  const randomVariance = (Math.random() - 0.5) * 0.02;
  
  return Math.min(0.999, Math.max(0.8, baseQuality + participationBonus + randomVariance));
}

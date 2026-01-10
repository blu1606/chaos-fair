/**
 * API Keys Endpoint
 * GET /api/keys - List all API keys
 * POST /api/keys - Create new API key
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCors } from '../lib/cors';
import { verifyAuth } from '../lib/auth';
import { sendSuccess, sendError, sendServerError, sendUnauthorized } from '../lib/response';
import { supabaseAdmin } from '../lib/supabase';
import type { CreateApiKeyRequest } from '../lib/types';
import crypto from 'crypto';

// Generate a secure API key
const generateApiKey = (): string => {
  const randomBytes = crypto.randomBytes(32);
  const base64 = randomBytes.toString('base64url');
  return `dk_${base64}`;
};

// Hash API key for storage
const hashApiKey = (key: string): string => {
  return crypto.createHash('sha256').update(key).digest('hex');
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(res, req.method || '')) return;

  const { user, error: authError } = await verifyAuth(req);
  if (!user) {
    return sendUnauthorized(res, authError || 'Unauthorized');
  }

  try {
    switch (req.method) {
      case 'GET':
        return handleGetKeys(req, res, user.id);
      case 'POST':
        return handleCreateKey(req, res, user.id);
      default:
        return sendError(res, 'Method not allowed', 405);
    }
  } catch (error) {
    return sendServerError(res, error);
  }
}

// GET /api/keys
async function handleGetKeys(
  req: VercelRequest,
  res: VercelResponse,
  userId: string
) {
  const { data, error } = await supabaseAdmin
    .from('api_keys')
    .select('id, name, description, key_preview, status, rate_limit_rpm, rate_limit_daily, created_at, last_used_at, expires_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return sendSuccess(res, data || []);
}

// POST /api/keys
async function handleCreateKey(
  req: VercelRequest,
  res: VercelResponse,
  userId: string
) {
  const body = req.body as CreateApiKeyRequest;

  if (!body.name || body.name.trim().length === 0) {
    return sendError(res, 'Key name is required');
  }

  // Generate key
  const fullKey = generateApiKey();
  const keyHash = hashApiKey(fullKey);
  const keyPrefix = fullKey.slice(0, 8);
  const keyPreview = `${keyPrefix}****...${fullKey.slice(-4)}`;

  // Insert into database
  const { data, error } = await supabaseAdmin
    .from('api_keys')
    .insert({
      user_id: userId,
      name: body.name.trim(),
      description: body.description || null,
      key_hash: keyHash,
      key_prefix: keyPrefix,
      key_preview: keyPreview,
      rate_limit_rpm: body.rate_limit_rpm || 100,
      rate_limit_daily: body.rate_limit_daily || 10000,
      expires_at: body.expires_at || null,
      status: 'active',
    })
    .select('id, name, description, key_preview, status, rate_limit_rpm, rate_limit_daily, created_at, expires_at')
    .single();

  if (error) throw error;

  // Return full key only on creation (user must save it)
  return sendSuccess(res, {
    ...data,
    fullKey, // Only returned on creation!
  }, 201);
}

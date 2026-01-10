/**
 * Single API Key Endpoint
 * GET /api/keys/:id - Get key details
 * PATCH /api/keys/:id - Update key
 * DELETE /api/keys/:id - Revoke key
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCors } from '../lib/cors';
import { verifyAuth } from '../lib/auth';
import { sendSuccess, sendError, sendServerError, sendUnauthorized, sendNotFound } from '../lib/response';
import { supabaseAdmin } from '../lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(res, req.method || '')) return;

  const { user, error: authError } = await verifyAuth(req);
  if (!user) {
    return sendUnauthorized(res, authError || 'Unauthorized');
  }

  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return sendError(res, 'Key ID is required');
  }

  try {
    switch (req.method) {
      case 'GET':
        return handleGetKey(req, res, user.id, id);
      case 'PATCH':
        return handleUpdateKey(req, res, user.id, id);
      case 'DELETE':
        return handleRevokeKey(req, res, user.id, id);
      default:
        return sendError(res, 'Method not allowed', 405);
    }
  } catch (error) {
    return sendServerError(res, error);
  }
}

// GET /api/keys/:id
async function handleGetKey(
  req: VercelRequest,
  res: VercelResponse,
  userId: string,
  keyId: string
) {
  const { data, error } = await supabaseAdmin
    .from('api_keys')
    .select('id, name, description, key_preview, status, rate_limit_rpm, rate_limit_daily, created_at, last_used_at, expires_at')
    .eq('id', keyId)
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return sendNotFound(res, 'API key not found');
  }

  return sendSuccess(res, data);
}

// PATCH /api/keys/:id
async function handleUpdateKey(
  req: VercelRequest,
  res: VercelResponse,
  userId: string,
  keyId: string
) {
  const body = req.body as {
    name?: string;
    description?: string;
    rate_limit_rpm?: number;
    rate_limit_daily?: number;
  };

  // Build update object
  const updates: Record<string, unknown> = {};
  if (body.name) updates.name = body.name.trim();
  if (body.description !== undefined) updates.description = body.description;
  if (body.rate_limit_rpm) updates.rate_limit_rpm = body.rate_limit_rpm;
  if (body.rate_limit_daily) updates.rate_limit_daily = body.rate_limit_daily;

  if (Object.keys(updates).length === 0) {
    return sendError(res, 'No fields to update');
  }

  const { data, error } = await supabaseAdmin
    .from('api_keys')
    .update(updates)
    .eq('id', keyId)
    .eq('user_id', userId)
    .select('id, name, description, key_preview, status, rate_limit_rpm, rate_limit_daily, created_at, last_used_at, expires_at')
    .single();

  if (error || !data) {
    return sendNotFound(res, 'API key not found');
  }

  return sendSuccess(res, data);
}

// DELETE /api/keys/:id (Revoke, not hard delete)
async function handleRevokeKey(
  req: VercelRequest,
  res: VercelResponse,
  userId: string,
  keyId: string
) {
  const { data, error } = await supabaseAdmin
    .from('api_keys')
    .update({
      status: 'revoked',
      revoked_at: new Date().toISOString(),
    })
    .eq('id', keyId)
    .eq('user_id', userId)
    .select('id, status')
    .single();

  if (error || !data) {
    return sendNotFound(res, 'API key not found');
  }

  return sendSuccess(res, { message: 'API key revoked successfully', id: data.id });
}

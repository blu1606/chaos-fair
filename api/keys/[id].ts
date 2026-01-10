/**
 * Single API Key Endpoint
 * GET /api/keys/:id - Get key details
 * PATCH /api/keys/:id - Update key
 * PUT /api/keys/:id - Update key (alias)
 * DELETE /api/keys/:id - Revoke key
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCors } from '../lib/cors';
import { verifyAuth } from '../lib/auth';
import { sendSuccess, sendError, sendServerError, sendUnauthorized, sendNotFound } from '../lib/response';
import { supabaseAdmin } from '../lib/supabase';
import type { ApiKeyPermissions } from '../lib/types';

// Validate permissions object
const validatePermissions = (permissions: unknown): ApiKeyPermissions | null => {
  if (!permissions || typeof permissions !== 'object') {
    return null;
  }
  
  const p = permissions as Record<string, unknown>;
  const validKeys = ['read_randomness', 'write_randomness', 'read_usage', 'manage_keys', 'manage_billing'];
  
  for (const key of validKeys) {
    if (p[key] !== undefined && typeof p[key] !== 'boolean') {
      return null;
    }
  }
  
  return {
    read_randomness: p.read_randomness === true,
    write_randomness: p.write_randomness === true,
    read_usage: p.read_usage === true,
    manage_keys: p.manage_keys === true,
    manage_billing: p.manage_billing === true,
  };
};

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
        return handleGetKey(res, user.id, id);
      case 'PATCH':
      case 'PUT':
        return handleUpdateKey(req, res, user.id, id);
      case 'DELETE':
        return handleRevokeKey(res, user.id, id);
      default:
        return sendError(res, 'Method not allowed', 405);
    }
  } catch (error) {
    return sendServerError(res, error);
  }
}

// GET /api/keys/:id
async function handleGetKey(
  res: VercelResponse,
  userId: string,
  keyId: string
) {
  const { data, error } = await supabaseAdmin
    .from('api_keys')
    .select('id, name, description, key_preview, permissions, status, rate_limit_rpm, rate_limit_daily, created_at, last_used_at, expires_at')
    .eq('id', keyId)
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return sendNotFound(res, 'API key not found');
  }

  return sendSuccess(res, data);
}

// PATCH/PUT /api/keys/:id
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
    permissions?: unknown;
  };

  // Build update object with validation
  const updates: Record<string, unknown> = {};
  
  // Validate name
  if (body.name !== undefined) {
    const name = body.name.trim();
    if (name.length === 0) {
      return sendError(res, 'Key name cannot be empty');
    }
    if (name.length > 100) {
      return sendError(res, 'Key name must be 100 characters or less');
    }
    
    // Check for duplicate name (excluding current key)
    const { data: existingKey } = await supabaseAdmin
      .from('api_keys')
      .select('id')
      .eq('user_id', userId)
      .eq('name', name)
      .eq('status', 'active')
      .neq('id', keyId)
      .single();

    if (existingKey) {
      return sendError(res, 'An active API key with this name already exists');
    }
    
    updates.name = name;
  }
  
  if (body.description !== undefined) {
    updates.description = body.description || null;
  }
  
  // Validate rate limits
  if (body.rate_limit_rpm !== undefined) {
    if (body.rate_limit_rpm < 1 || body.rate_limit_rpm > 10000) {
      return sendError(res, 'Rate limit must be between 1 and 10000 requests per minute');
    }
    updates.rate_limit_rpm = body.rate_limit_rpm;
  }
  
  if (body.rate_limit_daily !== undefined) {
    if (body.rate_limit_daily < 1 || body.rate_limit_daily > 1000000) {
      return sendError(res, 'Daily rate limit must be between 1 and 1000000 requests');
    }
    updates.rate_limit_daily = body.rate_limit_daily;
  }
  
  // Validate permissions
  if (body.permissions !== undefined) {
    const validatedPermissions = validatePermissions(body.permissions);
    if (!validatedPermissions) {
      return sendError(res, 'Invalid permissions format');
    }
    updates.permissions = validatedPermissions;
  }

  if (Object.keys(updates).length === 0) {
    return sendError(res, 'No fields to update');
  }

  // Add updated_at timestamp
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from('api_keys')
    .update(updates)
    .eq('id', keyId)
    .eq('user_id', userId)
    .eq('status', 'active') // Can only update active keys
    .select('id, name, description, key_preview, permissions, status, rate_limit_rpm, rate_limit_daily, created_at, last_used_at, expires_at')
    .single();

  if (error || !data) {
    return sendNotFound(res, 'API key not found or already revoked');
  }

  return sendSuccess(res, data);
}

// DELETE /api/keys/:id (Revoke, not hard delete)
async function handleRevokeKey(
  res: VercelResponse,
  userId: string,
  keyId: string
) {
  // First get the key name for notification
  const { data: keyData } = await supabaseAdmin
    .from('api_keys')
    .select('name')
    .eq('id', keyId)
    .eq('user_id', userId)
    .single();

  const { data, error } = await supabaseAdmin
    .from('api_keys')
    .update({
      status: 'revoked',
      revoked_at: new Date().toISOString(),
    })
    .eq('id', keyId)
    .eq('user_id', userId)
    .eq('status', 'active') // Can only revoke active keys
    .select('id, status')
    .single();

  if (error || !data) {
    return sendNotFound(res, 'API key not found or already revoked');
  }

  // Create notification for key revocation
  if (keyData) {
    await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: userId,
        type: 'api_key_revoked',
        title: 'API Key Revoked',
        message: `API key "${keyData.name}" has been revoked and can no longer be used.`,
        data: { key_id: keyId, key_name: keyData.name },
      });
  }

  return sendSuccess(res, { 
    status: 'success',
    message: 'API key revoked successfully', 
    id: data.id 
  });
}

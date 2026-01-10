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
import type { CreateApiKeyRequest, ApiKeyPermissions } from '../lib/types';
import crypto from 'crypto';

// Default permissions for new API keys
const DEFAULT_PERMISSIONS: ApiKeyPermissions = {
  read_randomness: true,
  write_randomness: false,
  read_usage: false,
  manage_keys: false,
  manage_billing: false,
};

// Generate a secure API key (kaos_ prefix + 32 random bytes as base64url)
const generateApiKey = (): string => {
  const randomBytes = crypto.randomBytes(32);
  const base64 = randomBytes.toString('base64url');
  return `kaos_${base64}`;
};

// Hash API key for storage using SHA256
// Note: bcrypt is too slow for serverless cold starts; SHA256 is secure for API keys
const hashApiKey = (key: string): string => {
  return crypto.createHash('sha256').update(key).digest('hex');
};

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
  _req: VercelRequest,
  res: VercelResponse,
  userId: string
) {
  const { data, error } = await supabaseAdmin
    .from('api_keys')
    .select('id, name, description, key_preview, permissions, status, rate_limit_rpm, rate_limit_daily, created_at, last_used_at, expires_at')
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

  // Validate name
  if (!body.name || body.name.trim().length === 0) {
    return sendError(res, 'Key name is required');
  }
  
  const name = body.name.trim();
  if (name.length > 100) {
    return sendError(res, 'Key name must be 100 characters or less');
  }

  // Check for duplicate name for this user
  const { data: existingKey } = await supabaseAdmin
    .from('api_keys')
    .select('id')
    .eq('user_id', userId)
    .eq('name', name)
    .eq('status', 'active')
    .single();

  if (existingKey) {
    return sendError(res, 'An active API key with this name already exists');
  }

  // Validate rate limit
  const rateLimitRpm = body.rate_limit_rpm ?? 100;
  if (rateLimitRpm < 1 || rateLimitRpm > 10000) {
    return sendError(res, 'Rate limit must be between 1 and 10000 requests per minute');
  }

  const rateLimitDaily = body.rate_limit_daily ?? 100000;
  if (rateLimitDaily < 1 || rateLimitDaily > 1000000) {
    return sendError(res, 'Daily rate limit must be between 1 and 1000000 requests');
  }

  // Validate expiry
  if (body.expires_at) {
    const expiryDate = new Date(body.expires_at);
    if (isNaN(expiryDate.getTime())) {
      return sendError(res, 'Invalid expiry date format');
    }
    if (expiryDate <= new Date()) {
      return sendError(res, 'Expiry date must be in the future');
    }
  }

  // Validate and merge permissions
  let permissions = DEFAULT_PERMISSIONS;
  if (body.permissions) {
    const validatedPermissions = validatePermissions(body.permissions);
    if (!validatedPermissions) {
      return sendError(res, 'Invalid permissions format');
    }
    permissions = validatedPermissions;
  }

  // Generate key
  const fullKey = generateApiKey();
  const keyHash = hashApiKey(fullKey);
  const keyPrefix = fullKey.slice(0, 10); // kaos_ + first 5 chars
  const keyPreview = `...${fullKey.slice(-8)}`; // Last 8 chars

  // Insert into database
  const { data, error } = await supabaseAdmin
    .from('api_keys')
    .insert({
      user_id: userId,
      name: name,
      description: body.description || null,
      key_hash: keyHash,
      key_prefix: keyPrefix,
      key_preview: keyPreview,
      permissions: permissions,
      rate_limit_rpm: rateLimitRpm,
      rate_limit_daily: rateLimitDaily,
      expires_at: body.expires_at || null,
      status: 'active',
    })
    .select('id, name, description, key_preview, permissions, status, rate_limit_rpm, rate_limit_daily, created_at, expires_at')
    .single();

  if (error) throw error;

  // Create notification for key creation
  await supabaseAdmin
    .from('notifications')
    .insert({
      user_id: userId,
      type: 'api_key_created',
      title: 'New API Key Created',
      message: `API key "${name}" has been created successfully.`,
      data: { key_id: data.id, key_name: name },
    });

  // Return full key only on creation (user must save it)
  return sendSuccess(res, {
    ...data,
    key: fullKey, // Only returned on creation!
  }, 201);
}

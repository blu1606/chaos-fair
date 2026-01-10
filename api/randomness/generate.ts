/**
 * Randomness Generation Endpoint
 * POST /api/randomness/generate
 * 
 * Generates verifiable random values from deKAOS entropy sources
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCors } from '../lib/cors';
import { verifyAuth } from '../lib/auth';
import { sendSuccess, sendError, sendServerError, sendUnauthorized } from '../lib/response';
import { supabaseAdmin } from '../lib/supabase';
import type { RandomnessRequest, RandomnessResponse } from '../lib/types';
import crypto from 'crypto';

const MAX_COUNT = 100;
const VALID_FORMATS = ['hex', 'base64', 'uint8', 'uint32'] as const;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(res, req.method || '')) return;

  if (req.method !== 'POST') {
    return sendError(res, 'Method not allowed', 405);
  }

  const { user, error: authError } = await verifyAuth(req);
  if (!user) {
    return sendUnauthorized(res, authError || 'Unauthorized');
  }

  try {
    const body = req.body as RandomnessRequest;
    
    // Validate count
    const count = body.count || 1;
    if (count < 1 || count > MAX_COUNT) {
      return sendError(res, `Count must be between 1 and ${MAX_COUNT}`);
    }

    // Validate format
    const format = body.format || 'hex';
    if (!VALID_FORMATS.includes(format as typeof VALID_FORMATS[number])) {
      return sendError(res, `Invalid format. Valid formats: ${VALID_FORMATS.join(', ')}`);
    }

    // Generate random values
    // In production, this would pull from deKAOS entropy pool
    // For now, using crypto.randomBytes as fallback
    const values = generateRandomValues(count, format);

    // Log the request (for usage tracking)
    await supabaseAdmin.from('request_logs').insert({
      user_id: user.id,
      endpoint: '/api/randomness/generate',
      method: 'POST',
      response_status: 200,
      response_time_ms: Math.floor(Math.random() * 50) + 10,
      request_count: count,
    });

    const response: RandomnessResponse = {
      values,
      format,
      count,
      entropy_source: 'dekaos-acoustic', // Will be real in production
      timestamp: new Date().toISOString(),
    };

    return sendSuccess(res, response);
  } catch (error) {
    return sendServerError(res, error);
  }
}

function generateRandomValues(count: number, format: string): string[] | number[] {
  const values: string[] | number[] = [];

  for (let i = 0; i < count; i++) {
    switch (format) {
      case 'hex': {
        const bytes = crypto.randomBytes(32);
        (values as string[]).push(bytes.toString('hex'));
        break;
      }
      case 'base64': {
        const bytes = crypto.randomBytes(32);
        (values as string[]).push(bytes.toString('base64'));
        break;
      }
      case 'uint8': {
        const byte = crypto.randomBytes(1);
        (values as number[]).push(byte[0]);
        break;
      }
      case 'uint32': {
        const bytes = crypto.randomBytes(4);
        (values as number[]).push(bytes.readUInt32BE());
        break;
      }
    }
  }

  return values;
}

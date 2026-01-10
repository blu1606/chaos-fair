/**
 * Health Check Endpoint
 * GET /api/health
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCors } from './lib/cors';
import { sendSuccess } from './lib/response';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(res, req.method || '')) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return sendSuccess(res, {
    service: 'dekaos-api',
    version: '1.0.0',
    status: 'healthy',
    environment: process.env.VERCEL_ENV || 'development',
  });
}

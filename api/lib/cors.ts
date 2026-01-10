/**
 * CORS Headers for Vercel Functions
 */

import type { VercelResponse } from '@vercel/node';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type, X-Client-Info, apikey',
  'Access-Control-Max-Age': '86400',
};

export const setCorsHeaders = (res: VercelResponse) => {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
};

export const handleCors = (res: VercelResponse, method: string): boolean => {
  setCorsHeaders(res);
  
  if (method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  
  return false;
};

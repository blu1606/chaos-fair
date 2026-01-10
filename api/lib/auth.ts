/**
 * Authentication utilities for Vercel Functions
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from './supabase';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

export interface AuthResult {
  user: AuthUser | null;
  error: string | null;
}

/**
 * Verify JWT token from Authorization header
 */
export const verifyAuth = async (req: VercelRequest): Promise<AuthResult> => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    return { user: null, error: 'Missing or invalid Authorization header' };
  }
  
  const token = authHeader.replace('Bearer ', '');
  
  try {
    // Use Supabase to verify the JWT
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !user) {
      return { user: null, error: error?.message || 'Invalid token' };
    }
    
    return {
      user: {
        id: user.id,
        email: user.email || '',
        role: user.role || 'authenticated',
      },
      error: null,
    };
  } catch (err) {
    return { user: null, error: 'Token verification failed' };
  }
};

/**
 * Middleware wrapper for protected routes
 */
export const withAuth = (
  handler: (req: VercelRequest, res: VercelResponse, user: AuthUser) => Promise<void>
) => {
  return async (req: VercelRequest, res: VercelResponse) => {
    const { user, error } = await verifyAuth(req);
    
    if (!user) {
      return res.status(401).json({
        status: 'error',
        error: error || 'Unauthorized',
      });
    }
    
    return handler(req, res, user);
  };
};

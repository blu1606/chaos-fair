/**
 * Response utilities for Vercel Functions
 */

import type { VercelResponse } from '@vercel/node';
import type { ApiResponse } from './types';

export const sendSuccess = <T>(res: VercelResponse, data: T, statusCode = 200) => {
  const response: ApiResponse<T> = {
    status: 'success',
    data,
    timestamp: new Date().toISOString(),
  };
  
  return res.status(statusCode).json(response);
};

export const sendError = (
  res: VercelResponse,
  error: string,
  statusCode = 400
) => {
  const response: ApiResponse = {
    status: 'error',
    error,
    timestamp: new Date().toISOString(),
  };
  
  return res.status(statusCode).json(response);
};

export const sendNotFound = (res: VercelResponse, message = 'Resource not found') => {
  return sendError(res, message, 404);
};

export const sendUnauthorized = (res: VercelResponse, message = 'Unauthorized') => {
  return sendError(res, message, 401);
};

export const sendServerError = (res: VercelResponse, error: unknown) => {
  console.error('Server Error:', error);
  const message = error instanceof Error ? error.message : 'Internal server error';
  return sendError(res, message, 500);
};

/**
 * Randomness API Service
 */

import { config } from '@/config/appMode';
import { buildApiUrl, API_ENDPOINTS } from '@/config/api';
import { supabase } from '@/integrations/supabase/client';
import * as mockData from '../mockData';
import crypto from 'crypto';

// Request/Response types
export type RandomFormat = 'integer' | 'float' | 'bytes' | 'hex';

export interface RandomnessRequest {
  count?: number;
  format?: RandomFormat;
  min?: number;
  max?: number;
}

export interface RandomnessProof {
  commit_root: string;
  node_count: number;
  entropy_quality: number;
}

export interface RandomnessData {
  epoch: number;
  timestamp: string;
  values: number[] | string[];
  signature: string;
  proof: RandomnessProof;
  walrus_object_id: string;
  cost_credits: number;
}

export interface RandomnessResponse {
  request: {
    count: number;
    format: string;
    min?: number;
    max?: number;
  };
  data: RandomnessData;
}

// For API key based auth (external API usage)
export const generateRandomnessWithApiKey = async (
  apiKey: string,
  options: RandomnessRequest
): Promise<RandomnessResponse> => {
  const response = await fetch(buildApiUrl(API_ENDPOINTS.generateRandomness), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(options),
  });

  if (!response.ok) {
    const error = await response.json();
    
    // Handle specific error codes
    if (response.status === 429) {
      const retryAfter = error.retry_after_seconds || 60;
      throw new Error(`Rate limit exceeded. Retry after ${retryAfter} seconds.`);
    }
    if (response.status === 402) {
      throw new Error(`Insufficient credits. Required: ${error.required_credits}, Available: ${error.available_credits}`);
    }
    if (response.status === 403) {
      throw new Error('API key does not have permission to generate randomness.');
    }
    
    throw new Error(error.error || 'Failed to generate randomness');
  }

  const result = await response.json();
  return result;
};

// For dashboard/web app usage (JWT auth)
export const generateRandomness = async (
  count: number = 10,
  format: RandomFormat = 'integer',
  min?: number,
  max?: number
): Promise<RandomnessResponse> => {
  if (config.useMockData) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200));
    
    const mockResult = mockData.generateMockRandomness(count);
    const epoch = Math.floor(Date.now() / 1000 / 60);
    
    // Generate mock values based on format
    let values: number[] | string[];
    switch (format) {
      case 'integer': {
        const range = (max ?? 4294967295) - (min ?? 0) + 1;
        values = mockResult.data.map(() => 
          Math.floor(Math.random() * range) + (min ?? 0)
        );
        break;
      }
      case 'float':
        values = mockResult.data.map(() => Math.random());
        break;
      case 'bytes':
        values = mockResult.data.map(() => 
          Array.from({ length: 32 }, () => Math.floor(Math.random() * 256)).join(',')
        );
        break;
      case 'hex':
        values = mockResult.data.map(() => 
          Array.from({ length: 32 }, () => 
            Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
          ).join('')
        );
        break;
    }
    
    return {
      request: { count, format, min, max },
      data: {
        epoch,
        timestamp: mockResult.timestamp,
        values,
        signature: '0x' + Array.from({ length: 128 }, () => 
          Math.floor(Math.random() * 16).toString(16)
        ).join(''),
        proof: {
          commit_root: '0x' + Array.from({ length: 64 }, () => 
            Math.floor(Math.random() * 16).toString(16)
          ).join(''),
          node_count: Math.floor(Math.random() * 500) + 1500,
          entropy_quality: 0.9 + Math.random() * 0.099,
        },
        walrus_object_id: `walrus_mock_${Date.now().toString(36)}`,
        cost_credits: count * 0.05,
      },
    };
  }
  
  // Get JWT token for dashboard calls
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Not authenticated');
  
  const response = await fetch(buildApiUrl(API_ENDPOINTS.generateRandomness), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ count, format, min, max }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate randomness');
  }

  const result = await response.json();
  return result;
};

/**
 * Randomness API Service
 */

import { config } from '@/config/appMode';
import { buildApiUrl, API_ENDPOINTS } from '@/config/api';
import { supabase } from '@/integrations/supabase/client';
import * as mockData from '../mockData';

export interface RandomnessRequest {
  count: number;
  format?: 'hex' | 'base64' | 'uint8' | 'uint32';
}

export interface RandomnessResponse {
  values: string[] | number[];
  format: string;
  count: number;
  entropy_source: string;
  timestamp: string;
}

const getAuthToken = async (): Promise<string> => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Not authenticated');
  return token;
};

export const generateRandomness = async (
  count: number,
  format: RandomnessRequest['format'] = 'hex'
): Promise<RandomnessResponse> => {
  if (config.useMockData) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
    
    const mockResult = mockData.generateMockRandomness(count);
    
    // Convert mock data array to requested format
    let values: string[] | number[];
    switch (format) {
      case 'hex':
        values = mockResult.data.map(n => n.toString(16).padStart(2, '0'));
        break;
      case 'base64':
        values = mockResult.data.map(n => btoa(String.fromCharCode(n)));
        break;
      case 'uint8':
      case 'uint32':
        values = mockResult.data;
        break;
      default:
        values = mockResult.data.map(n => n.toString(16).padStart(2, '0'));
    }
    
    return {
      values,
      format,
      count,
      entropy_source: 'mock-entropy',
      timestamp: mockResult.timestamp,
    };
  }
  
  const token = await getAuthToken();
  
  const response = await fetch(buildApiUrl(API_ENDPOINTS.generateRandomness), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ count, format }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate randomness');
  }

  const result = await response.json();
  return result.data;
};

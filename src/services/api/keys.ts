/**
 * API Keys Service
 */

import { config } from '@/config/appMode';
import { buildApiUrl, API_ENDPOINTS } from '@/config/api';
import { supabase } from '@/integrations/supabase/client';
import * as mockData from '../mockData';

export interface ApiKey {
  id: string;
  name: string;
  description?: string | null;
  key_preview: string;
  status: 'active' | 'revoked' | 'expired';
  rate_limit_rpm: number;
  rate_limit_daily: number;
  created_at: string;
  last_used_at: string | null;
  expires_at: string | null;
  fullKey?: string; // Only on creation
}

export interface CreateApiKeyRequest {
  name: string;
  description?: string;
  rate_limit_rpm?: number;
  rate_limit_daily?: number;
  expires_at?: string;
}

const getAuthToken = async (): Promise<string> => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Not authenticated');
  return token;
};

export const fetchApiKeys = async (userId: string): Promise<ApiKey[]> => {
  if (config.useMockData) {
    return mockData.mockApiKeys as ApiKey[];
  }
  
  const token = await getAuthToken();
  
  const response = await fetch(buildApiUrl(API_ENDPOINTS.keys), {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch API keys');
  }

  const result = await response.json();
  return result.data || [];
};

export const createApiKey = async (
  userId: string,
  keyData: CreateApiKeyRequest
): Promise<ApiKey> => {
  if (config.useMockData) {
    return {
      id: `key-${Date.now()}`,
      name: keyData.name,
      description: keyData.description || null,
      key_preview: `dk_test_****...${Math.random().toString(36).slice(-4).toUpperCase()}`,
      status: 'active',
      rate_limit_rpm: keyData.rate_limit_rpm || 100,
      rate_limit_daily: keyData.rate_limit_daily || 10000,
      created_at: new Date().toISOString(),
      last_used_at: null,
      expires_at: keyData.expires_at || null,
      fullKey: `dk_test_${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`,
    };
  }
  
  const token = await getAuthToken();
  
  const response = await fetch(buildApiUrl(API_ENDPOINTS.keys), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(keyData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create API key');
  }

  const result = await response.json();
  return result.data;
};

export const revokeApiKey = async (keyId: string): Promise<{ success: boolean }> => {
  if (config.useMockData) {
    return { success: true };
  }
  
  const token = await getAuthToken();
  
  const response = await fetch(buildApiUrl(API_ENDPOINTS.keyById(keyId)), {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to revoke API key');
  }

  return { success: true };
};

export const updateApiKey = async (
  keyId: string,
  updates: Partial<Pick<ApiKey, 'name' | 'description' | 'rate_limit_rpm' | 'rate_limit_daily'>>
): Promise<ApiKey> => {
  if (config.useMockData) {
    throw new Error('Update not supported in mock mode');
  }
  
  const token = await getAuthToken();
  
  const response = await fetch(buildApiUrl(API_ENDPOINTS.keyById(keyId)), {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update API key');
  }

  const result = await response.json();
  return result.data;
};

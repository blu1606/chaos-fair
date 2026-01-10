/**
 * API Keys Service
 */

import { config } from '@/config/appMode';
import { buildApiUrl, API_ENDPOINTS } from '@/config/api';
import { supabase } from '@/integrations/supabase/client';
import * as mockData from '../mockData';

// Permissions interface
export interface ApiKeyPermissions {
  read_randomness: boolean;
  write_randomness: boolean;
  read_usage: boolean;
  manage_keys: boolean;
  manage_billing: boolean;
}

export interface ApiKey {
  id: string;
  name: string;
  description?: string | null;
  key_preview: string;
  permissions: ApiKeyPermissions;
  status: 'active' | 'revoked' | 'expired';
  rate_limit_rpm: number;
  rate_limit_daily: number;
  created_at: string;
  last_used_at: string | null;
  expires_at: string | null;
  key?: string; // Only returned on creation
}

export interface CreateApiKeyRequest {
  name: string;
  description?: string;
  permissions?: ApiKeyPermissions;
  rate_limit_rpm?: number;
  rate_limit_daily?: number;
  expires_at?: string;
}

export interface UpdateApiKeyRequest {
  name?: string;
  description?: string;
  permissions?: ApiKeyPermissions;
  rate_limit_rpm?: number;
  rate_limit_daily?: number;
}

const DEFAULT_PERMISSIONS: ApiKeyPermissions = {
  read_randomness: true,
  write_randomness: false,
  read_usage: false,
  manage_keys: false,
  manage_billing: false,
};

const getAuthToken = async (): Promise<string> => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Not authenticated');
  return token;
};

export const fetchApiKeys = async (_userId?: string): Promise<ApiKey[]> => {
  if (config.useMockData) {
    // Transform mock data to include permissions
    return (mockData.mockApiKeys as unknown[]).map((key: unknown) => ({
      ...(key as Record<string, unknown>),
      permissions: DEFAULT_PERMISSIONS,
    })) as ApiKey[];
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

export const fetchApiKeyById = async (keyId: string): Promise<ApiKey> => {
  if (config.useMockData) {
    const key = (mockData.mockApiKeys as unknown[]).find(
      (k: unknown) => (k as Record<string, unknown>).id === keyId
    );
    if (!key) throw new Error('API key not found');
    return {
      ...(key as Record<string, unknown>),
      permissions: DEFAULT_PERMISSIONS,
    } as ApiKey;
  }
  
  const token = await getAuthToken();
  
  const response = await fetch(buildApiUrl(API_ENDPOINTS.keyById(keyId)), {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch API key');
  }

  const result = await response.json();
  return result.data;
};

export const createApiKey = async (
  _userId: string,
  keyData: CreateApiKeyRequest
): Promise<ApiKey> => {
  if (config.useMockData) {
    const randomSuffix = Math.random().toString(36).slice(2, 10).toUpperCase();
    return {
      id: `key-${Date.now()}`,
      name: keyData.name,
      description: keyData.description || null,
      key_preview: `...${randomSuffix.slice(-8)}`,
      permissions: keyData.permissions || DEFAULT_PERMISSIONS,
      status: 'active',
      rate_limit_rpm: keyData.rate_limit_rpm || 100,
      rate_limit_daily: keyData.rate_limit_daily || 100000,
      created_at: new Date().toISOString(),
      last_used_at: null,
      expires_at: keyData.expires_at || null,
      key: `kaos_${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`,
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

export const updateApiKey = async (
  keyId: string,
  updates: UpdateApiKeyRequest
): Promise<ApiKey> => {
  if (config.useMockData) {
    // Return a mock updated key
    return {
      id: keyId,
      name: updates.name || 'Updated Key',
      description: updates.description || null,
      key_preview: '...MOCK1234',
      permissions: updates.permissions || DEFAULT_PERMISSIONS,
      status: 'active',
      rate_limit_rpm: updates.rate_limit_rpm || 100,
      rate_limit_daily: updates.rate_limit_daily || 100000,
      created_at: new Date().toISOString(),
      last_used_at: null,
      expires_at: null,
    };
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

export const revokeApiKey = async (keyId: string): Promise<{ success: boolean; message: string }> => {
  if (config.useMockData) {
    return { success: true, message: 'API key revoked successfully' };
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

  const result = await response.json();
  return { success: true, message: result.data?.message || 'API key revoked successfully' };
};

/**
 * Randomness API Service
 */

import { config } from '@/config/appMode';
import { buildApiUrl, API_ENDPOINTS } from '@/config/api';
import { supabase } from '@/integrations/supabase/client';
import * as mockData from '../mockData';

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

// Verification types
export interface VerifyRequest {
  epoch: number;
  signature: string;
  proof: string;
  walrus_object_id: string;
}

export interface VerificationResult {
  verified: boolean;
  epoch: number;
  valid_commits: number;
  entropy_quality_score: number;
  on_chain_reference: string | null;
  proof_verified: boolean;
  signature_valid: boolean;
  walrus_data_found: boolean;
  verification_time_ms: number;
}

// VRF types
export interface VRFRequest {
  seed?: string;
  message?: string;
  proof_level?: 'basic' | 'high';
}

export interface VRFOutput {
  epoch: number;
  vrf_output: string;
  proof: string;
  beta: string;
  gamma: string;
  public_key: string;
  seed_used: string;
  message_used: string;
  proof_level: 'basic' | 'high';
  latency_ms: number;
  verified: boolean;
  cost_credits: number;
  walrus_object_id: string;
}

// Helper to generate mock random hex
const mockRandomHex = (length: number): string => {
  return Array.from({ length }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
};

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
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200));
    
    const mockResult = mockData.generateMockRandomness(count);
    const epoch = Math.floor(Date.now() / 1000 / 60);
    
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
        values = mockResult.data.map(() => mockRandomHex(64));
        break;
    }
    
    return {
      request: { count, format, min, max },
      data: {
        epoch,
        timestamp: mockResult.timestamp,
        values,
        signature: '0x' + mockRandomHex(128),
        proof: {
          commit_root: '0x' + mockRandomHex(64),
          node_count: Math.floor(Math.random() * 500) + 1500,
          entropy_quality: 0.9 + Math.random() * 0.099,
        },
        walrus_object_id: `walrus_mock_${Date.now().toString(36)}`,
        cost_credits: count * 0.05,
      },
    };
  }
  
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

/**
 * Verify randomness cryptographic proof
 */
export const verifyRandomness = async (
  params: VerifyRequest
): Promise<VerificationResult> => {
  if (config.useMockData) {
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 100));
    
    return {
      verified: true,
      epoch: params.epoch,
      valid_commits: Math.floor(Math.random() * 500) + 1500,
      entropy_quality_score: 0.9 + Math.random() * 0.099,
      on_chain_reference: `https://explorer.solana.com/tx/${mockRandomHex(64)}?cluster=mainnet`,
      proof_verified: true,
      signature_valid: true,
      walrus_data_found: true,
      verification_time_ms: Math.floor(Math.random() * 50) + 30,
    };
  }
  
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Not authenticated');
  
  const response = await fetch(buildApiUrl(API_ENDPOINTS.verifyRandomness), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Verification failed');
  }

  const result = await response.json();
  return result.data;
};

/**
 * Generate VRF output with proof
 */
export const generateVRF = async (
  params: VRFRequest = {}
): Promise<VRFOutput> => {
  if (config.useMockData) {
    await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 200));
    
    const epoch = Math.floor(Date.now() / 1000 / 60);
    const seed = params.seed || mockRandomHex(64);
    const message = params.message || `vrf_${Date.now()}`;
    const proofLevel = params.proof_level || 'basic';
    
    return {
      epoch,
      vrf_output: '0x' + mockRandomHex(64),
      proof: '0x' + mockRandomHex(proofLevel === 'high' ? 192 : 64),
      beta: '0x' + mockRandomHex(64),
      gamma: '0x' + mockRandomHex(128),
      public_key: '0x' + mockRandomHex(64),
      seed_used: seed,
      message_used: message,
      proof_level: proofLevel,
      latency_ms: Math.floor(Math.random() * 30) + 40,
      verified: true,
      cost_credits: 1.0,
      walrus_object_id: `walrus_vrf_${Date.now().toString(36)}`,
    };
  }
  
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Not authenticated');
  
  const response = await fetch(buildApiUrl(API_ENDPOINTS.vrf), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    
    if (response.status === 429) {
      throw new Error(`Rate limit exceeded. Retry after ${error.retry_after_seconds || 60} seconds.`);
    }
    if (response.status === 402) {
      throw new Error(`Insufficient credits. Required: ${error.required_credits}, Available: ${error.available_credits}`);
    }
    
    throw new Error(error.error || 'VRF generation failed');
  }

  const result = await response.json();
  return result.data;
};

/**
 * Generate VRF with API key (external usage)
 */
export const generateVRFWithApiKey = async (
  apiKey: string,
  params: VRFRequest = {}
): Promise<VRFOutput> => {
  const response = await fetch(buildApiUrl(API_ENDPOINTS.vrf), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    
    if (response.status === 429) {
      throw new Error(`Rate limit exceeded. Retry after ${error.retry_after_seconds || 60} seconds.`);
    }
    if (response.status === 402) {
      throw new Error(`Insufficient credits. Required: ${error.required_credits}, Available: ${error.available_credits}`);
    }
    if (response.status === 403) {
      throw new Error('API key does not have permission to generate VRF.');
    }
    
    throw new Error(error.error || 'VRF generation failed');
  }

  const result = await response.json();
  return result.data;
};

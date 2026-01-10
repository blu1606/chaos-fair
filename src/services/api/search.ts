/**
 * Search API Service
 */

import { config } from '@/config/appMode';
import { buildApiUrl, API_ENDPOINTS } from '@/config/api';
import { supabase } from '@/integrations/supabase/client';

export type SearchType = 'keys' | 'requests' | 'randomness';

export interface SearchResult {
  type: 'api_key' | 'request' | 'randomness';
  id: string;
  title: string;
  description?: string;
  details?: string;
  timestamp: string;
  relevance_score: number;
}

export interface SearchResponse {
  query: string;
  types: string[];
  results: SearchResult[];
  count: number;
  search_time_ms: number;
}

export interface SearchParams {
  query: string;
  types?: SearchType[];
  limit?: number;
}

const getAuthToken = async (): Promise<string> => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Not authenticated');
  return token;
};

/**
 * Search across API keys, requests, and randomness records
 */
export const search = async (params: SearchParams): Promise<SearchResponse> => {
  if (config.useMockData) {
    // Simulate search delay
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 100));
    
    const mockResults: SearchResult[] = [];
    const query = params.query.toLowerCase();
    
    // Mock API key results
    if (!params.types || params.types.includes('keys')) {
      if ('production'.includes(query) || 'mobile'.includes(query) || 'test'.includes(query)) {
        mockResults.push({
          type: 'api_key',
          id: 'key-mock-1',
          title: 'Production API Key',
          description: 'Main production key for mobile app',
          details: 'Status: active',
          timestamp: new Date().toISOString(),
          relevance_score: 0.9,
        });
      }
    }
    
    // Mock request results
    if (!params.types || params.types.includes('requests')) {
      if ('randomness'.includes(query) || 'generate'.includes(query)) {
        mockResults.push({
          type: 'request',
          id: 'req-mock-1',
          title: 'POST /randomness/generate',
          description: undefined,
          details: 'Status: 200 | IP: 192.168.1.1 | 45ms',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          relevance_score: 0.8,
        });
      }
    }
    
    // Mock randomness results
    if (!params.types || params.types.includes('randomness')) {
      const epochMatch = parseInt(query, 10);
      if (!isNaN(epochMatch)) {
        mockResults.push({
          type: 'randomness',
          id: 'rand-mock-1',
          title: `Epoch ${epochMatch} - integer`,
          description: 'walrus_mock_abc123',
          details: 'Count: 10 | Cost: 0.5 credits | Verified: Yes',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          relevance_score: 1.0,
        });
      }
    }
    
    return {
      query: params.query,
      types: params.types || ['keys', 'requests', 'randomness'],
      results: mockResults.slice(0, params.limit || 10),
      count: mockResults.length,
      search_time_ms: Math.floor(Math.random() * 50) + 20,
    };
  }
  
  const token = await getAuthToken();
  
  // Build query string
  const queryParams = new URLSearchParams();
  queryParams.set('q', params.query);
  if (params.types && params.types.length > 0) {
    queryParams.set('type', params.types.join(','));
  }
  if (params.limit) {
    queryParams.set('limit', params.limit.toString());
  }
  
  const response = await fetch(
    buildApiUrl(`${API_ENDPOINTS.search}?${queryParams.toString()}`),
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Search failed');
  }

  const result = await response.json();
  return result.data;
};

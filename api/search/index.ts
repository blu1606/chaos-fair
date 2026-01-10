/**
 * Global Search Endpoint
 * GET /api/search?q=term&type=keys,requests&limit=10
 * 
 * Full-text search across API keys, requests, and randomness records
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCors } from '../lib/cors';
import { verifyAuth } from '../lib/auth';
import { sendSuccess, sendError, sendServerError, sendUnauthorized } from '../lib/response';
import { supabaseAdmin } from '../lib/supabase';

// Valid search types
const VALID_TYPES = ['keys', 'requests', 'randomness'] as const;
type SearchType = typeof VALID_TYPES[number];

interface SearchResult {
  type: 'api_key' | 'request' | 'randomness';
  id: string;
  title: string;
  description?: string;
  details?: string;
  timestamp: string;
  relevance_score: number;
}

interface SearchResponse {
  query: string;
  types: string[];
  results: SearchResult[];
  count: number;
  search_time_ms: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(res, req.method || '')) return;

  if (req.method !== 'GET') {
    return sendError(res, 'Method not allowed', 405);
  }

  const startTime = Date.now();

  try {
    // Authenticate
    const { user, error: authError } = await verifyAuth(req);
    if (!user) {
      return sendUnauthorized(res, authError || 'Unauthorized');
    }

    // Parse query parameters
    const query = req.query.q as string;
    const typeParam = req.query.type as string | undefined;
    const limitParam = req.query.limit as string | undefined;

    // Validate query
    if (!query || query.trim().length < 2) {
      return sendError(res, 'Search query (q) must be at least 2 characters');
    }

    const searchTerm = query.trim().toLowerCase();

    // Parse types
    let types: SearchType[] = [...VALID_TYPES];
    if (typeParam) {
      const requestedTypes = typeParam.split(',').map(t => t.trim().toLowerCase());
      types = requestedTypes.filter(t => VALID_TYPES.includes(t as SearchType)) as SearchType[];
      if (types.length === 0) {
        return sendError(res, `Invalid type. Valid types: ${VALID_TYPES.join(', ')}`);
      }
    }

    // Parse limit
    let limit = 10;
    if (limitParam) {
      limit = parseInt(limitParam, 10);
      if (isNaN(limit) || limit < 5 || limit > 20) {
        return sendError(res, 'Limit must be between 5 and 20');
      }
    }

    // ============================================
    // SEARCH ACROSS TABLES
    // ============================================
    const results: SearchResult[] = [];
    const searchPromises: Promise<void>[] = [];

    // Search API Keys
    if (types.includes('keys')) {
      searchPromises.push(
        searchApiKeys(user.id, searchTerm, Math.ceil(limit / types.length))
          .then(keyResults => results.push(...keyResults))
      );
    }

    // Search Request Logs
    if (types.includes('requests')) {
      searchPromises.push(
        searchRequestLogs(user.id, searchTerm, Math.ceil(limit / types.length))
          .then(reqResults => results.push(...reqResults))
      );
    }

    // Search Randomness Records
    if (types.includes('randomness')) {
      searchPromises.push(
        searchRandomnessRecords(user.id, searchTerm, Math.ceil(limit / types.length))
          .then(randResults => results.push(...randResults))
      );
    }

    await Promise.all(searchPromises);

    // Sort by relevance and timestamp
    results.sort((a, b) => {
      if (b.relevance_score !== a.relevance_score) {
        return b.relevance_score - a.relevance_score;
      }
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    // Limit total results
    const finalResults = results.slice(0, limit);

    const response: SearchResponse = {
      query: searchTerm,
      types,
      results: finalResults,
      count: finalResults.length,
      search_time_ms: Date.now() - startTime,
    };

    return sendSuccess(res, response);

  } catch (error) {
    return sendServerError(res, error);
  }
}

/**
 * Search API Keys
 */
async function searchApiKeys(userId: string, term: string, limit: number): Promise<SearchResult[]> {
  const { data, error } = await supabaseAdmin
    .from('api_keys')
    .select('id, name, description, status, created_at')
    .eq('user_id', userId)
    .or(`name.ilike.%${term}%,description.ilike.%${term}%`)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map(key => ({
    type: 'api_key' as const,
    id: key.id,
    title: key.name,
    description: key.description || undefined,
    details: `Status: ${key.status}`,
    timestamp: key.created_at,
    relevance_score: calculateRelevance(term, key.name, key.description),
  }));
}

/**
 * Search Request Logs
 */
async function searchRequestLogs(userId: string, term: string, limit: number): Promise<SearchResult[]> {
  const { data, error } = await supabaseAdmin
    .from('request_logs')
    .select('id, endpoint, method, response_status, error_message, ip_address, created_at, response_time_ms')
    .eq('user_id', userId)
    .or(`endpoint.ilike.%${term}%,error_message.ilike.%${term}%,ip_address::text.ilike.%${term}%`)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map(req => ({
    type: 'request' as const,
    id: req.id,
    title: `${req.method} ${req.endpoint}`,
    description: req.error_message || undefined,
    details: `Status: ${req.response_status} | IP: ${req.ip_address} | ${req.response_time_ms}ms`,
    timestamp: req.created_at,
    relevance_score: calculateRelevance(term, req.endpoint, req.error_message, req.ip_address?.toString()),
  }));
}

/**
 * Search Randomness Records
 */
async function searchRandomnessRecords(userId: string, term: string, limit: number): Promise<SearchResult[]> {
  // Handle epoch search (numeric)
  const epochSearch = parseInt(term, 10);
  const isEpochSearch = !isNaN(epochSearch);

  let query = supabaseAdmin
    .from('randomness_records')
    .select('id, epoch, format, count, walrus_object_id, cost_credits, created_at, verified')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (isEpochSearch) {
    query = query.eq('epoch', epochSearch);
  } else {
    query = query.or(`walrus_object_id.ilike.%${term}%,format.ilike.%${term}%`);
  }

  const { data, error } = await query;

  if (error || !data) return [];

  return data.map(rec => ({
    type: 'randomness' as const,
    id: rec.id,
    title: `Epoch ${rec.epoch} - ${rec.format}`,
    description: rec.walrus_object_id || undefined,
    details: `Count: ${rec.count} | Cost: ${rec.cost_credits} credits | Verified: ${rec.verified ? 'Yes' : 'No'}`,
    timestamp: rec.created_at,
    relevance_score: isEpochSearch 
      ? 1.0 
      : calculateRelevance(term, rec.walrus_object_id, rec.format),
  }));
}

/**
 * Calculate relevance score for search result
 */
function calculateRelevance(term: string, ...fields: (string | null | undefined)[]): number {
  const termLower = term.toLowerCase();
  let score = 0;

  for (const field of fields) {
    if (!field) continue;
    const fieldLower = field.toLowerCase();
    
    // Exact match
    if (fieldLower === termLower) {
      score += 1.0;
    }
    // Starts with
    else if (fieldLower.startsWith(termLower)) {
      score += 0.8;
    }
    // Contains
    else if (fieldLower.includes(termLower)) {
      score += 0.5;
    }
  }

  return Math.min(1.0, score);
}

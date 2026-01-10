/**
 * Request Logs API Endpoint
 * GET /api/requests - List request logs with pagination and filters
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth, AuthenticatedRequest } from '../lib/auth';
import { sendSuccess, sendError, sendBadRequest } from '../lib/response';
import { supabaseAdmin } from '../lib/supabase';

// Valid sort options
const SORT_OPTIONS = ['latest', 'oldest', 'slowest', 'most_expensive'] as const;
type SortOption = typeof SORT_OPTIONS[number];

// Valid status filters
const STATUS_OPTIONS = ['success', 'error', 'all'] as const;
type StatusOption = typeof STATUS_OPTIONS[number];

interface RequestLogItem {
  id: string;
  timestamp: string;
  api_key_name: string;
  endpoint: string;
  method: string;
  response_status: number;
  response_time_ms: number;
  cost_credits: number;
  request_count: number;
  status: 'success' | 'error';
  error_message: string | null;
  ip_address: string;
}

interface PaginationInfo {
  page: number;
  total_pages: number;
  total_records: number;
  limit: number;
  has_next: boolean;
  has_prev: boolean;
}

interface RequestLogsResponse {
  data: RequestLogItem[];
  pagination: PaginationInfo;
}

// Parse and validate query parameters
function parseQueryParams(query: VercelRequest['query']) {
  const errors: string[] = [];

  // Page (default 1, min 1)
  let page = 1;
  if (query.page) {
    const parsed = parseInt(query.page as string, 10);
    if (isNaN(parsed) || parsed < 1) {
      errors.push('page must be a positive integer');
    } else {
      page = parsed;
    }
  }

  // Limit (default 10, range 10-100)
  let limit = 10;
  if (query.limit) {
    const parsed = parseInt(query.limit as string, 10);
    if (isNaN(parsed) || parsed < 10 || parsed > 100) {
      errors.push('limit must be between 10 and 100');
    } else {
      limit = parsed;
    }
  }

  // Status filter
  let status: StatusOption = 'all';
  if (query.status) {
    const s = query.status as string;
    if (!STATUS_OPTIONS.includes(s as StatusOption)) {
      errors.push(`status must be one of: ${STATUS_OPTIONS.join(', ')}`);
    } else {
      status = s as StatusOption;
    }
  }

  // Sort option
  let sort: SortOption = 'latest';
  if (query.sort) {
    const s = query.sort as string;
    if (!SORT_OPTIONS.includes(s as SortOption)) {
      errors.push(`sort must be one of: ${SORT_OPTIONS.join(', ')}`);
    } else {
      sort = s as SortOption;
    }
  }

  // Date filters
  let fromDate: Date | null = null;
  let toDate: Date | null = null;

  if (query.from) {
    const parsed = new Date(query.from as string);
    if (isNaN(parsed.getTime())) {
      errors.push('from must be a valid ISO 8601 date');
    } else {
      fromDate = parsed;
    }
  }

  if (query.to) {
    const parsed = new Date(query.to as string);
    if (isNaN(parsed.getTime())) {
      errors.push('to must be a valid ISO 8601 date');
    } else {
      toDate = parsed;
    }
  }

  // Optional filters
  const endpoint = query.endpoint as string | undefined;
  const api_key_id = query.api_key_id as string | undefined;

  return {
    page,
    limit,
    status,
    sort,
    fromDate,
    toDate,
    endpoint,
    api_key_id,
    errors,
  };
}

// Get sort column and direction
function getSortClause(sort: SortOption): { column: string; ascending: boolean } {
  switch (sort) {
    case 'oldest':
      return { column: 'timestamp', ascending: true };
    case 'slowest':
      return { column: 'response_time_ms', ascending: false };
    case 'most_expensive':
      return { column: 'cost_credits', ascending: false };
    case 'latest':
    default:
      return { column: 'timestamp', ascending: false };
  }
}

async function handleGet(req: AuthenticatedRequest, res: VercelResponse) {
  const userId = req.user!.id;

  // Parse and validate query params
  const params = parseQueryParams(req.query);

  if (params.errors.length > 0) {
    return sendBadRequest(res, params.errors.join('; '));
  }

  const { page, limit, status, sort, fromDate, toDate, endpoint, api_key_id } = params;

  try {
    // Default to last 90 days if no date range specified
    const defaultFromDate = new Date();
    defaultFromDate.setDate(defaultFromDate.getDate() - 90);
    const effectiveFromDate = fromDate || defaultFromDate;
    const effectiveToDate = toDate || new Date();

    // Build the query for request_logs
    // We need to join with api_keys to get key names and filter by user
    let query = supabaseAdmin
      .from('request_logs')
      .select(`
        id,
        timestamp,
        endpoint,
        method,
        status_code,
        response_time_ms,
        credits_used,
        request_count,
        error_message,
        ip_address,
        api_key_id,
        api_keys!inner(name, user_id)
      `, { count: 'exact' })
      .eq('api_keys.user_id', userId)
      .gte('timestamp', effectiveFromDate.toISOString())
      .lte('timestamp', effectiveToDate.toISOString());

    // Apply status filter
    if (status === 'success') {
      query = query.lt('status_code', 400);
    } else if (status === 'error') {
      query = query.gte('status_code', 400);
    }

    // Apply endpoint filter
    if (endpoint) {
      query = query.ilike('endpoint', `%${endpoint}%`);
    }

    // Apply api_key_id filter
    if (api_key_id) {
      query = query.eq('api_key_id', api_key_id);
    }

    // Apply sorting
    const { column, ascending } = getSortClause(sort);
    query = query.order(column, { ascending });

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: logs, error, count } = await query;

    if (error) {
      console.error('Error fetching request logs:', error);
      return sendError(res, 'Failed to fetch request logs', 500);
    }

    // Transform the data
    const transformedLogs: RequestLogItem[] = (logs || []).map((log: any) => ({
      id: log.id,
      timestamp: log.timestamp,
      api_key_name: log.api_keys?.name || 'Unknown Key',
      endpoint: log.endpoint,
      method: log.method || 'POST',
      response_status: log.status_code,
      response_time_ms: log.response_time_ms || 0,
      cost_credits: log.credits_used || 0,
      request_count: log.request_count || 1,
      status: log.status_code < 400 ? 'success' : 'error',
      error_message: log.error_message,
      ip_address: log.ip_address || 'N/A',
    }));

    // Calculate pagination info
    const totalRecords = count || 0;
    const totalPages = Math.ceil(totalRecords / limit);

    const pagination: PaginationInfo = {
      page,
      total_pages: totalPages,
      total_records: totalRecords,
      limit,
      has_next: page < totalPages,
      has_prev: page > 1,
    };

    const response: RequestLogsResponse = {
      data: transformedLogs,
      pagination,
    };

    return sendSuccess(res, response);
  } catch (err) {
    console.error('Unexpected error in request logs:', err);
    return sendError(res, 'Internal server error', 500);
  }
}

async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return sendError(res, 'Method not allowed', 405);
  }

  return withAuth(handleGet)(req, res);
}

export default handler;

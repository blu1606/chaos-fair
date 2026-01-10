/**
 * Request Logs API Service
 */
import { API_CONFIG, API_ENDPOINTS, getAuthHeaders } from '@/config/api';

export interface RequestLogItem {
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

export interface PaginationInfo {
  page: number;
  total_pages: number;
  total_records: number;
  limit: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface RequestLogsResponse {
  data: RequestLogItem[];
  pagination: PaginationInfo;
}

export interface RequestLogsParams {
  page?: number;
  limit?: number;
  status?: 'success' | 'error' | 'all';
  endpoint?: string;
  api_key_id?: string;
  from?: string;
  to?: string;
  sort?: 'latest' | 'oldest' | 'slowest' | 'most_expensive';
}

// Mock data for testing mode
const mockRequestLogs: RequestLogItem[] = [
  {
    id: 'log-001',
    timestamp: '2026-01-10T14:32:15Z',
    api_key_name: 'Production Key',
    endpoint: '/v1/random',
    method: 'POST',
    response_status: 200,
    response_time_ms: 18,
    cost_credits: 0.5,
    request_count: 10,
    status: 'success',
    error_message: null,
    ip_address: '192.168.1.100',
  },
  {
    id: 'log-002',
    timestamp: '2026-01-10T14:31:45Z',
    api_key_name: 'Production Key',
    endpoint: '/v1/random',
    method: 'POST',
    response_status: 200,
    response_time_ms: 22,
    cost_credits: 0.25,
    request_count: 5,
    status: 'success',
    error_message: null,
    ip_address: '192.168.1.100',
  },
  {
    id: 'log-003',
    timestamp: '2026-01-10T14:30:20Z',
    api_key_name: 'Development Key',
    endpoint: '/v1/verify',
    method: 'GET',
    response_status: 200,
    response_time_ms: 12,
    cost_credits: 0.1,
    request_count: 1,
    status: 'success',
    error_message: null,
    ip_address: '10.0.0.50',
  },
  {
    id: 'log-004',
    timestamp: '2026-01-10T14:28:10Z',
    api_key_name: 'Production Key',
    endpoint: '/v1/random',
    method: 'POST',
    response_status: 429,
    response_time_ms: 5,
    cost_credits: 0,
    request_count: 100,
    status: 'error',
    error_message: 'Rate limit exceeded',
    ip_address: '192.168.1.100',
  },
  {
    id: 'log-005',
    timestamp: '2026-01-10T14:25:00Z',
    api_key_name: 'Development Key',
    endpoint: '/v1/epoch',
    method: 'GET',
    response_status: 200,
    response_time_ms: 8,
    cost_credits: 0.05,
    request_count: 1,
    status: 'success',
    error_message: null,
    ip_address: '10.0.0.50',
  },
  {
    id: 'log-006',
    timestamp: '2026-01-10T14:20:30Z',
    api_key_name: 'Production Key',
    endpoint: '/v1/random',
    method: 'POST',
    response_status: 500,
    response_time_ms: 150,
    cost_credits: 0,
    request_count: 50,
    status: 'error',
    error_message: 'Internal server error',
    ip_address: '192.168.1.100',
  },
  {
    id: 'log-007',
    timestamp: '2026-01-10T14:15:00Z',
    api_key_name: 'Production Key',
    endpoint: '/v1/random',
    method: 'POST',
    response_status: 200,
    response_time_ms: 25,
    cost_credits: 1.0,
    request_count: 20,
    status: 'success',
    error_message: null,
    ip_address: '192.168.1.101',
  },
  {
    id: 'log-008',
    timestamp: '2026-01-10T14:10:45Z',
    api_key_name: 'Development Key',
    endpoint: '/v1/random',
    method: 'POST',
    response_status: 400,
    response_time_ms: 3,
    cost_credits: 0,
    request_count: 0,
    status: 'error',
    error_message: 'Invalid request body',
    ip_address: '10.0.0.50',
  },
];

function getMockRequestLogs(params: RequestLogsParams): RequestLogsResponse {
  let filtered = [...mockRequestLogs];

  // Apply status filter
  if (params.status && params.status !== 'all') {
    filtered = filtered.filter((log) => log.status === params.status);
  }

  // Apply endpoint filter
  if (params.endpoint) {
    filtered = filtered.filter((log) =>
      log.endpoint.toLowerCase().includes(params.endpoint!.toLowerCase())
    );
  }

  // Apply sorting
  const sort = params.sort || 'latest';
  switch (sort) {
    case 'oldest':
      filtered.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      break;
    case 'slowest':
      filtered.sort((a, b) => b.response_time_ms - a.response_time_ms);
      break;
    case 'most_expensive':
      filtered.sort((a, b) => b.cost_credits - a.cost_credits);
      break;
    case 'latest':
    default:
      filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // Apply pagination
  const page = params.page || 1;
  const limit = params.limit || 10;
  const offset = (page - 1) * limit;
  const paginated = filtered.slice(offset, offset + limit);

  const totalRecords = filtered.length;
  const totalPages = Math.ceil(totalRecords / limit);

  return {
    data: paginated,
    pagination: {
      page,
      total_pages: totalPages,
      total_records: totalRecords,
      limit,
      has_next: page < totalPages,
      has_prev: page > 1,
    },
  };
}

export async function fetchRequestLogs(
  params: RequestLogsParams = {}
): Promise<RequestLogsResponse> {
  // Use mock data in testing mode
  if (API_CONFIG.useMockData) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return getMockRequestLogs(params);
  }

  // Build query string
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.set('page', params.page.toString());
  if (params.limit) queryParams.set('limit', params.limit.toString());
  if (params.status) queryParams.set('status', params.status);
  if (params.endpoint) queryParams.set('endpoint', params.endpoint);
  if (params.api_key_id) queryParams.set('api_key_id', params.api_key_id);
  if (params.from) queryParams.set('from', params.from);
  if (params.to) queryParams.set('to', params.to);
  if (params.sort) queryParams.set('sort', params.sort);

  const queryString = queryParams.toString();
  const url = `${API_ENDPOINTS.requests}${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: await getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  const result = await response.json();
  return result.data as RequestLogsResponse;
}

import api from './api';

export interface UsageSummary {
  total_requests: number;
  total_tokens_input: number;
  total_tokens_output: number;
  total_cost: number;
  requests_today: number;
  cost_today: number;
}

export interface UsageByTimeEntry {
  date: string;
  requests: number;
  tokens_input: number;
  tokens_output: number;
  cost: number;
}

export interface UsageByModelEntry {
  model_id: string;
  model_name: string;
  requests: number;
  tokens_input: number;
  tokens_output: number;
  cost: number;
}

export interface UsageByKeyEntry {
  api_key_id: string;
  api_key_name: string;
  key_prefix: string;
  requests: number;
  tokens_input: number;
  tokens_output: number;
  cost: number;
}

export interface RequestLog {
  id: string;
  model_name: string;
  api_key_name: string;
  key_prefix: string;
  tokens_input: number;
  tokens_output: number;
  cost: number;
  status_code: number;
  duration_ms: number;
  created_at: string;
}

export interface RequestLogsResponse {
  data: RequestLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export type GroupBy = 'hour' | 'day' | 'week' | 'month';

export interface UsageFilters {
  start_date?: string;
  end_date?: string;
  api_key_id?: string;
  model_id?: string;
  status_code?: number;
}

export const usageService = {
  async getUsageSummary(): Promise<UsageSummary> {
    const response = await api.get<UsageSummary>('/api/users/me/usage');
    return response.data;
  },

  async getUsageByTime(
    startDate: string,
    endDate: string,
    groupBy: GroupBy = 'day'
  ): Promise<UsageByTimeEntry[]> {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
      group_by: groupBy,
    });
    const response = await api.get<{ data: UsageByTimeEntry[] }>(
      `/api/users/me/usage/by-time?${params.toString()}`
    );
    return response.data.data;
  },

  async getUsageByModel(startDate: string, endDate: string): Promise<UsageByModelEntry[]> {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
    });
    const response = await api.get<{ data: UsageByModelEntry[] }>(
      `/api/users/me/usage/by-model?${params.toString()}`
    );
    return response.data.data;
  },

  async getUsageByKey(startDate: string, endDate: string): Promise<UsageByKeyEntry[]> {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
    });
    const response = await api.get<{ data: UsageByKeyEntry[] }>(
      `/api/users/me/usage/by-key?${params.toString()}`
    );
    return response.data.data;
  },

  async getRequestLogs(
    filters: UsageFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<RequestLogsResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);
    if (filters.api_key_id) params.append('api_key_id', filters.api_key_id);
    if (filters.model_id) params.append('model_id', filters.model_id);
    if (filters.status_code) params.append('status_code', filters.status_code.toString());

    const response = await api.get<RequestLogsResponse>(
      `/api/users/me/usage/logs?${params.toString()}`
    );
    return response.data;
  },
};


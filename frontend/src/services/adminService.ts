import api from './api';

export interface PlatformStats {
  total_users: number;
  active_users: number;
  total_requests: number;
  requests_last_30_days: number;
  total_credits_granted: number;
  total_credits_consumed: number;
}

export interface AnalyticsSummary {
  total_requests: number;
  total_tokens: number;
  total_cost: number;
  unique_users: number;
}

export interface UsageTrend {
  date: string;
  requests: number;
  tokens_input: number;
  tokens_output: number;
  cost: number;
}

export interface AnalyticsResponse {
  summary: AnalyticsSummary;
  trends: UsageTrend[];
}

export interface UserAnalytics {
  user_id: string;
  username: string;
  email: string;
  requests: number;
  tokens: number;
  cost: number;
}

export interface ModelAnalytics {
  model_id: string;
  model_name: string;
  requests: number;
  tokens: number;
  cost: number;
  unique_users: number;
}

export interface AdminUser {
  id: string;
  email: string;
  username: string;
  role: 'admin' | 'user';
  status: 'active' | 'suspended';
  created_at: string;
  credits: {
    balance: number;
    total_purchased: number;
    total_consumed: number;
  };
  api_keys_count: number;
  requests_count: number;
}

export interface UsersResponse {
  data: AdminUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface ShadowModel {
  id: string;
  display_name: string;
  provider_base_url: string;
  provider_model: string;
  pricing_input: number;
  pricing_output: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateModelData {
  display_name: string;
  provider_base_url: string;
  provider_token: string;
  provider_model: string;
  pricing_input: number;
  pricing_output: number;
  is_active?: boolean;
}

export interface UpdateModelData {
  display_name?: string;
  provider_base_url?: string;
  provider_token?: string;
  provider_model?: string;
  pricing_input?: number;
  pricing_output?: number;
  is_active?: boolean;
}

export interface SystemSetting {
  id: string;
  key: string;
  value: string;
  category: 'environment' | 'connection' | 'system';
  dataType: 'string' | 'number' | 'boolean' | 'json';
  isSecret: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSettingInput {
  key: string;
  value: string;
  category: 'environment' | 'connection' | 'system';
  dataType?: 'string' | 'number' | 'boolean' | 'json';
  isSecret?: boolean;
  description?: string;
}

export interface UpdateSettingInput {
  value?: string;
  category?: 'environment' | 'connection' | 'system';
  dataType?: 'string' | 'number' | 'boolean' | 'json';
  isSecret?: boolean;
  description?: string;
}

export const adminService = {
  // Stats
  async getStats(): Promise<PlatformStats> {
    const response = await api.get<PlatformStats>('/api/admin/stats');
    return response.data;
  },

  // Analytics
  async getAnalytics(startDate: string, endDate: string, groupBy: string = 'day'): Promise<AnalyticsResponse> {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
      group_by: groupBy,
    });
    const response = await api.get<AnalyticsResponse>(`/api/admin/analytics?${params.toString()}`);
    return response.data;
  },

  async getAnalyticsByUser(startDate: string, endDate: string, limit: number = 10): Promise<UserAnalytics[]> {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
      limit: limit.toString(),
    });
    const response = await api.get<{ data: UserAnalytics[] }>(`/api/admin/analytics/by-user?${params.toString()}`);
    return response.data.data;
  },

  async getAnalyticsByModel(startDate: string, endDate: string): Promise<ModelAnalytics[]> {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
    });
    const response = await api.get<{ data: ModelAnalytics[] }>(`/api/admin/analytics/by-model?${params.toString()}`);
    return response.data.data;
  },

  // Users
  async getUsers(page: number = 1, limit: number = 20, search?: string, status?: string): Promise<UsersResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    const response = await api.get<UsersResponse>(`/api/admin/users?${params.toString()}`);
    return response.data;
  },

  async grantCredits(userId: string, amount: number, description?: string): Promise<void> {
    await api.post(`/api/admin/users/${userId}/credits`, { amount, description });
  },

  async updateUserStatus(userId: string, status: 'active' | 'suspended'): Promise<void> {
    await api.patch(`/api/admin/users/${userId}/status`, { status });
  },

  // Models
  async getModels(): Promise<ShadowModel[]> {
    const response = await api.get<{ data: ShadowModel[] }>('/api/admin/models');
    return response.data.data;
  },

  async createModel(data: CreateModelData): Promise<ShadowModel> {
    const response = await api.post<ShadowModel>('/api/admin/models', data);
    return response.data;
  },

  async updateModel(id: string, data: UpdateModelData): Promise<ShadowModel> {
    const response = await api.put<ShadowModel>(`/api/admin/models/${id}`, data);
    return response.data;
  },

  async deleteModel(id: string): Promise<void> {
    await api.delete(`/api/admin/models/${id}`);
  },

  // Settings Management
  async getSettings(category?: string): Promise<{ data: SystemSetting[]; total: number }> {
    const params = category ? `?category=${category}` : '';
    const response = await api.get(`/admin/settings${params}`);
    return response.data;
  },

  async getSetting(key: string): Promise<{ data: SystemSetting }> {
    const response = await api.get(`/admin/settings/${encodeURIComponent(key)}`);
    return response.data;
  },

  async createSetting(data: CreateSettingInput): Promise<{ message: string; data: SystemSetting }> {
    const response = await api.post('/admin/settings', data);
    return response.data;
  },

  async updateSetting(key: string, data: UpdateSettingInput): Promise<{ message: string; data: SystemSetting }> {
    const response = await api.put(`/admin/settings/${encodeURIComponent(key)}`, data);
    return response.data;
  },

  async deleteSetting(key: string): Promise<{ message: string }> {
    const response = await api.delete(`/admin/settings/${encodeURIComponent(key)}`);
    return response.data;
  },

  async bulkUpsertSettings(settings: CreateSettingInput[]): Promise<{ message: string; data: SystemSetting[] }> {
    const response = await api.post('/admin/settings/bulk', { settings });
    return response.data;
  },
};


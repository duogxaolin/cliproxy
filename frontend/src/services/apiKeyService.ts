import api from './api';

export interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  allowed_models: string[] | null;
  quota_limit: number | null;
  quota_used: number;
  expires_at: string | null;
  created_at: string;
  revoked_at: string | null;
}

export interface ApiKeyCreateResponse extends ApiKey {
  key: string; // Only returned on creation
}

export interface CreateApiKeyData {
  name: string;
  allowed_models?: string[] | null;
  quota_limit?: number | null;
  expires_at?: string | null;
}

export interface UpdateApiKeyData {
  name?: string;
  allowed_models?: string[] | null;
  quota_limit?: number | null;
  expires_at?: string | null;
}

export const apiKeyService = {
  async getApiKeys(): Promise<ApiKey[]> {
    const response = await api.get<{ data: ApiKey[] }>('/api/api-keys');
    return response.data.data;
  },

  async createApiKey(data: CreateApiKeyData): Promise<ApiKeyCreateResponse> {
    const response = await api.post<ApiKeyCreateResponse>('/api/api-keys', data);
    return response.data;
  },

  async getApiKey(id: string): Promise<ApiKey> {
    const response = await api.get<ApiKey>(`/api/api-keys/${id}`);
    return response.data;
  },

  async updateApiKey(id: string, data: UpdateApiKeyData): Promise<ApiKey> {
    const response = await api.put<ApiKey>(`/api/api-keys/${id}`, data);
    return response.data;
  },

  async revokeApiKey(id: string): Promise<void> {
    await api.delete(`/api/api-keys/${id}`);
  },
};


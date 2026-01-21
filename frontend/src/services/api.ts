import axios from 'axios';

// Auto-detect server URL based on current window location
const getDefaultApiUrl = (): string => {
  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    // Use port 4567 for API by default
    return `${protocol}//${hostname}:4567`;
  }
  return 'http://localhost:4567';
};

const getDefaultCliProxyUrl = (): string => {
  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    // Use port 4569 for CLI Proxy by default
    return `${protocol}//${hostname}:4569`;
  }
  return 'http://localhost:4569';
};

// Get API URL from localStorage (set by admin) or fallback to auto-detected URL
const getApiUrl = (): string => {
  const savedApiUrl = localStorage.getItem('api_base_url');
  if (savedApiUrl) {
    return savedApiUrl;
  }
  // Check env variable first, then auto-detect
  return import.meta.env.VITE_API_URL || getDefaultApiUrl();
};

// Export function to get default URLs (for settings page)
export const getDefaultUrls = () => ({
  apiUrl: import.meta.env.VITE_API_URL || getDefaultApiUrl(),
  cliProxyUrl: import.meta.env.VITE_CLI_PROXY_URL || getDefaultCliProxyUrl(),
});

// Export function to update API URL dynamically
export const setApiBaseUrl = (url: string): void => {
  localStorage.setItem('api_base_url', url);
  // Update axios baseURL
  api.defaults.baseURL = url;
};

// Export function to get current API URL
export const getApiBaseUrl = (): string => {
  return api.defaults.baseURL || getApiUrl();
};

const api = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post(`${getApiUrl()}/api/auth/refresh`, {
            refreshToken,
          });

          const { token, refreshToken: newRefreshToken } = response.data;
          localStorage.setItem('token', token);
          localStorage.setItem('refreshToken', newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        } catch {
          // Refresh failed, clear auth
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth response types
interface AuthUser {
  id: string;
  email: string;
  username: string;
  role: 'admin' | 'user';
}

interface AuthResponse {
  user: AuthUser;
  token: string;
  refreshToken: string;
}

interface TokenPair {
  token: string;
  refreshToken: string;
}

// Auth service
export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/api/auth/login', { email, password });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Login failed');
    }
  },

  async register(email: string, username: string, password: string): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/api/auth/register', { email, username, password });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Registration failed');
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post('/api/auth/logout');
    } catch {
      // Ignore logout errors
    }
  },

  async refreshToken(refreshToken: string): Promise<TokenPair> {
    try {
      const response = await api.post<TokenPair>('/api/auth/refresh', { refreshToken });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Token refresh failed');
    }
  },
};

export default api;


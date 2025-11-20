import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8003/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to attach auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          localStorage.setItem('access_token', access);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export interface LoginResponse {
  access: string;
  refresh: string;
  user?: {
    username: string;
    email: string;
    subscription_tier: string;
    api_calls_today: number;
    api_calls_this_month: number;
  };
}

export interface RegisterResponse {
  user: {
    username: string;
    email: string;
  };
  tokens: {
    access: string;
    refresh: string;
  };
  message: string;
}

export interface UserProfile {
  username: string;
  email: string;
  subscription_tier: string;
  api_calls_today: number;
  api_calls_this_month: number;
  daily_quota: number;
  monthly_quota: number;
  max_file_size_mb: number;
  email_verified: boolean;
  created_at: string;
}

export interface APIKey {
  id: number;
  name: string;
  key?: string;  // Only returned on creation
  key_prefix: string;
  last_used: string | null;
  total_requests: number;
  is_active: boolean;
  created_at: string;
  expires_at: string | null;
}

export interface UsageLog {
  id: number;
  endpoint: string;
  method: string;
  tool_name: string;
  status_code: number;
  response_time_ms: number;
  file_size_bytes: number;
  cost_usd: string;
  timestamp: string;
}

export interface UsageStats {
  profile: UserProfile;
  usage: {
    today: number;
    this_month: number;
    daily_quota: number;
    monthly_quota: number;
    daily_remaining: number;
    monthly_remaining: number;
  };
  totals: {
    total_requests: number;
    total_cost_usd: number;
  };
  recent_activity: UsageLog[];
}

export interface PlatformStats {
  users: {
    total: number;
    active: number;
  };
  tools: {
    total: number;
    categories: number;
  };
  requests: {
    total: number;
    today: number;
  };
  uptime: string;
  total_cost_usd: number;
}

class AuthService {
  /**
   * Register a new user
   */
  async register(
    username: string,
    email: string,
    password: string,
    password2: string
  ): Promise<RegisterResponse> {
    const response = await api.post('/auth/register/', {
      username,
      email,
      password,
      password2,
    });
    return response.data;
  }

  /**
   * Login user and get JWT tokens
   */
  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await api.post('/auth/login/', {
      username,
      password,
    });
    return response.data;
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<{ access: string; refresh?: string }> {
    const response = await api.post('/auth/token/refresh/', {
      refresh: refreshToken,
    });
    return response.data;
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<UserProfile> {
    const response = await api.get('/auth/profile/');
    return response.data;
  }

  /**
   * Get usage statistics
   */
  async getUsageStats(): Promise<UsageStats> {
    const response = await api.get('/auth/usage/');
    return response.data;
  }

  /**
   * Get all API keys for current user
   */
  async getAPIKeys(): Promise<APIKey[]> {
    const response = await api.get('/auth/api-keys/');
    return response.data;
  }

  /**
   * Create a new API key
   */
  async createAPIKey(name: string): Promise<APIKey> {
    const response = await api.post('/auth/api-keys/', { name });
    return response.data;
  }

  /**
   * Delete an API key
   */
  async deleteAPIKey(id: number): Promise<void> {
    await api.delete(`/auth/api-keys/${id}/`);
  }

  /**
   * Verify if an API key is valid
   */
  async verifyAPIKey(key: string): Promise<{
    valid: boolean;
    user?: string;
    subscription_tier?: string;
    remaining_daily?: number;
    remaining_monthly?: number;
    error?: string;
  }> {
    const response = await api.post('/auth/verify-key/', { key });
    return response.data;
  }

  /**
   * Logout user (clear local tokens)
   */
  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /**
   * Get current refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  /**
   * Get platform statistics (public endpoint)
   */
  async getPlatformStats(): Promise<PlatformStats> {
    const response = await axios.get(`${API_BASE_URL}/auth/platform-stats/`);
    return response.data;
  }
}

export const authService = new AuthService();

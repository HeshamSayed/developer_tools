import axios from 'axios';
import type {
  MockApp,
  MockCollection,
  MockEnvironment,
  MockEndpoint,
  MockResponse,
  MockScenario,
  MockRequest,
  DashboardStats,
  MockAppFormData,
  MockCollectionFormData,
  MockEnvironmentFormData,
  MockEndpointFormData
} from '../types/mockAPI';

const API_BASE_URL = 'http://localhost:8003/api/mock-api';

// Create axios instance with interceptors
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

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - could trigger logout or refresh
      console.error('Authentication error:', error.response.data);
    }
    return Promise.reject(error);
  }
);

// ============ Mock App APIs ============

export const mockAppAPI = {
  // List all apps
  list: async (): Promise<MockApp[]> => {
    const response = await api.get('/apps/');
    return response.data;
  },

  // Get a specific app with collections and environments
  get: async (id: string): Promise<MockApp> => {
    const response = await api.get(`/apps/${id}/`);
    return response.data;
  },

  // Create a new app
  create: async (data: MockAppFormData): Promise<MockApp> => {
    const response = await api.post('/apps/', data);
    return response.data;
  },

  // Update an app
  update: async (id: string, data: Partial<MockAppFormData>): Promise<MockApp> => {
    const response = await api.patch(`/apps/${id}/`, data);
    return response.data;
  },

  // Delete an app
  delete: async (id: string): Promise<void> => {
    await api.delete(`/apps/${id}/`);
  }
};

// ============ Mock Collection APIs ============

export const mockCollectionAPI = {
  // List all collections (optionally filtered by app_id)
  list: async (appId?: string): Promise<MockCollection[]> => {
    const params = appId ? { app_id: appId } : {};
    const response = await api.get('/collections/', { params });
    return response.data;
  },

  // Get a specific collection with endpoints
  get: async (id: string): Promise<MockCollection> => {
    const response = await api.get(`/collections/${id}/`);
    return response.data;
  },

  // Create a new collection
  create: async (data: MockCollectionFormData): Promise<MockCollection> => {
    const response = await api.post('/collections/', data);
    return response.data;
  },

  // Update a collection
  update: async (id: string, data: Partial<MockCollectionFormData>): Promise<MockCollection> => {
    const response = await api.patch(`/collections/${id}/`, data);
    return response.data;
  },

  // Delete a collection
  delete: async (id: string): Promise<void> => {
    await api.delete(`/collections/${id}/`);
  }
};

// ============ Mock Environment APIs ============

export const mockEnvironmentAPI = {
  // List all environments (optionally filtered by app_id)
  list: async (appId?: string): Promise<MockEnvironment[]> => {
    const params = appId ? { app_id: appId } : {};
    const response = await api.get('/environments/', { params });
    return response.data;
  },

  // Get a specific environment
  get: async (id: string): Promise<MockEnvironment> => {
    const response = await api.get(`/environments/${id}/`);
    return response.data;
  },

  // Create a new environment
  create: async (data: MockEnvironmentFormData): Promise<MockEnvironment> => {
    const response = await api.post('/environments/', data);
    return response.data;
  },

  // Update an environment
  update: async (id: string, data: Partial<MockEnvironmentFormData>): Promise<MockEnvironment> => {
    const response = await api.patch(`/environments/${id}/`, data);
    return response.data;
  },

  // Delete an environment
  delete: async (id: string): Promise<void> => {
    await api.delete(`/environments/${id}/`);
  }
};

// ============ Mock Endpoint APIs ============

export const mockEndpointAPI = {
  // List all endpoints (optionally filtered by collection_id)
  list: async (collectionId?: string): Promise<MockEndpoint[]> => {
    const params = collectionId ? { collection_id: collectionId } : {};
    const response = await api.get('/endpoints/', { params });
    return response.data;
  },

  // Get a specific endpoint
  get: async (id: string): Promise<MockEndpoint> => {
    const response = await api.get(`/endpoints/${id}/`);
    return response.data;
  },

  // Create a new endpoint
  create: async (data: MockEndpointFormData): Promise<MockEndpoint> => {
    const response = await api.post('/endpoints/', data);
    return response.data;
  },

  // Update an endpoint
  update: async (id: string, data: Partial<MockEndpointFormData>): Promise<MockEndpoint> => {
    const response = await api.patch(`/endpoints/${id}/`, data);
    return response.data;
  },

  // Delete an endpoint
  delete: async (id: string): Promise<void> => {
    await api.delete(`/endpoints/${id}/`);
  },

  // Toggle endpoint active status
  toggleActive: async (id: string): Promise<{ is_active: boolean; message: string }> => {
    const response = await api.post(`/endpoints/${id}/toggle/`, {});
    return response.data;
  },

  // Reset endpoint counter
  resetCounter: async (id: string): Promise<{ message: string }> => {
    const response = await api.post(`/endpoints/${id}/reset/`, {});
    return response.data;
  },

  // Get endpoint stats
  getStats: async (id: string) => {
    const response = await api.get(`/endpoints/${id}/stats/`);
    return response.data;
  },

  // Get endpoint logs
  getLogs: async (id: string, limit = 50, offset = 0) => {
    const response = await api.get(`/endpoints/${id}/logs/`, {
      params: { limit, offset }
    });
    return response.data;
  },

  // Get code snippet
  getCodeSnippet: async (id: string) => {
    const response = await api.get(`/endpoints/${id}/snippet/`);
    return response.data;
  },

  // Export as OpenAPI
  exportOpenAPI: async (id: string) => {
    const response = await api.get(`/endpoints/${id}/openapi/`);
    return response.data;
  }
};

// ============ Mock Response APIs ============

export const mockResponseAPI = {
  // List all responses
  list: async (): Promise<MockResponse[]> => {
    const response = await api.get('/responses/');
    return response.data;
  },

  // Get a specific response
  get: async (id: string): Promise<MockResponse> => {
    const response = await api.get(`/responses/${id}/`);
    return response.data;
  },

  // Create a new response
  create: async (data: Partial<MockResponse>): Promise<MockResponse> => {
    const response = await api.post('/responses/', data);
    return response.data;
  },

  // Update a response
  update: async (id: string, data: Partial<MockResponse>): Promise<MockResponse> => {
    const response = await api.patch(`/responses/${id}/`, data);
    return response.data;
  },

  // Delete a response
  delete: async (id: string): Promise<void> => {
    await api.delete(`/responses/${id}/`);
  }
};

// ============ Mock Scenario APIs ============

export const mockScenarioAPI = {
  // List all scenarios
  list: async (): Promise<MockScenario[]> => {
    const response = await api.get('/scenarios/');
    return response.data;
  },

  // Get a specific scenario
  get: async (id: string): Promise<MockScenario> => {
    const response = await api.get(`/scenarios/${id}/`);
    return response.data;
  },

  // Create a new scenario
  create: async (data: Partial<MockScenario>): Promise<MockScenario> => {
    const response = await api.post('/scenarios/', data);
    return response.data;
  },

  // Update a scenario
  update: async (id: string, data: Partial<MockScenario>): Promise<MockScenario> => {
    const response = await api.patch(`/scenarios/${id}/`, data);
    return response.data;
  },

  // Delete a scenario
  delete: async (id: string): Promise<void> => {
    await api.delete(`/scenarios/${id}/`);
  }
};

// ============ Request Logs APIs ============

export const mockRequestAPI = {
  // List all request logs
  list: async (limit = 50, offset = 0) => {
    const response = await api.get('/logs/', {
      params: { limit, offset }
    });
    return response.data;
  },

  // Get a specific request log
  get: async (id: string): Promise<MockRequest> => {
    const response = await api.get(`/logs/${id}/`);
    return response.data;
  }
};

// ============ Dashboard Stats API ============

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get('/stats/');
  return response.data;
};

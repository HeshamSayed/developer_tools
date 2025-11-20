import axios from 'axios';
import type {
  MockEndpoint,
  MockEndpointCreate,
  MockResponse,
  MockScenario,
  MockRequest,
  MockStats,
  EndpointStats,
  CodeSnippets,
  OpenAPISpec,
} from '@/types/mocking';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class MockingService {
  private getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  // Mock Endpoints

  async getEndpoints(): Promise<MockEndpoint[]> {
    const response = await axios.get(`${API_BASE_URL}/api/mocking/endpoints/`, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  async getEndpoint(id: string): Promise<MockEndpoint> {
    const response = await axios.get(`${API_BASE_URL}/api/mocking/endpoints/${id}/`, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  async createEndpoint(data: MockEndpointCreate): Promise<MockEndpoint> {
    const response = await axios.post(
      `${API_BASE_URL}/api/mocking/endpoints/`,
      data,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  async updateEndpoint(id: string, data: Partial<MockEndpointCreate>): Promise<MockEndpoint> {
    const response = await axios.put(
      `${API_BASE_URL}/api/mocking/endpoints/${id}/`,
      data,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  async patchEndpoint(id: string, data: Partial<MockEndpointCreate>): Promise<MockEndpoint> {
    const response = await axios.patch(
      `${API_BASE_URL}/api/mocking/endpoints/${id}/`,
      data,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  async deleteEndpoint(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/api/mocking/endpoints/${id}/`, {
      headers: this.getAuthHeaders(),
    });
  }

  async toggleEndpoint(id: string): Promise<{ is_active: boolean; message: string }> {
    const response = await axios.post(
      `${API_BASE_URL}/api/mocking/endpoints/${id}/toggle/`,
      {},
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  async resetEndpointCounter(id: string): Promise<{ message: string }> {
    const response = await axios.post(
      `${API_BASE_URL}/api/mocking/endpoints/${id}/reset/`,
      {},
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  async getEndpointStats(id: string): Promise<EndpointStats> {
    const response = await axios.get(
      `${API_BASE_URL}/api/mocking/endpoints/${id}/stats/`,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  async getEndpointLogs(
    id: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ count: number; logs: MockRequest[] }> {
    const response = await axios.get(
      `${API_BASE_URL}/api/mocking/endpoints/${id}/logs/?limit=${limit}&offset=${offset}`,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  async getCodeSnippet(id: string): Promise<CodeSnippets> {
    const response = await axios.get(
      `${API_BASE_URL}/api/mocking/endpoints/${id}/snippet/`,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  async exportOpenAPI(id: string): Promise<OpenAPISpec> {
    const response = await axios.get(
      `${API_BASE_URL}/api/mocking/endpoints/${id}/openapi/`,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  // Mock Responses

  async getResponses(): Promise<MockResponse[]> {
    const response = await axios.get(`${API_BASE_URL}/api/mocking/responses/`, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  async getResponse(id: string): Promise<MockResponse> {
    const response = await axios.get(`${API_BASE_URL}/api/mocking/responses/${id}/`, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  async createResponse(data: Partial<MockResponse>): Promise<MockResponse> {
    const response = await axios.post(
      `${API_BASE_URL}/api/mocking/responses/`,
      data,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  async updateResponse(id: string, data: Partial<MockResponse>): Promise<MockResponse> {
    const response = await axios.put(
      `${API_BASE_URL}/api/mocking/responses/${id}/`,
      data,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  async deleteResponse(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/api/mocking/responses/${id}/`, {
      headers: this.getAuthHeaders(),
    });
  }

  // Mock Scenarios

  async getScenarios(): Promise<MockScenario[]> {
    const response = await axios.get(`${API_BASE_URL}/api/mocking/scenarios/`, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  async getScenario(id: string): Promise<MockScenario> {
    const response = await axios.get(`${API_BASE_URL}/api/mocking/scenarios/${id}/`, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  async createScenario(data: Partial<MockScenario>): Promise<MockScenario> {
    const response = await axios.post(
      `${API_BASE_URL}/api/mocking/scenarios/`,
      data,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  async updateScenario(id: string, data: Partial<MockScenario>): Promise<MockScenario> {
    const response = await axios.put(
      `${API_BASE_URL}/api/mocking/scenarios/${id}/`,
      data,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  async deleteScenario(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/api/mocking/scenarios/${id}/`, {
      headers: this.getAuthHeaders(),
    });
  }

  // Request Logs

  async getLogs(limit: number = 50, offset: number = 0): Promise<{ count: number; results: MockRequest[] }> {
    const response = await axios.get(
      `${API_BASE_URL}/api/mocking/logs/?limit=${limit}&offset=${offset}`,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  async getLog(id: string): Promise<MockRequest> {
    const response = await axios.get(`${API_BASE_URL}/api/mocking/logs/${id}/`, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  // Dashboard Stats

  async getDashboardStats(): Promise<MockStats> {
    const response = await axios.get(`${API_BASE_URL}/api/mocking/stats/`, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  // Public Mock Execution (no auth required)

  async executeMock(
    endpointId: string,
    method: string = 'GET',
    path: string = '',
    data?: any,
    headers?: Record<string, string>
  ): Promise<any> {
    const url = path
      ? `${API_BASE_URL}/api/mocking/execute/${endpointId}/${path}/`
      : `${API_BASE_URL}/api/mocking/execute/${endpointId}/`;

    const config: any = {
      method,
      url,
      headers: headers || { 'Content-Type': 'application/json' },
    };

    if (data && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;
  }
}

export const mockingService = new MockingService();

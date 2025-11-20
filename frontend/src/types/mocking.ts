/**
 * Type definitions for API Mocking Service
 */

export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export type Protocol = 'rest' | 'graphql' | 'soap' | 'toml' | 'yaml';

export type ConditionType =
  | 'default'
  | 'query_param'
  | 'header'
  | 'body_field'
  | 'random';

export interface MockEndpoint {
  id: string;
  user: number;
  user_username: string;
  name: string;
  description: string;
  path: string;
  method: HTTPMethod;
  protocol: Protocol;
  status_code: number;
  response_body: string;
  response_headers: Record<string, string>;
  content_type: string;
  latency_min: number;
  latency_max: number;
  error_rate: number;
  is_active: boolean;
  enable_logging: boolean;
  request_count: number;
  mock_url: string;
  responses: MockResponse[];
  created_at: string;
  updated_at: string;
}

export interface MockEndpointCreate {
  name: string;
  description?: string;
  path: string;
  method: HTTPMethod;
  protocol: Protocol;
  status_code: number;
  response_body: string;
  response_headers?: Record<string, string>;
  content_type?: string;
  latency_min?: number;
  latency_max?: number;
  error_rate?: number;
  is_active?: boolean;
  enable_logging?: boolean;
}

export interface MockResponse {
  id: string;
  endpoint: string;
  name: string;
  description: string;
  condition_type: ConditionType;
  condition_key: string;
  condition_value: string;
  condition_probability: number;
  status_code: number;
  response_body: string;
  response_headers: Record<string, string>;
  priority: number;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface MockScenario {
  id: string;
  user: number;
  user_username: string;
  name: string;
  description: string;
  endpoints: MockEndpoint[];
  endpoint_ids?: string[];
  scenario_data: Record<string, any>;
  is_active: boolean;
  endpoint_count: number;
  created_at: string;
  updated_at: string;
}

export interface MockRequest {
  id: string;
  endpoint: string;
  endpoint_name: string;
  method: string;
  path: string;
  query_params: Record<string, any>;
  headers: Record<string, string>;
  body: string;
  response_status: number;
  response_body: string;
  response_headers: Record<string, string>;
  response_time_ms: number;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export interface MockStats {
  total_endpoints: number;
  active_endpoints: number;
  total_requests: number;
  requests_today: number;
  avg_response_time: number;
  error_rate: number;
}

export interface EndpointStats {
  endpoint_id: string;
  endpoint_name: string;
  total_requests: number;
  recent_requests_24h: number;
  avg_response_time_ms: number;
  error_count: number;
  error_rate_percent: number;
  is_active: boolean;
}

export interface CodeSnippets {
  endpoint_name: string;
  mock_url: string;
  method: HTTPMethod;
  snippets: {
    curl: string;
    fetch: string;
    axios: string;
  };
}

export interface OpenAPISpec {
  openapi: string;
  info: {
    title: string;
    description: string;
    version: string;
  };
  servers: Array<{
    url: string;
    description: string;
  }>;
  paths: Record<string, any>;
}

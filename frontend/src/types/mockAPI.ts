// TypeScript types for Mock API hierarchical structure

export interface MockApp {
  id: string;
  user: string;
  user_username: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  base_url: string;
  is_public: boolean;
  total_collections: number;
  total_endpoints: number;
  total_requests: number;
  collections?: MockCollection[];
  environments?: MockEnvironment[];
  created_at: string;
  updated_at: string;
}

export interface MockCollection {
  id: string;
  app: string;
  name: string;
  description: string;
  order: number;
  folder: string;
  total_endpoints: number;
  total_requests: number;
  endpoints?: MockEndpoint[];
  created_at: string;
  updated_at: string;
}

export interface MockEnvironment {
  id: string;
  app: string;
  name: string;
  variables: Record<string, string>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MockEndpoint {
  id: string;
  collection: string;
  collection_name?: string;
  name: string;
  description: string;
  order: number;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';
  protocol: 'rest' | 'graphql' | 'soap' | 'toml' | 'yaml';
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
  responses?: MockResponse[];
  created_at: string;
  updated_at: string;
}

export interface MockResponse {
  id: string;
  endpoint: string;
  name: string;
  description: string;
  condition_type: 'default' | 'query_param' | 'header' | 'body_field' | 'random';
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
  app: string;
  app_name?: string;
  name: string;
  description: string;
  endpoints: MockEndpoint[];
  endpoint_ids: string[];
  scenario_data: Record<string, any>;
  is_active: boolean;
  endpoint_count: number;
  created_at: string;
  updated_at: string;
}

export interface MockRequest {
  id: string;
  endpoint: string;
  endpoint_name?: string;
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

export interface DashboardStats {
  total_endpoints: number;
  active_endpoints: number;
  total_requests: number;
  requests_today: number;
  avg_response_time: number;
  error_rate: number;
}

// Form data types
export interface MockAppFormData {
  name: string;
  description: string;
  icon: string;
  color: string;
  base_url: string;
  is_public: boolean;
}

export interface MockCollectionFormData {
  app: string;
  name: string;
  description: string;
  order: number;
  folder: string;
}

export interface MockEnvironmentFormData {
  app: string;
  name: string;
  variables: Record<string, string>;
  is_active: boolean;
}

export interface MockEndpointFormData {
  collection: string;
  name: string;
  description: string;
  order: number;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';
  protocol: 'rest' | 'graphql' | 'soap' | 'toml' | 'yaml';
  status_code: number;
  response_body: string;
  response_headers: Record<string, string>;
  content_type: string;
  latency_min: number;
  latency_max: number;
  error_rate: number;
  is_active: boolean;
  enable_logging: boolean;
}

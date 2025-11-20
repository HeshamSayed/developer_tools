/**
 * AI Assistant Types
 * TypeScript definitions for AI assistant functionality
 */

export interface AIQuotaStatus {
  quota: {
    monthly_quota: number;
    additional_quota: number;
    total_quota: number;
    used_this_month: number;
    remaining: number;
    last_reset: string;
  };
  usage_stats: {
    total_requests_30d: number;
    total_tokens_30d: number;
    total_cost_usd_30d: string;
  };
  pricing: {
    price_per_request_usd: string;
    suggested_packages: Array<{
      quantity: number;
      price_usd: string;
    }>;
  };
}

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    tokens_used?: number;
    response_time_ms?: number;
    context_type?: string;
  };
}

export interface AIResponse {
  response: string;
  metadata: {
    tokens_used: number;
    response_time_ms: number;
    context_type: string;
  };
  quota_status: {
    used: number;
    total: number;
    remaining: number;
  };
}

export interface AIUsageHistoryItem {
  id: number;
  prompt: string;
  response: string;
  context_type: 'code_explanation' | 'error_fix' | 'best_practice' | 'general_chat';
  tokens_used: number;
  response_time_ms: number;
  cost_usd: string;
  created_at: string;
}

export interface AIUsageHistory {
  history: AIUsageHistoryItem[];
  total_count: number;
}

export interface PurchaseRequest {
  quantity: number;
  payment_method: 'credit_card' | 'paypal' | 'crypto';
  payment_token: string;
}

export interface PurchaseResponse {
  success: boolean;
  message: string;
  purchase: {
    id: number;
    quantity: number;
    price_usd: string;
    status: string;
  };
  quota_status: {
    used: number;
    total: number;
    remaining: number;
  };
}

export type ContextType = 'code_explanation' | 'error_fix' | 'best_practice' | 'general_chat';

export interface AskRequest {
  prompt: string;
  context_type?: ContextType;
  code_snippet?: string;
}

export interface ContentPolicyViolation {
  error: string;
  message: string;
  violation_type: 'political' | 'pornographic' | 'hacking' | 'spam' | 'other';
}

export interface QuotaExceededError {
  error: string;
  message: string;
  quota_status: {
    used: number;
    total: number;
    remaining: number;
  };
  purchase_info: {
    price_per_request_usd: string;
    suggested_package: number;
  };
}

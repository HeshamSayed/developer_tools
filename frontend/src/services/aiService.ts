/**
 * AI Assistant Service
 * Handles all communication with AI assistant backend
 */

import axios from 'axios';
import type {
  AIQuotaStatus,
  AIResponse,
  AIUsageHistory,
  AskRequest,
  PurchaseRequest,
  PurchaseResponse,
} from '@/types/ai';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8003';

class AIService {
  private getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Ask the AI assistant a question
   */
  async ask(request: AskRequest): Promise<AIResponse> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/ai/ask/`,
        request,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error: any) {
      // Re-throw with structured error
      if (error.response) {
        throw {
          status: error.response.status,
          data: error.response.data,
        };
      }
      throw error;
    }
  }

  /**
   * Get current quota status
   */
  async getQuotaStatus(): Promise<AIQuotaStatus> {
    const response = await axios.get(`${API_BASE_URL}/api/ai/quota/`, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  /**
   * Get usage history
   */
  async getUsageHistory(limit: number = 20): Promise<AIUsageHistory> {
    const response = await axios.get(`${API_BASE_URL}/api/ai/history/`, {
      headers: this.getAuthHeaders(),
      params: { limit },
    });
    return response.data;
  }

  /**
   * Purchase additional quota
   */
  async purchaseQuota(request: PurchaseRequest): Promise<PurchaseResponse> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/ai/purchase/`,
        request,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw {
          status: error.response.status,
          data: error.response.data,
        };
      }
      throw error;
    }
  }

  /**
   * Check if user has available quota
   */
  async hasAvailableQuota(): Promise<boolean> {
    try {
      const status = await this.getQuotaStatus();
      return status.quota.remaining > 0;
    } catch (error) {
      return false;
    }
  }
}

export const aiService = new AIService();
export default aiService;

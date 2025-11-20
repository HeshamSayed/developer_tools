import { useState, useEffect } from 'react';
import { aiService } from '@/services/aiService';
import type { AIQuotaStatus } from '@/types/ai';
import ProfessionalCard from '@/components/Common/ProfessionalCard';
import ProfessionalButton from '@/components/Common/ProfessionalButton';
import Loading from '@/components/Common/Loading';

interface AIQuotaDisplayProps {
  onPurchaseClick?: () => void;
}

export default function AIQuotaDisplay({ onPurchaseClick }: AIQuotaDisplayProps) {
  const [quotaStatus, setQuotaStatus] = useState<AIQuotaStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadQuotaStatus();
  }, []);

  const loadQuotaStatus = async () => {
    try {
      setLoading(true);
      const status = await aiService.getQuotaStatus();
      setQuotaStatus(status);
    } catch (err) {
      setError('Failed to load quota status');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading size="md" text="Loading quota..." />;
  }

  if (error || !quotaStatus) {
    return (
      <ProfessionalCard padding="md">
        <p className="text-red-600 dark:text-red-400">
          {error || 'Failed to load quota status'}
        </p>
      </ProfessionalCard>
    );
  }

  const { quota, usage_stats, pricing } = quotaStatus;
  const percentageUsed = (quota.used_this_month / quota.total_quota) * 100;
  const isLowQuota = quota.remaining < 5;
  const isOutOfQuota = quota.remaining === 0;

  return (
    <ProfessionalCard gradient padding="lg">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">AI Assistant Quota</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Monthly usage tracking</p>
        </div>
      </div>

      {/* Quota Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {quota.remaining} of {quota.total_quota} requests remaining
          </span>
          <span className={`text-sm font-bold ${isLowQuota ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
            {Math.round(percentageUsed)}%
          </span>
        </div>

        <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              isOutOfQuota
                ? 'bg-red-500'
                : isLowQuota
                ? 'bg-yellow-500'
                : 'bg-gradient-to-r from-primary-500 to-accent-500'
            }`}
            style={{ width: `${Math.min(percentageUsed, 100)}%` }}
          />
        </div>
      </div>

      {/* Quota Breakdown */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border-2 border-gray-100 dark:border-gray-700">
          <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Monthly Quota</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{quota.monthly_quota}</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border-2 border-gray-100 dark:border-gray-700">
          <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Additional</div>
          <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">{quota.additional_quota}</div>
        </div>
      </div>

      {/* Usage Stats (Last 30 Days) */}
      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 mb-6">
        <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 uppercase tracking-wide">
          30-Day Usage
        </h4>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Total Requests</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {usage_stats.total_requests_30d}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Total Tokens</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {usage_stats.total_tokens_30d.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Total Cost</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              ${parseFloat(usage_stats.total_cost_usd_30d).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Warning Messages */}
      {isOutOfQuota && (
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-red-800 dark:text-red-300 mb-1">
                Quota Exceeded
              </p>
              <p className="text-xs text-red-700 dark:text-red-400">
                Purchase additional quota to continue using the AI assistant.
              </p>
            </div>
          </div>
        </div>
      )}

      {isLowQuota && !isOutOfQuota && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300 mb-1">
                Low Quota Warning
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-400">
                You have less than 5 requests remaining this month.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Purchase Packages */}
      <div>
        <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 uppercase tracking-wide">
          Purchase Additional Quota
        </h4>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {pricing.suggested_packages.map((pkg, index) => {
            const savings = index > 0 ? Math.round((1 - parseFloat(pkg.price_usd) / (pkg.quantity * parseFloat(pricing.price_per_request_usd))) * 100) : 0;
            return (
              <button
                key={index}
                onClick={onPurchaseClick}
                className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-400 rounded-xl p-3 transition-all text-center"
              >
                {savings > 0 && (
                  <div className="text-xs font-bold text-green-600 dark:text-green-400 mb-1">
                    Save {savings}%
                  </div>
                )}
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {pkg.quantity}
                </div>
                <div className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                  ${parseFloat(pkg.price_usd).toFixed(2)}
                </div>
              </button>
            );
          })}
        </div>

        <ProfessionalButton
          onClick={onPurchaseClick}
          fullWidth
          size="lg"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        >
          Purchase Quota
        </ProfessionalButton>
      </div>

      {/* Pricing Note */}
      <p className="mt-4 text-xs text-center text-gray-500 dark:text-gray-400">
        ${pricing.price_per_request_usd} per request · Bulk discounts available
      </p>
    </ProfessionalCard>
  );
}

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { authService, UsageStats, UsageLog } from '@/services/authService';
import Loading from '@/components/Common/Loading';
import APIKeyManagement from '@/components/Dashboard/APIKeyManagement';
import UsageChart from '@/components/Dashboard/UsageChart';
import ToolsAnalytics from '@/components/Dashboard/ToolsAnalytics';
import UsageAlerts from '@/components/Dashboard/UsageAlerts';
import DataExport from '@/components/Dashboard/DataExport';
import ProfessionalCard from '@/components/Common/ProfessionalCard';
import ProfessionalButton from '@/components/Common/ProfessionalButton';
import ProfessionalSection from '@/components/Common/ProfessionalSection';

export default function Dashboard() {
  const { user, refreshUser } = useAuth();
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsageStats();
  }, []);

  const loadUsageStats = async () => {
    try {
      setLoading(true);
      const stats = await authService.getUsageStats();
      setUsageStats(stats);
      await refreshUser();
    } catch (err: any) {
      setError('Failed to load usage statistics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading size="lg" text="Loading dashboard..." fullScreen />;
  }

  if (error || !usageStats) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <ProfessionalCard padding="lg" className="max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {error || 'Failed to load dashboard'}
          </h3>
          <ProfessionalButton onClick={loadUsageStats} className="mt-4">
            Try Again
          </ProfessionalButton>
        </ProfessionalCard>
      </div>
    );
  }

  const dailyPercentage = (usageStats.usage.today / usageStats.usage.daily_quota) * 100;
  const monthlyPercentage = (usageStats.usage.this_month / usageStats.usage.monthly_quota) * 100;

  // Generate usage history from recent activity
  const usageHistory = (() => {
    const data = [];
    const today = new Date();
    const activityByDate: Record<string, number> = {};

    // Group recent activity by date
    usageStats.recent_activity.forEach(log => {
      const date = new Date(log.timestamp).toISOString().split('T')[0];
      activityByDate[date] = (activityByDate[date] || 0) + 1;
    });

    // Fill last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      data.push({
        date: date.toISOString(),
        count: activityByDate[dateStr] || 0,
      });
    }

    return data;
  })();

  // Generate tool usage from recent activity
  const toolUsage = (() => {
    const toolCounts: Record<string, number> = {};

    usageStats.recent_activity.forEach(log => {
      const toolName = log.tool_name || 'unknown';
      toolCounts[toolName] = (toolCounts[toolName] || 0) + 1;
    });

    return Object.entries(toolCounts)
      .map(([tool_slug, count]) => ({ tool_slug, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  })();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <ProfessionalSection background="transparent" padding="lg">
        {/* Header with Greeting */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
                Welcome back, {user?.username}! 👋
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Here's your productivity overview
              </p>
            </div>

            {/* Subscription Badge */}
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-2xl shadow-lg">
                <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="font-bold text-lg capitalize">{user?.subscription_tier || 'Free'} Plan</span>
              </div>
            </div>
          </div>

          {/* Upgrade Banner */}
          {user?.subscription_tier === 'free' && (
            <div className="mt-6">
              <ProfessionalCard gradient padding="md" className="border-2 border-primary-200 dark:border-primary-800">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">
                        Unlock More Power
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300">
                        Upgrade to <strong>Pro</strong> for unlimited calls, advanced analytics, and team collaboration
                      </p>
                    </div>
                  </div>
                  <ProfessionalButton to="/pricing" size="lg">
                    View Plans
                  </ProfessionalButton>
                </div>
              </ProfessionalCard>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Today's Usage */}
          <ProfessionalCard hover padding="lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Today's Usage
              </h3>
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-4xl font-extrabold text-gray-900 dark:text-white">
                {usageStats.usage.today.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                of {usageStats.usage.daily_quota.toLocaleString()} calls
              </p>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
              <div
                className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(dailyPercentage, 100)}%` }}
              />
            </div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {usageStats.usage.daily_remaining.toLocaleString()} remaining
            </p>
          </ProfessionalCard>

          {/* Monthly Usage */}
          <ProfessionalCard hover padding="lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Monthly Usage
              </h3>
              <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-4xl font-extrabold text-gray-900 dark:text-white">
                {usageStats.usage.this_month.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                of {usageStats.usage.monthly_quota.toLocaleString()} calls
              </p>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
              <div
                className="bg-gradient-to-r from-accent-500 to-accent-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(monthlyPercentage, 100)}%` }}
              />
            </div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {usageStats.usage.monthly_remaining.toLocaleString()} remaining
            </p>
          </ProfessionalCard>

          {/* Total Requests */}
          <ProfessionalCard hover padding="lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Total Requests
              </h3>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mb-2">
              <p className="text-4xl font-extrabold text-gray-900 dark:text-white">
                {usageStats.totals.total_requests.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">All time</p>
            </div>
          </ProfessionalCard>

          {/* Total Cost */}
          <ProfessionalCard hover padding="lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Total Cost
              </h3>
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mb-2">
              <p className="text-4xl font-extrabold text-gray-900 dark:text-white">
                ${usageStats.totals.total_cost_usd.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">All time</p>
            </div>
          </ProfessionalCard>
        </div>

        {/* Usage Alerts */}
        <div className="mb-8">
          <UsageAlerts
            dailyUsage={usageStats.usage.today}
            dailyQuota={usageStats.usage.daily_quota}
            monthlyUsage={usageStats.usage.this_month}
            monthlyQuota={usageStats.usage.monthly_quota}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <ProfessionalCard padding="lg">
            <UsageChart
              data={usageHistory}
              title="Usage Trend (Last 7 Days)"
              color="primary"
            />
          </ProfessionalCard>

          <ProfessionalCard padding="lg">
            <ToolsAnalytics toolUsage={toolUsage} />
          </ProfessionalCard>
        </div>

        {/* API Keys and Export */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div>
            <APIKeyManagement />
          </div>
          <div>
            <DataExport usageStats={usageStats} />
          </div>
        </div>

        {/* Recent Activity */}
        <ProfessionalCard padding="lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Activity</h2>
            {usageStats.recent_activity.length > 0 && (
              <span className="px-4 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-semibold">
                {usageStats.recent_activity.length} requests
              </span>
            )}
          </div>

          {usageStats.recent_activity.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                No activity yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Start using the tools to see your activity here
              </p>
              <ProfessionalButton to="/" size="lg">
                Browse Tools
              </ProfessionalButton>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                    <th className="text-left py-4 px-4 text-sm font-bold text-gray-700 dark:text-gray-300">Tool</th>
                    <th className="text-left py-4 px-4 text-sm font-bold text-gray-700 dark:text-gray-300">Endpoint</th>
                    <th className="text-left py-4 px-4 text-sm font-bold text-gray-700 dark:text-gray-300">Status</th>
                    <th className="text-left py-4 px-4 text-sm font-bold text-gray-700 dark:text-gray-300">Time</th>
                    <th className="text-left py-4 px-4 text-sm font-bold text-gray-700 dark:text-gray-300">Cost</th>
                    <th className="text-left py-4 px-4 text-sm font-bold text-gray-700 dark:text-gray-300">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {usageStats.recent_activity.map((log: UsageLog) => (
                    <tr
                      key={log.id}
                      className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {log.tool_name || 'N/A'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400 font-mono">
                        {log.method} {log.endpoint}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${
                            log.status_code < 300
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : log.status_code < 500
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}
                        >
                          {log.status_code}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400 font-mono">
                        {log.response_time_ms.toFixed(0)}ms
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400 font-mono">
                        ${parseFloat(log.cost_usd).toFixed(4)}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(log.timestamp).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ProfessionalCard>
      </ProfessionalSection>
    </div>
  );
}

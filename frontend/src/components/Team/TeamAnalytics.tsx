import type { TeamStats } from '@/types/team'
import UsageChart from '@/components/Dashboard/UsageChart'
import ToolsAnalytics from '@/components/Dashboard/ToolsAnalytics'

interface TeamAnalyticsProps {
  stats: TeamStats
}

export default function TeamAnalytics({ stats }: TeamAnalyticsProps) {
  // Generate mock 7-day data for team
  const generateMockData = () => {
    const data = []
    const today = new Date()
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      data.push({
        date: date.toISOString(),
        count: Math.floor(Math.random() * 200) + 50,
      })
    }
    data[data.length - 1].count = stats.total_api_calls_today
    return data
  }

  const usageData = generateMockData()
  const toolUsage = stats.top_tools.map(tool => ({
    tool_slug: tool.tool_slug,
    count: tool.usage_count,
  }))

  return (
    <div className="space-y-6">
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UsageChart
          data={usageData}
          title="Team Usage (Last 7 Days)"
          color="primary"
        />
        <ToolsAnalytics toolUsage={toolUsage} />
      </div>

      {/* Additional Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Usage Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
              {stats.total_api_calls.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total API Calls</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-accent-600 dark:text-accent-400">
              {stats.active_members}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Active Members</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-success-600 dark:text-success-400">
              {stats.quota_remaining.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Calls Remaining</p>
          </div>
        </div>
      </div>
    </div>
  )
}

import type { TeamStats } from '@/types/team'

interface TeamOverviewProps {
  stats: TeamStats
}

export default function TeamOverview({ stats }: TeamOverviewProps) {
  const quotaPercentage = (stats.quota_used / stats.quota_limit) * 100

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-900/30 rounded-xl p-6 border border-primary-200 dark:border-primary-800">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-primary-900 dark:text-primary-300">Team Members</h3>
            <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-primary-900 dark:text-white">
            {stats.total_members}
          </p>
          <p className="text-xs text-primary-700 dark:text-primary-400 mt-1">
            {stats.active_members} active today
          </p>
        </div>

        <div className="bg-gradient-to-br from-accent-50 to-accent-100 dark:from-accent-900/20 dark:to-accent-900/30 rounded-xl p-6 border border-accent-200 dark:border-accent-800">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-accent-900 dark:text-accent-300">Today's Usage</h3>
            <svg className="w-8 h-8 text-accent-600 dark:text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-accent-900 dark:text-white">
            {stats.total_api_calls_today.toLocaleString()}
          </p>
          <p className="text-xs text-accent-700 dark:text-accent-400 mt-1">
            API calls
          </p>
        </div>

        <div className="bg-gradient-to-br from-success-50 to-success-100 dark:from-success-900/20 dark:to-success-900/30 rounded-xl p-6 border border-success-200 dark:border-success-800">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-success-900 dark:text-success-300">This Month</h3>
            <svg className="w-8 h-8 text-success-600 dark:text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-success-900 dark:text-white">
            {stats.total_api_calls_this_month.toLocaleString()}
          </p>
          <p className="text-xs text-success-700 dark:text-success-400 mt-1">
            API calls
          </p>
        </div>

        <div className="bg-gradient-to-br from-warning-50 to-warning-100 dark:from-warning-900/20 dark:to-warning-900/30 rounded-xl p-6 border border-warning-200 dark:border-warning-800">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-warning-900 dark:text-warning-300">Quota Status</h3>
            <svg className="w-8 h-8 text-warning-600 dark:text-warning-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-warning-900 dark:text-white">
            {quotaPercentage.toFixed(0)}%
          </p>
          <div className="w-full bg-warning-200 dark:bg-warning-800 rounded-full h-2 mt-2">
            <div
              className="bg-warning-600 dark:bg-warning-400 h-2 rounded-full transition-all"
              style={{ width: `${Math.min(quotaPercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Top Tools */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Tools</h3>
        {stats.top_tools.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No tools used yet
          </p>
        ) : (
          <div className="space-y-3">
            {stats.top_tools.map((tool, index) => (
              <div key={tool.tool_slug} className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/50 dark:to-primary-800 text-sm font-bold text-primary-700 dark:text-primary-300">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">{tool.tool_name}</p>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                    <div
                      className="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full"
                      style={{
                        width: `${(tool.usage_count / stats.top_tools[0].usage_count) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 min-w-[4rem] text-right">
                  {tool.usage_count} calls
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Member Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Member Activity</h3>
        {stats.member_activity.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No member activity yet
          </p>
        ) : (
          <div className="space-y-3">
            {stats.member_activity.map((member) => (
              <div key={member.user_id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-semibold">
                    {member.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{member.username}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Last active: {new Date(member.last_active).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {member.usage_count} calls
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

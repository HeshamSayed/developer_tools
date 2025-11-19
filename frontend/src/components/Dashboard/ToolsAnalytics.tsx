import { useState, useEffect } from 'react'
import { getToolBySlug } from '@/utils/toolsData'

interface ToolUsage {
  tool_slug: string
  count: number
}

interface ToolsAnalyticsProps {
  toolUsage: ToolUsage[]
}

export default function ToolsAnalytics({ toolUsage }: ToolsAnalyticsProps) {
  const [sortedTools, setSortedTools] = useState<Array<ToolUsage & { name: string; percentage: number }>>([])

  useEffect(() => {
    const total = toolUsage.reduce((sum, t) => sum + t.count, 0)
    const enriched = toolUsage
      .map(t => {
        const tool = getToolBySlug(t.tool_slug)
        return {
          ...t,
          name: tool?.name || t.tool_slug,
          percentage: total > 0 ? (t.count / total) * 100 : 0,
        }
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    setSortedTools(enriched)
  }, [toolUsage])

  const getBarColor = (index: number) => {
    const colors = [
      'from-primary-500 to-primary-600',
      'from-accent-500 to-accent-600',
      'from-success-500 to-success-600',
      'from-warning-500 to-warning-600',
      'from-purple-500 to-purple-600',
      'from-pink-500 to-pink-600',
      'from-indigo-500 to-indigo-600',
      'from-blue-500 to-blue-600',
      'from-green-500 to-green-600',
      'from-yellow-500 to-yellow-600',
    ]
    return colors[index % colors.length]
  }

  if (sortedTools.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Most Used Tools</h3>
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400">No tool usage data yet</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Start using tools to see your analytics</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Most Used Tools</h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">Top 10</span>
      </div>

      <div className="space-y-4">
        {sortedTools.map((tool, index) => (
          <div key={tool.tool_slug} className="group">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-xs font-bold text-gray-700 dark:text-gray-300">
                  {index + 1}
                </span>
                <span className="font-medium text-gray-900 dark:text-white text-sm truncate max-w-xs">
                  {tool.name}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {tool.count} {tool.count === 1 ? 'call' : 'calls'}
                </span>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 min-w-[3rem] text-right">
                  {tool.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full bg-gradient-to-r ${getBarColor(index)} transition-all duration-500 group-hover:opacity-80`}
                style={{ width: `${tool.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

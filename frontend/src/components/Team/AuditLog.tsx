import { useState, useEffect } from 'react'
import { teamService } from '@/services/teamService'
import type { TeamAuditLog } from '@/types/team'

interface AuditLogProps {
  teamId: string
}

export default function AuditLog({ teamId }: AuditLogProps) {
  const [logs, setLogs] = useState<TeamAuditLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLogs()
  }, [teamId])

  const loadLogs = async () => {
    try {
      setLoading(true)
      const data = await teamService.getAuditLog(teamId, { limit: 50 })
      setLogs(data)
    } catch (err) {
      console.error('Failed to load audit log', err)
    } finally {
      setLoading(false)
    }
  }

  const getActionIcon = (action: string) => {
    if (action.includes('create')) return '➕'
    if (action.includes('update')) return '✏️'
    if (action.includes('delete')) return '🗑️'
    if (action.includes('invite')) return '📧'
    if (action.includes('join')) return '👋'
    return '📝'
  }

  const getActionColor = (action: string) => {
    if (action.includes('delete')) return 'text-red-600 dark:text-red-400'
    if (action.includes('create')) return 'text-green-600 dark:text-green-400'
    if (action.includes('update')) return 'text-blue-600 dark:text-blue-400'
    return 'text-gray-600 dark:text-gray-400'
  }

  if (loading) {
    return <div className="text-center py-8">Loading audit log...</div>
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Audit Log ({logs.length})
      </h3>

      {logs.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-12">
          No audit log entries yet
        </p>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="text-2xl">{getActionIcon(log.action)}</span>
              <div className="flex-1">
                <p className={`font-medium ${getActionColor(log.action)}`}>
                  {log.action}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">{log.username}</span> •{' '}
                  {log.resource_type}
                  {log.resource_id && ` #${log.resource_id.substring(0, 8)}`}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {new Date(log.created_at).toLocaleString()} • {log.ip_address}
                </p>
                {Object.keys(log.details).length > 0 && (
                  <details className="mt-2">
                    <summary className="text-xs text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-800 dark:hover:text-gray-200">
                      View details
                    </summary>
                    <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-x-auto">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

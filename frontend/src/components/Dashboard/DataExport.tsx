import { useState } from 'react'
import { UsageStats } from '@/services/authService'

interface DataExportProps {
  usageStats: UsageStats
}

export default function DataExport({ usageStats }: DataExportProps) {
  const [exporting, setExporting] = useState(false)

  const exportToJSON = () => {
    const dataStr = JSON.stringify(usageStats, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `usage-data-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const exportToCSV = () => {
    // Convert recent activity to CSV
    const headers = ['Tool', 'Endpoint', 'Method', 'Status', 'Response Time (ms)', 'Cost (USD)', 'Date']
    const rows = usageStats.recent_activity.map(log => [
      log.tool_name || 'N/A',
      log.endpoint,
      log.method,
      log.status_code.toString(),
      log.response_time_ms.toFixed(0),
      parseFloat(log.cost_usd).toFixed(4),
      new Date(log.timestamp).toLocaleString(),
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n')

    const dataBlob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `usage-activity-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleExport = async (format: 'json' | 'csv') => {
    setExporting(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500)) // Simulate delay
      if (format === 'json') {
        exportToJSON()
      } else {
        exportToCSV()
      }
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Export Data</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Download your usage data for backup or analysis
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={() => handleExport('json')}
          disabled={exporting}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300 rounded-lg font-medium hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
          </svg>
          {exporting ? 'Exporting...' : 'Export JSON'}
        </button>

        <button
          onClick={() => handleExport('csv')}
          disabled={exporting}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 rounded-lg font-medium hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {exporting ? 'Exporting...' : 'Export CSV'}
        </button>
      </div>

      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-xs text-blue-800 dark:text-blue-300">
          💡 <strong>Tip:</strong> JSON format includes all data, while CSV exports recent activity for spreadsheet analysis.
        </p>
      </div>
    </div>
  )
}

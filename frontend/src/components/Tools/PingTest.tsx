import React, { useState } from 'react'
import { backendApi } from '@/services/backendApi'

interface PingResult {
  sequence: number
  success: boolean
  time?: number
  status_code?: number
  error?: string
}

interface PingStatistics {
  packets_sent: number
  packets_received: number
  packet_loss: number
  avg_response_time: number | null
  min_response_time: number | null
  max_response_time: number | null
}

interface PingResponse {
  url: string
  host: string
  ip_address: string | null
  results: PingResult[]
  statistics: PingStatistics
}

export default function PingTest() {
  const [url, setUrl] = useState('')
  const [result, setResult] = useState<PingResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await backendApi.get('/api/tools/network/ping-test', {
        params: { url },
      })
      setResult(response)
    } catch (err: any) {
      setError(err.message || 'Failed to perform ping test')
    } finally {
      setLoading(false)
    }
  }

  const getPacketLossColor = (loss: number) => {
    if (loss === 0) return 'text-green-400'
    if (loss < 25) return 'text-yellow-400'
    if (loss < 50) return 'text-orange-400'
    return 'text-red-400'
  }

  const getResponseTimeColor = (time: number) => {
    if (time < 100) return 'text-green-400'
    if (time < 300) return 'text-yellow-400'
    if (time < 1000) return 'text-orange-400'
    return 'text-red-400'
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Website URL or Domain</label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="example.com or https://example.com"
            required
            className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            This will send 4 HTTP requests to check availability and response time
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          {loading ? 'Testing...' : 'Start Ping Test'}
        </button>
      </form>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/50 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          {/* Host Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-blue-600 dark:text-blue-400">Target Information</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">URL:</span>
                <span className="text-gray-900 dark:text-white font-mono text-sm">{result.url}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Host:</span>
                <span className="text-gray-900 dark:text-white font-mono">{result.host}</span>
              </div>
              {result.ip_address && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">IP Address:</span>
                  <span className="text-gray-900 dark:text-white font-mono">{result.ip_address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-green-600 dark:text-green-400">Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Packets Sent</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {result.statistics.packets_sent}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Packets Received</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {result.statistics.packets_received}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Packet Loss</div>
                <div
                  className={`text-2xl font-bold ${getPacketLossColor(
                    result.statistics.packet_loss
                  )}`}
                >
                  {result.statistics.packet_loss}%
                </div>
              </div>
              {result.statistics.avg_response_time !== null && (
                <>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg Time</div>
                    <div
                      className={`text-2xl font-bold ${getResponseTimeColor(
                        result.statistics.avg_response_time
                      )}`}
                    >
                      {result.statistics.avg_response_time} ms
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Min Time</div>
                    <div className="text-2xl font-bold text-green-400">
                      {result.statistics.min_response_time} ms
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Max Time</div>
                    <div className="text-2xl font-bold text-red-400">
                      {result.statistics.max_response_time} ms
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Individual Results */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-purple-600 dark:text-purple-400">Ping Results</h3>
            <div className="space-y-3">
              {result.results.map((ping) => (
                <div
                  key={ping.sequence}
                  className={`p-4 rounded-lg border ${
                    ping.success
                      ? 'bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700'
                      : 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-gray-600 dark:text-gray-400">#{ping.sequence}</span>
                      {ping.success ? (
                        <>
                          <span className="text-green-600 dark:text-green-400">Success</span>
                          {ping.status_code && (
                            <span className="text-blue-600 dark:text-blue-400 text-sm">
                              HTTP {ping.status_code}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-red-600 dark:text-red-400">Failed</span>
                      )}
                    </div>
                    <div>
                      {ping.success && ping.time !== undefined ? (
                        <span
                          className={`text-lg font-bold ${getResponseTimeColor(ping.time)}`}
                        >
                          {ping.time} ms
                        </span>
                      ) : (
                        <span className="text-red-600 dark:text-red-400 text-sm">{ping.error}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Visual Timeline */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-yellow-600 dark:text-yellow-400">Response Timeline</h3>
            <div className="space-y-2">
              {result.results
                .filter((r) => r.success && r.time)
                .map((ping) => {
                  const maxTime = result.statistics.max_response_time || 1
                  const width = ((ping.time || 0) / maxTime) * 100
                  return (
                    <div key={ping.sequence} className="flex items-center space-x-4">
                      <span className="text-gray-600 dark:text-gray-400 text-sm w-8">#{ping.sequence}</span>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-800 rounded-full h-6 overflow-hidden">
                        <div
                          className={`h-full ${
                            (ping.time || 0) < 100
                              ? 'bg-green-500'
                              : (ping.time || 0) < 300
                              ? 'bg-yellow-500'
                              : (ping.time || 0) < 1000
                              ? 'bg-orange-500'
                              : 'bg-red-500'
                          } transition-all duration-500`}
                          style={{ width: `${width}%` }}
                        />
                      </div>
                      <span className="text-gray-900 dark:text-white text-sm w-16 text-right">
                        {ping.time} ms
                      </span>
                    </div>
                  )
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

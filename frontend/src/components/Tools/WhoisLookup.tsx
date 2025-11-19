import React, { useState } from 'react'
import { backendApi } from '@/services/backendApi'

interface Registrant {
  name: string | null
  organization: string | null
  email: string | null
  country: string | null
}

interface WhoisResult {
  domain: string
  registrar: string | null
  whois_server: string | null
  creation_date: string | null
  expiration_date: string | null
  updated_date: string | null
  status: string[] | null
  name_servers: string[] | null
  registrant: Registrant
  raw_text: string | null
}

export default function WhoisLookup() {
  const [domain, setDomain] = useState('')
  const [result, setResult] = useState<WhoisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showRaw, setShowRaw] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)
    setShowRaw(false)

    try {
      const response = await backendApi.get('/api/tools/network/whois-lookup', {
        params: { domain },
      })
      setResult(response)
    } catch (err: any) {
      setError(err.message || 'Failed to perform WHOIS lookup')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch {
      return dateString
    }
  }

  const getDaysUntilExpiry = (expiryDate: string | null) => {
    if (!expiryDate) return null
    try {
      const expiry = new Date(expiryDate)
      const now = new Date()
      const diffTime = expiry.getTime() - now.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays
    } catch {
      return null
    }
  }

  const getExpiryColor = (days: number | null) => {
    if (days === null) return 'text-gray-400'
    if (days < 0) return 'text-red-400'
    if (days < 30) return 'text-red-400'
    if (days < 90) return 'text-yellow-400'
    return 'text-green-400'
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Domain Name</label>
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="example.com"
            required
            className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Enter a domain name to view registration and ownership information
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          {loading ? 'Looking up...' : 'Lookup WHOIS'}
        </button>
      </form>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/50 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          {/* Domain Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-blue-600 dark:text-blue-400">Domain Information</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Domain:</span>
                <span className="text-gray-900 dark:text-white font-mono">{result.domain}</span>
              </div>
              {result.registrar && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Registrar:</span>
                  <span className="text-gray-900 dark:text-white">{result.registrar}</span>
                </div>
              )}
              {result.whois_server && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">WHOIS Server:</span>
                  <span className="text-gray-900 dark:text-white font-mono">{result.whois_server}</span>
                </div>
              )}
            </div>
          </div>

          {/* Important Dates */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-green-600 dark:text-green-400">Important Dates</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Creation Date:</span>
                <span className="text-gray-900 dark:text-white">{formatDate(result.creation_date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Updated Date:</span>
                <span className="text-gray-900 dark:text-white">{formatDate(result.updated_date)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Expiration Date:</span>
                <div className="text-right">
                  <div className="text-gray-900 dark:text-white">{formatDate(result.expiration_date)}</div>
                  {(() => {
                    const days = getDaysUntilExpiry(result.expiration_date)
                    if (days !== null) {
                      return (
                        <div className={`text-sm ${getExpiryColor(days)}`}>
                          {days < 0
                            ? `Expired ${Math.abs(days)} days ago`
                            : `${days} days remaining`}
                        </div>
                      )
                    }
                    return null
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* Registrant Info */}
          {(result.registrant.name ||
            result.registrant.organization ||
            result.registrant.email ||
            result.registrant.country) && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4 text-purple-600 dark:text-purple-400">
                Registrant Information
              </h3>
              <div className="space-y-2">
                {result.registrant.name && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Name:</span>
                    <span className="text-gray-900 dark:text-white">{result.registrant.name}</span>
                  </div>
                )}
                {result.registrant.organization && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Organization:</span>
                    <span className="text-gray-900 dark:text-white">{result.registrant.organization}</span>
                  </div>
                )}
                {result.registrant.email && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Email:</span>
                    <span className="text-gray-900 dark:text-white font-mono">{result.registrant.email}</span>
                  </div>
                )}
                {result.registrant.country && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Country:</span>
                    <span className="text-gray-900 dark:text-white">{result.registrant.country}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Name Servers */}
          {result.name_servers && result.name_servers.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4 text-yellow-600 dark:text-yellow-400">Name Servers</h3>
              <div className="space-y-2">
                {result.name_servers.map((ns, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                    <span className="text-gray-900 dark:text-white font-mono">{ns}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Domain Status */}
          {result.status && result.status.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4 text-orange-600 dark:text-orange-400">Domain Status</h3>
              <div className="space-y-2">
                {result.status.map((statusItem, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                    <span className="text-gray-900 dark:text-white text-sm">{statusItem}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Raw WHOIS Data */}
          {result.raw_text && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowRaw(!showRaw)}
                className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-750 transition-colors"
              >
                <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400">Raw WHOIS Data</h3>
                <span className="text-gray-600 dark:text-gray-400">{showRaw ? '▼' : '▶'}</span>
              </button>
              {showRaw && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-auto max-h-96 text-xs">
                    <code className="text-gray-900 dark:text-gray-300">{result.raw_text}</code>
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

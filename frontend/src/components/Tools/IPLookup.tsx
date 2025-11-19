import React, { useState, useEffect } from 'react'
import { backendApi } from '@/services/backendApi'

interface LocationInfo {
  country: string
  countryCode: string
  region: string
  regionCode: string
  city: string
  zip: string
  latitude: number
  longitude: number
  timezone: string
}

interface NetworkInfo {
  isp: string
  organization: string
  asn: string
}

interface SecurityInfo {
  is_proxy: boolean
  is_hosting: boolean
}

interface IPLookupResult {
  ip: string
  hostname: string | null
  location: LocationInfo
  network: NetworkInfo
  security: SecurityInfo
}

export default function IPLookup() {
  const [ipInput, setIpInput] = useState('')
  const [result, setResult] = useState<IPLookupResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [autoLookup, setAutoLookup] = useState(true)

  useEffect(() => {
    if (autoLookup) {
      lookupIP()
    }
  }, [])

  const lookupIP = async () => {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const params = ipInput ? { ip: ipInput } : {}
      const response = await backendApi.get('/api/tools/network/ip-lookup', { params })
      setResult(response)
      setAutoLookup(false)
    } catch (err: any) {
      setError(err.message || 'Failed to lookup IP address')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    lookupIP()
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            IP Address (leave empty to check your IP)
          </label>
          <input
            type="text"
            value={ipInput}
            onChange={(e) => setIpInput(e.target.value)}
            placeholder="e.g., 8.8.8.8 or leave empty"
            className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          {loading ? 'Looking up...' : 'Lookup IP'}
        </button>
      </form>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/50 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          {/* Basic Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-blue-600 dark:text-blue-400">IP Information</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">IP Address:</span>
                <span className="font-mono text-gray-900 dark:text-white">{result.ip}</span>
              </div>
              {result.hostname && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Hostname:</span>
                  <span className="font-mono text-gray-900 dark:text-white">{result.hostname}</span>
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-green-600 dark:text-green-400">Location</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Country:</span>
                <span className="text-gray-900 dark:text-white">
                  {result.location.country} ({result.location.countryCode})
                </span>
              </div>
              {result.location.region && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Region:</span>
                  <span className="text-gray-900 dark:text-white">{result.location.region}</span>
                </div>
              )}
              {result.location.city && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">City:</span>
                  <span className="text-gray-900 dark:text-white">{result.location.city}</span>
                </div>
              )}
              {result.location.zip && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">ZIP Code:</span>
                  <span className="text-gray-900 dark:text-white">{result.location.zip}</span>
                </div>
              )}
              {result.location.timezone && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Timezone:</span>
                  <span className="text-gray-900 dark:text-white">{result.location.timezone}</span>
                </div>
              )}
              {result.location.latitude && result.location.longitude && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Coordinates:</span>
                  <span className="text-gray-900 dark:text-white">
                    {result.location.latitude.toFixed(4)}, {result.location.longitude.toFixed(4)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Network */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-purple-600 dark:text-purple-400">Network</h3>
            <div className="space-y-2">
              {result.network.isp && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">ISP:</span>
                  <span className="text-gray-900 dark:text-white">{result.network.isp}</span>
                </div>
              )}
              {result.network.organization && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Organization:</span>
                  <span className="text-gray-900 dark:text-white">{result.network.organization}</span>
                </div>
              )}
              {result.network.asn && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">ASN:</span>
                  <span className="font-mono text-gray-900 dark:text-white">{result.network.asn}</span>
                </div>
              )}
            </div>
          </div>

          {/* Security */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-yellow-600 dark:text-yellow-400">Security</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Proxy Detected:</span>
                <span className={result.security.is_proxy ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>
                  {result.security.is_proxy ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Hosting/Data Center:</span>
                <span className={result.security.is_hosting ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}>
                  {result.security.is_hosting ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>

          {/* Map Preview */}
          {result.location.latitude && result.location.longitude && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4 text-blue-600 dark:text-blue-400">Map Location</h3>
              <a
                href={`https://www.google.com/maps?q=${result.location.latitude},${result.location.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                View on Google Maps
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

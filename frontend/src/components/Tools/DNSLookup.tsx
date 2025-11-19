import React, { useState } from 'react'
import { backendApi } from '@/services/backendApi'

interface DNSRecord {
  value?: string
  priority?: number
  mname?: string
  rname?: string
  serial?: number
  refresh?: number
  retry?: number
  expire?: number
  minimum?: number
}

interface DNSResult {
  success: boolean
  records?: DNSRecord[]
  ttl?: number
  error?: string
}

interface DNSLookupResponse {
  domain: string
  results: Record<string, DNSResult>
}

const RECORD_TYPES = [
  { value: 'A', label: 'A (IPv4 Address)', description: 'IPv4 address records' },
  { value: 'AAAA', label: 'AAAA (IPv6 Address)', description: 'IPv6 address records' },
  { value: 'MX', label: 'MX (Mail Exchange)', description: 'Mail server records' },
  { value: 'TXT', label: 'TXT (Text)', description: 'Text records (SPF, DKIM, etc.)' },
  { value: 'CNAME', label: 'CNAME (Canonical Name)', description: 'Alias records' },
  { value: 'NS', label: 'NS (Name Server)', description: 'Name server records' },
  { value: 'SOA', label: 'SOA (Start of Authority)', description: 'Domain authority info' },
]

export default function DNSLookup() {
  const [domain, setDomain] = useState('')
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['A', 'AAAA', 'MX', 'TXT', 'CNAME', 'NS'])
  const [results, setResults] = useState<DNSLookupResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleTypeToggle = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedTypes.length === 0) {
      setError('Please select at least one record type')
      return
    }

    setLoading(true)
    setError('')
    setResults(null)

    try {
      const response = await backendApi.get('/api/tools/network/dns-lookup', {
        params: {
          domain,
          types: selectedTypes.join(','),
        },
      })
      setResults(response)
    } catch (err: any) {
      setError(err.message || 'Failed to perform DNS lookup')
    } finally {
      setLoading(false)
    }
  }

  const renderRecordValue = (type: string, record: DNSRecord) => {
    if (type === 'MX') {
      return (
        <div className="flex items-center space-x-2">
          <span className="text-purple-600 dark:text-purple-400 font-semibold">{record.priority}</span>
          <span className="text-gray-900 dark:text-white font-mono">{record.value}</span>
        </div>
      )
    }

    if (type === 'SOA') {
      return (
        <div className="space-y-1 text-sm">
          <div><span className="text-gray-600 dark:text-gray-400">Primary NS:</span> <span className="text-gray-900 dark:text-white font-mono">{record.mname}</span></div>
          <div><span className="text-gray-600 dark:text-gray-400">Admin Email:</span> <span className="text-gray-900 dark:text-white font-mono">{record.rname}</span></div>
          <div><span className="text-gray-600 dark:text-gray-400">Serial:</span> <span className="text-gray-900 dark:text-white">{record.serial}</span></div>
          <div><span className="text-gray-600 dark:text-gray-400">Refresh:</span> <span className="text-gray-900 dark:text-white">{record.refresh}s</span></div>
          <div><span className="text-gray-600 dark:text-gray-400">Retry:</span> <span className="text-gray-900 dark:text-white">{record.retry}s</span></div>
          <div><span className="text-gray-600 dark:text-gray-400">Expire:</span> <span className="text-gray-900 dark:text-white">{record.expire}s</span></div>
          <div><span className="text-gray-600 dark:text-gray-400">Minimum TTL:</span> <span className="text-gray-900 dark:text-white">{record.minimum}s</span></div>
        </div>
      )
    }

    return <span className="text-gray-900 dark:text-white font-mono">{record.value}</span>
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
        </div>

        <div>
          <label className="block text-sm font-medium mb-3">Record Types</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {RECORD_TYPES.map((type) => (
              <label
                key={type.value}
                className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedTypes.includes(type.value)
                    ? 'bg-blue-100 dark:bg-blue-600/20 border-blue-500 dark:border-blue-500'
                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedTypes.includes(type.value)}
                  onChange={() => handleTypeToggle(type.value)}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{type.label}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">{type.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          {loading ? 'Looking up...' : 'Lookup DNS Records'}
        </button>
      </form>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/50 border border-red-300 dark:border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {results && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400">
              DNS Records for: <span className="text-gray-900 dark:text-white">{results.domain}</span>
            </h3>
          </div>

          {Object.entries(results.results).map(([recordType, result]) => (
            <div
              key={recordType}
              className={`bg-white dark:bg-gray-800 rounded-lg p-6 border ${
                result.success ? 'border-green-300 dark:border-green-700' : 'border-red-300 dark:border-red-700'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{recordType} Records</h3>
                {result.success && result.ttl && (
                  <span className="text-sm text-gray-600 dark:text-gray-400">TTL: {result.ttl}s</span>
                )}
              </div>

              {result.success ? (
                result.records && result.records.length > 0 ? (
                  <div className="space-y-3">
                    {result.records.map((record, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-300 dark:border-gray-700"
                      >
                        {renderRecordValue(recordType, record)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-600 dark:text-gray-400 italic">No records found</div>
                )
              ) : (
                <div className="text-red-600 dark:text-red-400">{result.error}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

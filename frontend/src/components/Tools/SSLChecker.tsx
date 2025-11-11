import { useState } from 'react'
import { checkSSL } from '@/services/api'
import { useNotification } from '@/contexts/NotificationContext'

export default function SSLChecker() {
  const { showSuccess } = useNotification()
  const [domain, setDomain] = useState('')
  const [port, setPort] = useState(443)
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCheck = async () => {
    if (!domain.trim()) {
      setError('Please enter a domain')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await checkSSL(domain, port)

      if (response.success) {
        setResult(response.result)
        showSuccess('SSL certificate checked successfully!')
      } else {
        setError(response.error || 'Failed to check SSL certificate')
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to check SSL certificate')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleCheck()
    }
  }

  const getStatusBadge = (status: string, statusColor: string) => {
    const colorClasses = {
      success: 'bg-success-50 dark:bg-success-900/20 border-success-300 dark:border-success-700 text-success-700 dark:text-success-300',
      warning: 'bg-warning-50 dark:bg-warning-900/20 border-warning-300 dark:border-warning-700 text-warning-700 dark:text-warning-300',
      danger: 'bg-danger-50 dark:bg-danger-900/20 border-danger-300 dark:border-danger-700 text-danger-700 dark:text-danger-300',
    }

    const statusText = {
      valid: 'Valid',
      expiring_soon: 'Expiring Soon',
      expired: 'Expired',
    }

    return (
      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border-2 ${colorClasses[statusColor as keyof typeof colorClasses] || colorClasses.success}`}>
        {statusColor === 'success' && (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )}
        {statusColor === 'warning' && (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )}
        {statusColor === 'danger' && (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        )}
        {statusText[status as keyof typeof statusText] || status}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Domain or URL
          </label>
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="example.com or https://example.com"
            className="input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Port
          </label>
          <input
            type="number"
            value={port}
            onChange={(e) => setPort(parseInt(e.target.value) || 443)}
            min="1"
            max="65535"
            className="input"
          />
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleCheck}
          disabled={loading || !domain.trim()}
          className="btn btn-primary px-8"
        >
          {loading ? 'Checking...' : 'Check SSL Certificate'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      {result && (
        <div className="space-y-6 animate-fade-in-up">
          {/* Status Overview */}
          <div className="bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-2xl p-6 border-2 border-primary-200 dark:border-primary-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                  {result.domain}:{result.port}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  SSL/TLS Certificate Status
                </p>
              </div>
              {getStatusBadge(result.status, result.status_color)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Days Remaining</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {result.days_remaining}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Protocol</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {result.cipher_suite.protocol}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Key Size</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {result.cipher_suite.bits} bits
                </p>
              </div>
            </div>
          </div>

          {/* Certificate Details */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Certificate Details
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Subject */}
              <div>
                <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">
                  Subject
                </h5>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Common Name (CN)</p>
                    <p className="text-sm text-gray-900 dark:text-gray-100 font-mono">
                      {result.subject.common_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Organization (O)</p>
                    <p className="text-sm text-gray-900 dark:text-gray-100 font-mono">
                      {result.subject.organization}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Country (C)</p>
                    <p className="text-sm text-gray-900 dark:text-gray-100 font-mono">
                      {result.subject.country}
                    </p>
                  </div>
                </div>
              </div>

              {/* Issuer */}
              <div>
                <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">
                  Issuer
                </h5>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Common Name (CN)</p>
                    <p className="text-sm text-gray-900 dark:text-gray-100 font-mono">
                      {result.issuer.common_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Organization (O)</p>
                    <p className="text-sm text-gray-900 dark:text-gray-100 font-mono">
                      {result.issuer.organization}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Country (C)</p>
                    <p className="text-sm text-gray-900 dark:text-gray-100 font-mono">
                      {result.issuer.country}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Validity Period */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Validity Period
            </h4>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Valid From</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 font-mono">
                  {result.validity.not_before}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Valid Until</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 font-mono">
                  {result.validity.not_after}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Days Until Expiration</span>
                <span className={`text-xl font-bold ${
                  result.days_remaining < 0 ? 'text-danger-600 dark:text-danger-400' :
                  result.days_remaining < 30 ? 'text-warning-600 dark:text-warning-400' :
                  'text-success-600 dark:text-success-400'
                }`}>
                  {result.days_remaining} days
                </span>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cipher Suite */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Cipher Suite
              </h4>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Cipher Name</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 font-mono break-all">
                    {result.cipher_suite.name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Protocol Version</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 font-mono">
                    {result.cipher_suite.protocol}
                  </p>
                </div>
              </div>
            </div>

            {/* Certificate Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Certificate Info
              </h4>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Serial Number</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 font-mono break-all">
                    {result.serial_number}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Version</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 font-mono">
                    {result.version}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Subject Alternative Names */}
          {result.subject_alternative_names && result.subject_alternative_names.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Subject Alternative Names (SANs)
              </h4>
              <div className="flex flex-wrap gap-2">
                {result.subject_alternative_names.map((san: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-sm font-mono rounded-full border border-primary-200 dark:border-primary-800"
                  >
                    {san}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

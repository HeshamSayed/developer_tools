import { useState } from 'react'
import { decodeJWT } from '@/services/api'
import CopyButton from '@/components/Common/CopyButton'

export default function JWTDecoder() {
  const [token, setToken] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleDecode = async () => {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await decodeJWT(token)
      if (response.success) {
        setResult(response)
      } else {
        setError(response.error || 'An error occurred')
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to decode JWT')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          JWT Token
        </label>
        <textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="textarea"
          rows={6}
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        />
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleDecode}
          disabled={loading || !token}
          className="btn btn-primary px-8"
        >
          {loading ? 'Decoding...' : 'Decode JWT'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="text-sm space-y-1">
              <p><span className="font-medium">Algorithm:</span> {result.metadata?.algorithm}</p>
              <p><span className="font-medium">Type:</span> {result.metadata?.type}</p>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Header</span>
              <CopyButton text={JSON.stringify(result.header, null, 2)} />
            </div>
            <pre className="text-xs text-gray-800 dark:text-gray-200 overflow-x-auto">
              {JSON.stringify(result.header, null, 2)}
            </pre>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Payload</span>
              <CopyButton text={JSON.stringify(result.payload, null, 2)} />
            </div>
            <pre className="text-xs text-gray-800 dark:text-gray-200 overflow-x-auto">
              {JSON.stringify(result.payload, null, 2)}
            </pre>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Signature</span>
              <CopyButton text={result.signature} />
            </div>
            <code className="text-xs text-gray-800 dark:text-gray-200 break-all">
              {result.signature}
            </code>
          </div>
        </div>
      )}
    </div>
  )
}

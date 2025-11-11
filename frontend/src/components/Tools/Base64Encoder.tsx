import { useState } from 'react'
import { base64Encode } from '@/services/api'
import CopyButton from '@/components/Common/CopyButton'

export default function Base64Encoder() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleEncode = async () => {
    setLoading(true)
    setError('')
    setOutput('')

    try {
      const result = await base64Encode(input)
      if (result.success) {
        setOutput(result.result)
      } else {
        setError(result.error || 'An error occurred')
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to encode')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Text to Encode
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="textarea"
          rows={8}
          placeholder="Enter text to encode to Base64..."
        />
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleEncode}
          disabled={loading || !input}
          className="btn btn-primary px-8"
        >
          {loading ? 'Encoding...' : 'Encode to Base64'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      {output && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Base64 Output
            </label>
            <CopyButton text={output} />
          </div>
          <textarea
            value={output}
            readOnly
            className="textarea bg-gray-50 dark:bg-gray-900"
            rows={8}
          />
        </div>
      )}
    </div>
  )
}

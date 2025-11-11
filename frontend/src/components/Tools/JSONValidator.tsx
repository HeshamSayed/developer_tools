import { useState } from 'react'
import { validateJSON } from '@/services/api'

export default function JSONValidator() {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleValidate = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await validateJSON(input)
      setResult(response)
    } catch (err: any) {
      setResult({ success: false, error: 'Failed to validate JSON' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Input JSON
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="textarea"
          rows={12}
          placeholder='{"name":"John","age":30}'
        />
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleValidate}
          disabled={loading || !input}
          className="btn btn-primary px-8"
        >
          {loading ? 'Validating...' : 'Validate JSON'}
        </button>
      </div>

      {result && (
        <div className={`rounded-lg p-6 ${result.valid ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
          <div className="flex items-start gap-3">
            {result.valid ? (
              <svg className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <div className="flex-1">
              <h3 className={`font-semibold mb-2 ${result.valid ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'}`}>
                {result.valid ? 'Valid JSON' : 'Invalid JSON'}
              </h3>
              {result.error && (
                <div className="space-y-2">
                  <p className="text-red-800 dark:text-red-200 text-sm">{result.error}</p>
                  {result.error_details && (
                    <div className="text-sm text-red-700 dark:text-red-300">
                      <p>Line: {result.error_details.line}, Column: {result.error_details.column}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

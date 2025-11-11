import { useState } from 'react'
import { csvToJSON } from '@/services/api'
import CopyButton from '@/components/Common/CopyButton'

export default function CSVToJSON() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [delimiter, setDelimiter] = useState(',')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [metadata, setMetadata] = useState<any>(null)

  const handleConvert = async () => {
    setLoading(true)
    setError('')
    setOutput('')
    setMetadata(null)

    try {
      const response = await csvToJSON(input, delimiter)
      if (response.success) {
        setOutput(response.result)
        setMetadata(response.metadata)
      } else {
        setError(response.error || 'An error occurred')
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to convert')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            CSV Input
          </label>
          <select
            value={delimiter}
            onChange={(e) => setDelimiter(e.target.value)}
            className="px-2 py-1 text-sm border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
          >
            <option value=",">Comma (,)</option>
            <option value=";">Semicolon (;)</option>
            <option value="\t">Tab</option>
            <option value="|">Pipe (|)</option>
          </select>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="textarea"
          rows={10}
          placeholder="name,age,city&#10;John,30,New York&#10;Jane,25,Boston"
        />
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleConvert}
          disabled={loading || !input}
          className="btn btn-primary px-8"
        >
          {loading ? 'Converting...' : 'Convert to JSON'}
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
              JSON Output
            </label>
            <div className="flex items-center gap-2">
              {metadata && (
                <span className="text-xs text-gray-500">
                  {metadata.row_count} rows, {metadata.column_count} columns
                </span>
              )}
              <CopyButton text={output} />
            </div>
          </div>
          <textarea
            value={output}
            readOnly
            className="textarea bg-gray-50 dark:bg-gray-900"
            rows={10}
          />
        </div>
      )}
    </div>
  )
}

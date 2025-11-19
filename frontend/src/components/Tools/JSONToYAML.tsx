import { useState } from 'react'
import CopyButton from '@/components/Common/CopyButton'
import { converterTools } from '@/services/backendApi'

export default function JSONToYAML() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleConvert = async () => {
    setError('')
    setOutput('')

    if (!input.trim()) {
      setError('Please enter JSON to convert')
      return
    }

    try {
      setLoading(true)
      const response = await converterTools.jsonToYaml({ input })
      if (response.success) {
        setOutput(response.result)
      } else {
        setError('Conversion failed')
      }
    } catch (err: any) {
      setError(err.message || 'Invalid JSON format')
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setInput('')
    setOutput('')
    setError('')
  }

  const loadSample = () => {
    setInput(`{
  "name": "John Doe",
  "age": 30,
  "email": "john@example.com",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "country": "USA"
  },
  "hobbies": ["reading", "coding", "travel"]
}`)
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <button onClick={loadSample} className="btn btn-secondary text-sm">
          Sample
        </button>
        <button onClick={handleClear} className="btn btn-secondary text-sm">
          Clear
        </button>
      </div>

      {/* Input */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            JSON Input
          </label>
          <span className="text-xs text-gray-500">{input.length} characters</span>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="textarea font-mono"
          rows={12}
          placeholder="Enter JSON to convert to YAML..."
        />
      </div>

      {/* Convert Button */}
      <div className="flex justify-center">
        <button
          onClick={handleConvert}
          disabled={!input.trim() || loading}
          className="btn btn-primary px-8"
        >
          {loading ? 'Converting...' : 'Convert to YAML'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      {/* Output */}
      {output && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              YAML Output
            </label>
            <CopyButton text={output} />
          </div>
          <textarea
            value={output}
            readOnly
            className="textarea bg-gray-50 dark:bg-gray-900 font-mono"
            rows={12}
          />
        </div>
      )}
    </div>
  )
}

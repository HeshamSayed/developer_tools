import { useState } from 'react'
import CopyButton from '@/components/Common/CopyButton'
import { converterTools } from '@/services/backendApi'

export default function JSONToJSONSchema() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [title, setTitle] = useState('Generated Schema')
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    setError('')
    setOutput('')

    if (!input.trim()) {
      setError('Please enter JSON to generate schema')
      return
    }

    try {
      setLoading(true)
      const response = await converterTools.jsonToJsonSchema({ input, title })
      if (response.success) {
        setOutput(response.result)
      } else {
        setError('Schema generation failed')
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
    setTitle('Generated Schema')
  }

  const loadSample = () => {
    setInput(`{
  "name": "John Doe",
  "age": 30,
  "email": "john@example.com",
  "address": {
    "street": "123 Main St",
    "city": "New York"
  },
  "tags": ["developer", "designer"]
}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <button onClick={loadSample} className="btn btn-secondary text-sm">Sample</button>
        <button onClick={handleClear} className="btn btn-secondary text-sm">Clear</button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Schema Title</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="input" placeholder="Generated Schema" />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">JSON Input</label>
          <span className="text-xs text-gray-500">{input.length} characters</span>
        </div>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} className="textarea font-mono" rows={10} placeholder="Enter JSON to generate schema from..." />
      </div>

      <div className="flex justify-center">
        <button onClick={handleGenerate} disabled={!input.trim() || loading} className="btn btn-primary px-8">
          {loading ? 'Generating...' : 'Generate JSON Schema'}
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">JSON Schema Output</label>
            <CopyButton text={output} />
          </div>
          <textarea value={output} readOnly className="textarea bg-gray-50 dark:bg-gray-900 font-mono" rows={14} />
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import CopyButton from '@/components/Common/CopyButton'
import { converterTools } from '@/services/backendApi'

export default function JSONToSQL() {
  const [input, setInput] = useState('')
  const [tableName, setTableName] = useState('my_table')
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

    if (!tableName.trim()) {
      setError('Please enter a table name')
      return
    }

    try {
      setLoading(true)
      const response = await converterTools.jsonToSql({ input, table_name: tableName })
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
    setTableName('my_table')
  }

  const loadSample = () => {
    setInput(`[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "age": 30
  },
  {
    "id": 2,
    "name": "Jane Smith",
    "email": "jane@example.com",
    "age": 25
  }
]`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <button onClick={loadSample} className="btn btn-secondary text-sm">Sample</button>
        <button onClick={handleClear} className="btn btn-secondary text-sm">Clear</button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Table Name</label>
        <input type="text" value={tableName} onChange={(e) => setTableName(e.target.value)} className="input" placeholder="my_table" />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">JSON Input</label>
          <span className="text-xs text-gray-500">{input.length} characters</span>
        </div>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} className="textarea font-mono" rows={10} placeholder="Enter JSON array or object..." />
      </div>

      <div className="flex justify-center">
        <button onClick={handleConvert} disabled={!input.trim() || !tableName.trim() || loading} className="btn btn-primary px-8">
          {loading ? 'Generating...' : 'Generate SQL'}
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">SQL Output</label>
            <CopyButton text={output} />
          </div>
          <textarea value={output} readOnly className="textarea bg-gray-50 dark:bg-gray-900 font-mono" rows={12} />
        </div>
      )}
    </div>
  )
}

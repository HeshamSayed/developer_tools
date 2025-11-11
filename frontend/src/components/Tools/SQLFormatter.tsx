import { useState, useRef } from 'react'
import { formatSQL } from '@/services/api'
import CodeBlock from '@/components/Common/CodeBlock'
import { saveAs } from 'file-saver'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

export default function SQLFormatter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [keywordCase, setKeywordCase] = useState('upper')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFormat = async () => {
    setLoading(true)
    setError('')
    setOutput('')

    try {
      const result = await formatSQL(input, keywordCase, true)
      if (result.success) {
        setOutput(result.result)
      } else {
        setError(result.error || 'An error occurred')
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to format SQL')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        setInput(text)
      }
      reader.readAsText(file)
    }
  }

  const handleDownload = () => {
    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' })
    saveAs(blob, 'formatted-sql.sql')
  }

  // Keyboard shortcuts: Ctrl+Enter to format
  useKeyboardShortcuts([
    {
      key: 'Enter',
      ctrlKey: true,
      callback: () => {
        if (input && !loading) {
          handleFormat()
        }
      }
    }
  ])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          SQL Input
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-secondary text-sm"
          >
            📁 Upload File
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".sql,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="textarea"
        rows={12}
        placeholder="SELECT * FROM users WHERE id = 1"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Keyword Case
        </label>
        <div className="flex gap-4">
          {['upper', 'lower', 'capitalize'].map((option) => (
            <label key={option} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value={option}
                checked={keywordCase === option}
                onChange={(e) => setKeywordCase(e.target.value)}
                className="w-4 h-4 text-primary-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                {option}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleFormat}
          disabled={loading || !input}
          className="btn btn-primary px-8"
        >
          {loading ? 'Formatting...' : 'Format SQL (Ctrl+Enter)'}
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
              Formatted SQL
            </label>
            <button
              onClick={handleDownload}
              className="btn btn-secondary text-sm"
            >
              ⬇️ Download
            </button>
          </div>
          <CodeBlock code={output} language="sql" title="Result" />
        </div>
      )}
    </div>
  )
}

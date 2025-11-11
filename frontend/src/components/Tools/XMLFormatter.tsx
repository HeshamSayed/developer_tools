import { useState, useRef } from 'react'
import { formatXML } from '@/services/api'
import CodeBlock from '@/components/Common/CodeBlock'
import { saveAs } from 'file-saver'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

export default function XMLFormatter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [indent, setIndent] = useState(2)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFormat = async () => {
    setLoading(true)
    setError('')
    setOutput('')

    try {
      const result = await formatXML(input, indent)
      if (result.success) {
        setOutput(result.result)
      } else {
        setError(result.error || 'An error occurred')
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to format XML')
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
    const blob = new Blob([output], { type: 'application/xml;charset=utf-8' })
    saveAs(blob, 'formatted.xml')
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
          XML Input
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
            accept=".xml,.txt"
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
        placeholder="<root><child>value</child></root>"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Indentation
        </label>
        <input
          type="number"
          min="0"
          max="8"
          value={indent}
          onChange={(e) => setIndent(parseInt(e.target.value) || 2)}
          className="input w-24"
        />
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleFormat}
          disabled={loading || !input}
          className="btn btn-primary px-8"
        >
          {loading ? 'Formatting...' : 'Format XML (Ctrl+Enter)'}
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
              Formatted XML
            </label>
            <button
              onClick={handleDownload}
              className="btn btn-secondary text-sm"
            >
              ⬇️ Download
            </button>
          </div>
          <CodeBlock code={output} language="xml" title="Result" />
        </div>
      )}
    </div>
  )
}

import { useState, useRef } from 'react'
import { validateXML } from '@/services/api'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'

export default function XMLValidator() {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ valid: boolean; message: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleValidate = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await validateXML(input)
      if (response.success) {
        setResult({
          valid: response.result.valid,
          message: response.result.message
        })
      } else {
        setResult({
          valid: false,
          message: response.error || 'Validation failed'
        })
      }
    } catch (err: any) {
      setResult({
        valid: false,
        message: err.response?.data?.error || 'Failed to validate XML'
      })
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

  // Keyboard shortcuts: Ctrl+Enter to validate
  useKeyboardShortcuts([
    {
      key: 'Enter',
      ctrlKey: true,
      callback: () => {
        if (input && !loading) {
          handleValidate()
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

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="textarea"
        rows={12}
        placeholder="<root><child>value</child></root>"
      />

      <div className="flex justify-center">
        <button
          onClick={handleValidate}
          disabled={loading || !input}
          className="btn btn-primary px-8"
        >
          {loading ? 'Validating...' : 'Validate XML (Ctrl+Enter)'}
        </button>
      </div>

      {result && (
        <div className={`border rounded-lg p-4 ${
          result.valid
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
        }`}>
          <div className="flex items-start gap-3">
            <span className="text-2xl">
              {result.valid ? '✅' : '❌'}
            </span>
            <div className="flex-1">
              <h4 className={`font-semibold mb-1 ${
                result.valid
                  ? 'text-green-800 dark:text-green-200'
                  : 'text-red-800 dark:text-red-200'
              }`}>
                {result.valid ? 'Valid XML' : 'Invalid XML'}
              </h4>
              <p className={`text-sm ${
                result.valid
                  ? 'text-green-700 dark:text-green-300'
                  : 'text-red-700 dark:text-red-300'
              }`}>
                {result.message}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

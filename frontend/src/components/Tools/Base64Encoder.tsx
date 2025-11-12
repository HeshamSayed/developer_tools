import { useState, useRef } from 'react'
import { base64Encode } from '@/services/api'
import CopyButton from '@/components/Common/CopyButton'

type InputMode = 'text' | 'file'
type OutputFormat = 'standard' | 'urlsafe' | 'datauri'

export default function Base64Encoder() {
  const [inputMode, setInputMode] = useState<InputMode>('text')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('standard')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    setError('')

    // Preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setFilePreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setFilePreview(null)
    }
  }

  const handleEncode = async () => {
    setLoading(true)
    setError('')
    setOutput('')

    try {
      let encoded = ''

      if (inputMode === 'file' && selectedFile) {
        // Encode file
        const reader = new FileReader()
        reader.onload = async (event) => {
          const content = event.target?.result as string
          const base64Content = content.split(',')[1] // Remove data URI prefix

          if (outputFormat === 'datauri') {
            encoded = content // Keep full data URI
          } else if (outputFormat === 'urlsafe') {
            encoded = base64Content.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
          } else {
            encoded = base64Content
          }

          setOutput(encoded)
          setLoading(false)
        }
        reader.onerror = () => {
          setError('Failed to read file')
          setLoading(false)
        }
        reader.readAsDataURL(selectedFile)
      } else {
        // Encode text
        const result = await base64Encode(input)
        if (result.success) {
          encoded = result.result

          if (outputFormat === 'urlsafe') {
            encoded = encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
          } else if (outputFormat === 'datauri') {
            encoded = `data:text/plain;base64,${encoded}`
          }

          setOutput(encoded)
        } else {
          setError(result.error || 'An error occurred')
        }
        setLoading(false)
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to encode')
      setLoading(false)
    }
  }

  const handleDownload = () => {
    const blob = new Blob([output], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'encoded.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleClear = () => {
    setInput('')
    setOutput('')
    setError('')
    setSelectedFile(null)
    setFilePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const loadSample = () => {
    setInputMode('text')
    setInput('Hello, World! This is a sample text for Base64 encoding.')
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 items-center justify-between bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={loadSample}
            className="btn btn-secondary text-sm"
            title="Load sample text"
          >
            📋 Sample
          </button>
          <button
            onClick={handleClear}
            className="btn btn-secondary text-sm"
            title="Clear all"
          >
            🗑️ Clear
          </button>
          {output && (
            <button
              onClick={handleDownload}
              className="btn btn-secondary text-sm"
              title="Download encoded output"
            >
              💾 Download
            </button>
          )}
        </div>
      </div>

      {/* Input Mode Selection */}
      <div className="flex gap-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            value="text"
            checked={inputMode === 'text'}
            onChange={(e) => setInputMode(e.target.value as InputMode)}
            className="w-4 h-4 text-primary-600"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            📝 Text Input
          </span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            value="file"
            checked={inputMode === 'file'}
            onChange={(e) => setInputMode(e.target.value as InputMode)}
            className="w-4 h-4 text-primary-600"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            📁 File Input
          </span>
        </label>
      </div>

      {/* Output Format Options */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Output Format:
        </label>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="standard"
              checked={outputFormat === 'standard'}
              onChange={(e) => setOutputFormat(e.target.value as OutputFormat)}
              className="w-4 h-4 text-primary-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Standard Base64
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="urlsafe"
              checked={outputFormat === 'urlsafe'}
              onChange={(e) => setOutputFormat(e.target.value as OutputFormat)}
              className="w-4 h-4 text-primary-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              URL-Safe (- _ no padding)
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="datauri"
              checked={outputFormat === 'datauri'}
              onChange={(e) => setOutputFormat(e.target.value as OutputFormat)}
              className="w-4 h-4 text-primary-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Data URI
            </span>
          </label>
        </div>
      </div>

      {/* Input Section */}
      {inputMode === 'text' ? (
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Text to Encode
            </label>
            <span className="text-xs text-gray-500">
              {input.length} characters
            </span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="textarea font-mono"
            rows={10}
            placeholder="Enter text to encode to Base64..."
          />
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            File to Encode
          </label>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="w-full"
            />
            {selectedFile && (
              <div className="mt-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Selected:</strong> {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  Size: {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
                <p className="text-xs text-gray-500">
                  Type: {selectedFile.type || 'Unknown'}
                </p>

                {filePreview && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Preview:
                    </p>
                    <img
                      src={filePreview}
                      alt="Preview"
                      className="max-w-full h-auto max-h-64 rounded border border-gray-300 dark:border-gray-600"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Process Button */}
      <div className="flex justify-center">
        <button
          onClick={handleEncode}
          disabled={loading || (inputMode === 'text' ? !input : !selectedFile)}
          className="btn btn-primary px-8"
        >
          {loading ? 'Encoding...' : '🔐 Encode to Base64'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-red-900 dark:text-red-100 mb-2">
            ❌ Error
          </h3>
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      {/* Output Section */}
      {output && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Base64 Output
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                {output.length} characters
              </span>
              <CopyButton text={output} />
            </div>
          </div>
          <textarea
            value={output}
            readOnly
            className="textarea bg-gray-50 dark:bg-gray-900 font-mono text-sm"
            rows={12}
          />

          {/* Info */}
          <div className="mt-2 flex gap-4 text-xs text-gray-500">
            <span>Size: {(output.length / 1024).toFixed(2)} KB</span>
            {outputFormat === 'urlsafe' && (
              <span className="text-green-600 dark:text-green-400">
                ✓ URL-Safe format
              </span>
            )}
            {outputFormat === 'datauri' && (
              <span className="text-blue-600 dark:text-blue-400">
                ✓ Data URI format
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

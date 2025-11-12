import { useState, useEffect } from 'react'
import { base64Decode } from '@/services/api'
import CopyButton from '@/components/Common/CopyButton'

type OutputType = 'text' | 'image' | 'unknown'

export default function Base64Decoder() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [outputType, setOutputType] = useState<OutputType>('text')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [autoDetect, setAutoDetect] = useState(true)
  const [inputFormat, setInputFormat] = useState<'standard' | 'urlsafe'>('standard')

  // Auto-detect if input is image data URI
  useEffect(() => {
    if (autoDetect && input.trim()) {
      if (input.startsWith('data:image')) {
        setOutputType('image')
        setImagePreview(input)
      } else if (/^[A-Za-z0-9+/]+=*$/.test(input.trim())) {
        // Try to detect if it's an image by checking first few bytes
        try {
          const decoded = atob(input.substring(0, 100))
          const bytes = new Uint8Array(decoded.length)
          for (let i = 0; i < decoded.length; i++) {
            bytes[i] = decoded.charCodeAt(i)
          }

          // Check for common image signatures
          const isPNG = bytes[0] === 0x89 && bytes[1] === 0x50
          const isJPEG = bytes[0] === 0xFF && bytes[1] === 0xD8
          const isGIF = bytes[0] === 0x47 && bytes[1] === 0x49

          if (isPNG || isJPEG || isGIF) {
            setOutputType('image')
          } else {
            setOutputType('text')
            setImagePreview(null)
          }
        } catch {
          setOutputType('text')
          setImagePreview(null)
        }
      }
    }
  }, [input, autoDetect])

  const handleDecode = async () => {
    setLoading(true)
    setError('')
    setOutput('')
    setImagePreview(null)

    try {
      let processedInput = input.trim()

      // Handle URL-safe Base64
      if (inputFormat === 'urlsafe') {
        processedInput = processedInput.replace(/-/g, '+').replace(/_/g, '/')
        // Add padding if needed
        while (processedInput.length % 4 !== 0) {
          processedInput += '='
        }
      }

      // Handle data URI
      if (processedInput.startsWith('data:')) {
        const matches = processedInput.match(/^data:([^;]+);base64,(.+)$/)
        if (matches) {
          const mimeType = matches[1]
          processedInput = matches[2]

          if (mimeType.startsWith('image/')) {
            setOutputType('image')
            setImagePreview(input)
            setOutput(`Image detected (${mimeType})`)
            setLoading(false)
            return
          }
        }
      }

      const result = await base64Decode(processedInput)
      if (result.success) {
        setOutput(result.result)
      } else {
        setError(result.error || 'An error occurred')
      }
    } catch (err: any) {
      if (err.name === 'InvalidCharacterError') {
        setError('Invalid Base64 string: contains invalid characters')
      } else {
        setError(err.response?.data?.error || 'Failed to decode')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (outputType === 'image' && imagePreview) {
      const a = document.createElement('a')
      a.href = imagePreview
      a.download = 'decoded-image.png'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } else {
      const blob = new Blob([output], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'decoded.txt'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const handleClear = () => {
    setInput('')
    setOutput('')
    setError('')
    setImagePreview(null)
    setOutputType('text')
  }

  const loadSample = () => {
    setInput('SGVsbG8sIFdvcmxkISBUaGlzIGlzIGEgc2FtcGxlIHRleHQgZm9yIEJhc2U2NCBkZWNvZGluZy4=')
  }

  const validateBase64 = () => {
    try {
      let testInput = input.trim()

      if (testInput.startsWith('data:')) {
        const matches = testInput.match(/^data:([^;]+);base64,(.+)$/)
        if (matches) {
          testInput = matches[2]
        }
      }

      if (inputFormat === 'urlsafe') {
        testInput = testInput.replace(/-/g, '+').replace(/_/g, '/')
      }

      atob(testInput)
      return true
    } catch {
      return false
    }
  }

  const isValid = validateBase64()

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 items-center justify-between bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={loadSample}
            className="btn btn-secondary text-sm"
            title="Load sample Base64"
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
          {(output || imagePreview) && (
            <button
              onClick={handleDownload}
              className="btn btn-secondary text-sm"
              title="Download decoded output"
            >
              💾 Download
            </button>
          )}
        </div>
      </div>

      {/* Input Format Options */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Input Format:
        </label>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="standard"
              checked={inputFormat === 'standard'}
              onChange={(e) => setInputFormat(e.target.value as 'standard' | 'urlsafe')}
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
              checked={inputFormat === 'urlsafe'}
              onChange={(e) => setInputFormat(e.target.value as 'standard' | 'urlsafe')}
              className="w-4 h-4 text-primary-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              URL-Safe (- _)
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoDetect}
              onChange={(e) => setAutoDetect(e.target.checked)}
              className="w-4 h-4 text-primary-600 rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Auto-detect images
            </span>
          </label>
        </div>
      </div>

      {/* Input Section */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Base64 String to Decode
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">
              {input.length} characters
            </span>
            {input && (
              <span className={`text-xs font-semibold ${isValid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {isValid ? '✓ Valid' : '✗ Invalid'}
              </span>
            )}
          </div>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="textarea font-mono"
          rows={10}
          placeholder="Enter Base64 string to decode... (supports standard, URL-safe, and data URIs)"
        />
      </div>

      {/* Process Button */}
      <div className="flex justify-center">
        <button
          onClick={handleDecode}
          disabled={loading || !input || !isValid}
          className="btn btn-primary px-8"
        >
          {loading ? 'Decoding...' : '🔓 Decode from Base64'}
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

      {/* Output Type Indicator */}
      {outputType !== 'text' && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>📷 Detected:</strong> Image data
          </p>
        </div>
      )}

      {/* Image Preview */}
      {imagePreview && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Image Preview
          </label>
          <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-900">
            <img
              src={imagePreview}
              alt="Decoded"
              className="max-w-full h-auto max-h-96 mx-auto rounded"
            />
          </div>
        </div>
      )}

      {/* Text Output Section */}
      {output && outputType === 'text' && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Decoded Text
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
            <span>Lines: {output.split('\n').length}</span>
          </div>
        </div>
      )}
    </div>
  )
}

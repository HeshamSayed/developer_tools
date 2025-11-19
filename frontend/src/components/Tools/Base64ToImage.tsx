import { useState } from 'react'
import { backendApi } from '@/services/backendApi'

interface Statistics {
  originalWidth: number
  originalHeight: number
  newWidth: number
  newHeight: number
  inputSize: number
  inputSizeFormatted: string
  outputSize: number
  outputSizeFormatted: string
}

interface ConversionResult {
  imageData: string
  dataUri: string
  mimeType: string
  format: string
  width: number
  height: number
  originalFormat: string
  statistics: Statistics
}

export default function Base64ToImage() {
  const [base64Input, setBase64Input] = useState('')
  const [result, setResult] = useState<ConversionResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [outputFormat, setOutputFormat] = useState('png')
  const [quality, setQuality] = useState(85)
  const [resizeWidth, setResizeWidth] = useState('')
  const [resizeHeight, setResizeHeight] = useState('')
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true)

  const handleConvert = async () => {
    if (!base64Input.trim()) {
      setError('Please enter a Base64 string')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const payload: any = {
        base64: base64Input,
        outputFormat,
        quality,
      }

      if (resizeWidth) payload.resizeWidth = parseInt(resizeWidth)
      if (resizeHeight && !maintainAspectRatio) payload.resizeHeight = parseInt(resizeHeight)

      const data = await backendApi.post('/api/tools/image/from-base64', payload)
      setResult(data)
    } catch (err: any) {
      setError(err.message || 'Failed to convert Base64 to image')
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setBase64Input('')
    setResult(null)
    setError('')
  }

  const downloadImage = () => {
    if (!result) return

    const link = document.createElement('a')
    link.href = result.dataUri
    link.download = `image.${result.format.toLowerCase()}`
    link.click()
  }

  const loadSample = () => {
    // Small sample base64 image (1x1 red pixel PNG)
    const sample =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg=='
    setBase64Input(sample)
  }

  return (
    <div className="space-y-6">
      {/* Input Area */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-900 dark:text-white">
            Base64 String or Data URI
          </label>
          <button onClick={loadSample} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            Load Sample
          </button>
        </div>
        <textarea
          value={base64Input}
          onChange={(e) => setBase64Input(e.target.value)}
          placeholder="Paste your Base64 string here... (with or without data URI prefix)"
          rows={8}
          className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg font-mono text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-y"
        />
        <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
          Supports both plain Base64 and Data URI format (data:image/...;base64,...)
        </div>
      </div>

      {/* Options */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 space-y-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">Conversion Options</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
              Output Format
            </label>
            <select
              value={outputFormat}
              onChange={(e) => setOutputFormat(e.target.value)}
              className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
            >
              <option value="png">PNG</option>
              <option value="jpg">JPEG</option>
              <option value="webp">WebP</option>
              <option value="gif">GIF</option>
              <option value="bmp">BMP</option>
            </select>
          </div>

          {(outputFormat === 'jpg' || outputFormat === 'webp') && (
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
                Quality: {quality}%
              </label>
              <input
                type="range"
                min="1"
                max="100"
                value={quality}
                onChange={(e) => setQuality(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          )}
        </div>

        {/* Resize Options */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
          <h4 className="text-sm font-medium mb-3 text-gray-900 dark:text-white">Resize (Optional)</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Width (px)
              </label>
              <input
                type="number"
                value={resizeWidth}
                onChange={(e) => setResizeWidth(e.target.value)}
                placeholder="Leave empty to keep original"
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Height (px)
              </label>
              <input
                type="number"
                value={resizeHeight}
                onChange={(e) => setResizeHeight(e.target.value)}
                placeholder="Leave empty to keep original"
                disabled={maintainAspectRatio && !!resizeWidth}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50"
              />
            </div>
          </div>

          <label className="flex items-center space-x-2 mt-3">
            <input
              type="checkbox"
              checked={maintainAspectRatio}
              onChange={(e) => setMaintainAspectRatio(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Maintain aspect ratio</span>
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleConvert}
          disabled={!base64Input.trim() || loading}
          className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors"
        >
          {loading ? 'Converting...' : 'Convert to Image'}
        </button>

        <button
          onClick={handleClear}
          className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
        >
          Clear
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/50 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Image Preview */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Image Preview</h3>
              <button
                onClick={downloadImage}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Download Image
              </button>
            </div>

            <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 flex items-center justify-center min-h-64">
              <img
                src={result.dataUri}
                alt="Converted"
                className="max-w-full max-h-96 rounded border border-gray-300 dark:border-gray-700"
                style={{ imageRendering: 'auto' }}
              />
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Image Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Original Size</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {result.statistics.originalWidth} × {result.statistics.originalHeight}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">New Size</div>
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {result.statistics.newWidth} × {result.statistics.newHeight}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Format</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{result.format}</div>
                {result.originalFormat !== 'UNKNOWN' && result.originalFormat !== result.format && (
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    from {result.originalFormat}
                  </div>
                )}
              </div>

              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Output Size</div>
                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                  {result.statistics.outputSizeFormatted}
                </div>
              </div>
            </div>
          </div>

          {/* Image Data URI */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">Image Data URI</h3>
              <button
                onClick={() => navigator.clipboard.writeText(result.dataUri)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Copy
              </button>
            </div>
            <textarea
              value={result.dataUri}
              readOnly
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg font-mono text-xs text-gray-900 dark:text-white resize-y"
            />
            <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
              Use this in HTML img src or CSS background-image
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

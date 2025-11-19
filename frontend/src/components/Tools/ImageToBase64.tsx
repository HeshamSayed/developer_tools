import { useState, useRef } from 'react'

interface Statistics {
  originalSize: number
  originalSizeFormatted: string
  base64Size: number
  base64SizeFormatted: string
  dataUriSize: number
  dataUriSizeFormatted: string
  increase: number
}

interface ConversionResult {
  base64: string
  dataUri: string | null
  mimeType: string
  format: string
  width: number
  height: number
  originalFilename: string
  statistics: Statistics
}

export default function ImageToBase64() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [result, setResult] = useState<ConversionResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [outputFormat, setOutputFormat] = useState('png')
  const [includeDataUri, setIncludeDataUri] = useState(true)
  const [quality, setQuality] = useState(85)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file')
      return
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      setError('File too large. Maximum size is 10MB')
      return
    }

    setSelectedFile(file)
    setError('')
    setResult(null)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const handleConvert = async () => {
    if (!selectedFile) {
      setError('Please select an image first')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('image', selectedFile)
      formData.append('outputFormat', outputFormat)
      formData.append('includeDataUri', includeDataUri.toString())
      formData.append('quality', quality.toString())

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/tools/image/to-base64`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Conversion failed')
      }

      const data = await response.json()
      setResult(data)
    } catch (err: any) {
      setError(err.message || 'Failed to convert image')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const downloadAsFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleClear = () => {
    setSelectedFile(null)
    setPreviewUrl('')
    setResult(null)
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-6">
      {/* File Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
          id="file-upload"
        />

        {!selectedFile ? (
          <div className="space-y-4">
            <div className="text-gray-600 dark:text-gray-400">
              <svg
                className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <label
                htmlFor="file-upload"
                className="cursor-pointer text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Choose an image
              </label>
              <span className="text-gray-600 dark:text-gray-400"> or drag and drop</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-500">PNG, JPG, GIF, WebP up to 10MB</p>
          </div>
        ) : (
          <div className="space-y-4">
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Preview"
                className="max-h-64 mx-auto rounded border border-gray-300 dark:border-gray-700"
              />
            )}
            <div className="text-gray-900 dark:text-white font-medium">{selectedFile.name}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {(selectedFile.size / 1024).toFixed(2)} KB
            </div>
            <button
              onClick={handleClear}
              className="text-sm text-red-600 dark:text-red-400 hover:underline"
            >
              Remove
            </button>
          </div>
        )}
      </div>

      {/* Options */}
      {selectedFile && (
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

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={includeDataUri}
              onChange={(e) => setIncludeDataUri(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Include Data URI prefix (data:image/...;base64,)
            </span>
          </label>
        </div>
      )}

      {/* Convert Button */}
      <button
        onClick={handleConvert}
        disabled={!selectedFile || loading}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors"
      >
        {loading ? 'Converting...' : 'Convert to Base64'}
      </button>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/50 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Statistics */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Image Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Dimensions</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {result.width} × {result.height}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Format</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{result.format}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Original Size</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {result.statistics.originalSizeFormatted}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Base64 Size</div>
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {result.statistics.base64SizeFormatted}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  +{result.statistics.increase.toFixed(1)}% larger
                </div>
              </div>
            </div>
          </div>

          {/* Base64 Output */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {includeDataUri ? 'Data URI' : 'Base64 String'}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(includeDataUri && result.dataUri ? result.dataUri : result.base64)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Copy
                </button>
                <button
                  onClick={() =>
                    downloadAsFile(
                      includeDataUri && result.dataUri ? result.dataUri : result.base64,
                      `${result.originalFilename}.txt`
                    )
                  }
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Download
                </button>
              </div>
            </div>
            <textarea
              value={includeDataUri && result.dataUri ? result.dataUri : result.base64}
              readOnly
              rows={8}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg font-mono text-xs text-gray-900 dark:text-white resize-y"
            />
            <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
              Length: {(includeDataUri && result.dataUri ? result.dataUri : result.base64).length} characters
            </div>
          </div>

          {/* Usage Example */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Usage Examples</h3>
            <div className="space-y-3">
              <div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">HTML:</div>
                <code className="block px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded text-xs text-gray-900 dark:text-gray-300 overflow-x-auto">
                  &lt;img src="{includeDataUri && result.dataUri ? result.dataUri.substring(0, 50) : `data:${result.mimeType};base64,${result.base64.substring(0, 30)}`}..." /&gt;
                </code>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CSS:</div>
                <code className="block px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded text-xs text-gray-900 dark:text-gray-300 overflow-x-auto">
                  background-image: url("{includeDataUri && result.dataUri ? result.dataUri.substring(0, 50) : `data:${result.mimeType};base64,${result.base64.substring(0, 30)}`}...");
                </code>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

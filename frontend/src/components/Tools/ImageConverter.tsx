import { useState, useRef } from 'react'
import { convertImage } from '@/services/api'

export default function ImageConverter() {
  const [inputImageData, setInputImageData] = useState<string>('')
  const [outputImageData, setOutputImageData] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [outputFormat, setOutputFormat] = useState<'PNG' | 'JPEG' | 'WEBP'>('PNG')
  const [quality, setQuality] = useState(90)
  const [imageInfo, setImageInfo] = useState<{
    width: number
    height: number
    originalSize: number
    convertedSize: number
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string
        setInputImageData(dataUrl)
        setError('')
        setOutputImageData('')
        setImageInfo(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleConvert = async () => {
    if (!inputImageData) {
      setError('Please upload an image first')
      return
    }

    setLoading(true)
    setError('')
    setOutputImageData('')

    try {
      const result = await convertImage(inputImageData, outputFormat, quality)

      if (result.success) {
        setOutputImageData(result.result)
        setImageInfo({
          width: result.width,
          height: result.height,
          originalSize: result.original_size,
          convertedSize: result.converted_size
        })
      } else {
        setError(result.error || 'Failed to convert image')
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to convert image')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (!outputImageData) return

    const link = document.createElement('a')
    link.href = outputImageData
    link.download = `converted.${outputFormat.toLowerCase()}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Upload Image
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-primary"
          >
            📁 Choose Image
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      {inputImageData && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Original Image
          </label>
          <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
            <img
              src={inputImageData}
              alt="Original"
              className="max-w-full h-auto max-h-96 mx-auto"
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Output Format
          </label>
          <select
            value={outputFormat}
            onChange={(e) => setOutputFormat(e.target.value as 'PNG' | 'JPEG' | 'WEBP')}
            className="input"
          >
            <option value="PNG">PNG</option>
            <option value="JPEG">JPEG</option>
            <option value="WEBP">WebP</option>
          </select>
        </div>

        {(outputFormat === 'JPEG' || outputFormat === 'WEBP') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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

      <div className="flex justify-center">
        <button
          onClick={handleConvert}
          disabled={loading || !inputImageData}
          className="btn btn-primary px-8"
        >
          {loading ? 'Converting...' : 'Convert Image'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      {outputImageData && imageInfo && (
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Image Info</h4>
            <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <p>Dimensions: {imageInfo.width} x {imageInfo.height}px</p>
              <p>Original Size: {formatBytes(imageInfo.originalSize)}</p>
              <p>Converted Size: {formatBytes(imageInfo.convertedSize)}</p>
              <p className="font-semibold">
                {imageInfo.convertedSize < imageInfo.originalSize
                  ? `Reduced by ${formatBytes(imageInfo.originalSize - imageInfo.convertedSize)}`
                  : `Increased by ${formatBytes(imageInfo.convertedSize - imageInfo.originalSize)}`
                }
              </p>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Converted Image ({outputFormat})
              </label>
              <button
                onClick={handleDownload}
                className="btn btn-secondary text-sm"
              >
                ⬇️ Download
              </button>
            </div>
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
              <img
                src={outputImageData}
                alt="Converted"
                className="max-w-full h-auto max-h-96 mx-auto"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

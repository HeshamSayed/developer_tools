import { useState, useRef } from 'react'

export default function ImageCompressor() {
  const [image, setImage] = useState<string | null>(null)
  const [compressedImage, setCompressedImage] = useState<string | null>(null)
  const [originalSize, setOriginalSize] = useState<number>(0)
  const [compressedSize, setCompressedSize] = useState<number>(0)
  const [quality, setQuality] = useState<number>(80)
  const [format, setFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setOriginalSize(file.size)
      const reader = new FileReader()
      reader.onload = (event) => {
        setImage(event.target?.result as string)
        setCompressedImage(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const compressImage = () => {
    if (!image || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      const compressed = canvas.toDataURL(format, quality / 100)
      setCompressedImage(compressed)

      // Calculate compressed size (approximate)
      const base64Length = compressed.length - `data:${format};base64,`.length
      const padding = (compressed.match(/=/g) || []).length
      const bytes = (base64Length * 3) / 4 - padding
      setCompressedSize(bytes)
    }
    img.src = image
  }

  const downloadImage = () => {
    if (!compressedImage) return
    const link = document.createElement('a')
    const extension = format.split('/')[1]
    link.download = `compressed-image.${extension}`
    link.href = compressedImage
    link.click()
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const compressionRatio = originalSize && compressedSize
    ? (((originalSize - compressedSize) / originalSize) * 100).toFixed(1)
    : 0

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">🗜️ Image Compressor</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Reduce image file size while maintaining quality
        </p>

        {/* File Upload */}
        <div className="mb-6">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn bg-primary-600 text-white hover:bg-primary-700 w-full"
          >
            📁 Upload Image
          </button>
        </div>

        {image && (
          <div className="space-y-6">
            {/* Compression Settings */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Output Format:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setFormat('image/jpeg')}
                    className={`btn-sm ${
                      format === 'image/jpeg'
                        ? 'bg-primary-600 text-white'
                        : 'border border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    JPEG
                  </button>
                  <button
                    onClick={() => setFormat('image/png')}
                    className={`btn-sm ${
                      format === 'image/png'
                        ? 'bg-primary-600 text-white'
                        : 'border border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    PNG
                  </button>
                  <button
                    onClick={() => setFormat('image/webp')}
                    className={`btn-sm ${
                      format === 'image/webp'
                        ? 'bg-primary-600 text-white'
                        : 'border border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    WebP
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {format === 'image/jpeg' && '✓ Best for photos (smallest size)'}
                  {format === 'image/png' && '✓ Supports transparency'}
                  {format === 'image/webp' && '✓ Modern format (best quality/size ratio)'}
                </p>
              </div>

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
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>Smaller file</span>
                  <span>Better quality</span>
                </div>
              </div>

              {/* Quick Presets */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quick Presets:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => setQuality(60)}
                    className="btn-sm border border-gray-300 dark:border-gray-600 hover:border-primary-500"
                  >
                    Low (60%)
                  </button>
                  <button
                    onClick={() => setQuality(75)}
                    className="btn-sm border border-gray-300 dark:border-gray-600 hover:border-primary-500"
                  >
                    Medium (75%)
                  </button>
                  <button
                    onClick={() => setQuality(85)}
                    className="btn-sm border border-gray-300 dark:border-gray-600 hover:border-primary-500"
                  >
                    High (85%)
                  </button>
                  <button
                    onClick={() => setQuality(95)}
                    className="btn-sm border border-gray-300 dark:border-gray-600 hover:border-primary-500"
                  >
                    Max (95%)
                  </button>
                </div>
              </div>
            </div>

            {/* Compress Button */}
            <button
              onClick={compressImage}
              className="btn bg-accent-600 text-white hover:bg-accent-700 w-full"
            >
              🗜️ Compress Image
            </button>

            {/* Canvas (hidden) */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Results */}
            {compressedImage && (
              <div className="space-y-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                {/* Size Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Original Size</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatFileSize(originalSize)}
                    </p>
                  </div>
                  <div className="bg-success-50 dark:bg-success-900/20 rounded-lg p-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Compressed Size</p>
                    <p className="text-lg font-bold text-success-600 dark:text-success-400">
                      {formatFileSize(compressedSize)}
                    </p>
                  </div>
                  <div className="bg-accent-50 dark:bg-accent-900/20 rounded-lg p-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Size Reduced</p>
                    <p className="text-lg font-bold text-accent-600 dark:text-accent-400">
                      {compressionRatio}%
                    </p>
                  </div>
                </div>

                {/* Preview Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Original
                    </h3>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                      <img
                        src={image}
                        alt="Original"
                        className="max-w-full h-auto mx-auto rounded shadow"
                        style={{ maxHeight: '300px' }}
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Compressed
                    </h3>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                      <img
                        src={compressedImage}
                        alt="Compressed"
                        className="max-w-full h-auto mx-auto rounded shadow"
                        style={{ maxHeight: '300px' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Download Button */}
                <button
                  onClick={downloadImage}
                  className="btn bg-success-600 text-white hover:bg-success-700 w-full"
                >
                  💾 Download Compressed Image
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="card bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800">
        <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-100 mb-3">
          💡 Compression Tips
        </h3>
        <ul className="space-y-2 text-sm text-primary-800 dark:text-primary-200">
          <li>• <strong>JPEG:</strong> Best for photos and complex images (smaller files)</li>
          <li>• <strong>PNG:</strong> Use when you need transparency or lossless quality</li>
          <li>• <strong>WebP:</strong> Modern format offering best compression (not all browsers support it)</li>
          <li>• Quality 75-85% usually provides good balance between size and quality</li>
          <li>• All compression happens locally - images never leave your device</li>
        </ul>
      </div>
    </div>
  )
}

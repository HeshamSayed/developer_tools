import { useState, useRef } from 'react'

interface ImageData {
  name: string
  size: number
  type: string
  width: number
  height: number
  aspectRatio: string
  megapixels: string
  url: string
}

export default function ImageInfo() {
  const [imageData, setImageData] = useState<ImageData | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new Image()
        img.onload = () => {
          const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))
          const divisor = gcd(img.width, img.height)
          const aspectRatio = `${img.width / divisor}:${img.height / divisor}`
          const megapixels = ((img.width * img.height) / 1000000).toFixed(2)

          setImageData({
            name: file.name,
            size: file.size,
            type: file.type,
            width: img.width,
            height: img.height,
            aspectRatio,
            megapixels,
            url: event.target?.result as string,
          })
        }
        img.src = event.target?.result as string
      }
      reader.readAsDataURL(file)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const getResolutionCategory = (width: number, height: number): string => {
    const pixels = width * height
    if (pixels >= 7680 * 4320) return '8K Ultra HD'
    if (pixels >= 3840 * 2160) return '4K Ultra HD (UHD)'
    if (pixels >= 2560 * 1440) return 'QHD (2K)'
    if (pixels >= 1920 * 1080) return 'Full HD (1080p)'
    if (pixels >= 1280 * 720) return 'HD (720p)'
    if (pixels >= 854 * 480) return 'SD (480p)'
    return 'Low Resolution'
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Image Info & Resolution</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Get detailed information about your image including resolution, file size, and format
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

        {imageData && (
          <div className="space-y-6">
            {/* Image Preview */}
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
              <img
                src={imageData.url}
                alt="Preview"
                className="max-w-full h-auto max-h-64 mx-auto rounded shadow-lg"
              />
            </div>

            {/* Image Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-lg p-4 border border-primary-200 dark:border-primary-800">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  File Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Filename:</span>
                    <span className="font-medium text-gray-900 dark:text-white truncate ml-2 max-w-xs" title={imageData.name}>
                      {imageData.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">File Size:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formatFileSize(imageData.size)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Format:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{imageData.type.split('/')[1].toUpperCase()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-accent-50 to-primary-50 dark:from-accent-900/20 dark:to-primary-900/20 rounded-lg p-4 border border-accent-200 dark:border-accent-800">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Resolution Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Dimensions:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{imageData.width} × {imageData.height} px</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Aspect Ratio:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{imageData.aspectRatio}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Megapixels:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{imageData.megapixels} MP</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Resolution Category */}
            <div className="bg-gradient-to-r from-success-50 to-primary-50 dark:from-success-900/20 dark:to-primary-900/20 rounded-lg p-6 border-2 border-success-200 dark:border-success-800">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-success-100 dark:bg-success-900 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-success-600 dark:text-success-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {getResolutionCategory(imageData.width, imageData.height)}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    This image has {imageData.width} × {imageData.height} resolution
                  </p>
                </div>
              </div>
            </div>

            {/* Common Uses */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                📋 Recommended Uses:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                {imageData.width >= 1920 && imageData.height >= 1080 && (
                  <>
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <span className="text-green-500">✓</span> Print quality
                    </div>
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <span className="text-green-500">✓</span> Large displays
                    </div>
                  </>
                )}
                {imageData.width >= 1280 && imageData.height >= 720 && (
                  <>
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <span className="text-green-500">✓</span> Web banners
                    </div>
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <span className="text-green-500">✓</span> Social media
                    </div>
                  </>
                )}
                {imageData.width >= 800 && imageData.height >= 600 && (
                  <>
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <span className="text-green-500">✓</span> Blog posts
                    </div>
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <span className="text-green-500">✓</span> Email newsletters
                    </div>
                  </>
                )}
                {imageData.width < 800 && (
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 col-span-2">
                    <span className="text-yellow-500">⚠</span> Best for thumbnails and icons
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Help Section */}
      <div className="card bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800">
        <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-100 mb-3">
          💡 Understanding Image Resolution
        </h3>
        <ul className="space-y-2 text-sm text-primary-800 dark:text-primary-200">
          <li>• <strong>Dimensions:</strong> Width × Height in pixels</li>
          <li>• <strong>Aspect Ratio:</strong> Proportional relationship between width and height</li>
          <li>• <strong>Megapixels:</strong> Total number of pixels (millions)</li>
          <li>• <strong>Higher resolution:</strong> Better quality but larger file size</li>
          <li>• All analysis happens in your browser - images stay private</li>
        </ul>
      </div>
    </div>
  )
}

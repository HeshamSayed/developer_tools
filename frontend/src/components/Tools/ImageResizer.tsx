import { useState, useRef } from 'react'

export default function ImageResizer() {
  const [image, setImage] = useState<string | null>(null)
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 })
  const [width, setWidth] = useState<number>(0)
  const [height, setHeight] = useState<number>(0)
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true)
  const [resizedImage, setResizedImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new Image()
        img.onload = () => {
          setOriginalDimensions({ width: img.width, height: img.height })
          setWidth(img.width)
          setHeight(img.height)
          setImage(event.target?.result as string)
          setResizedImage(null)
        }
        img.src = event.target?.result as string
      }
      reader.readAsDataURL(file)
    }
  }

  const handleWidthChange = (newWidth: number) => {
    setWidth(newWidth)
    if (maintainAspectRatio && originalDimensions.width > 0) {
      const aspectRatio = originalDimensions.height / originalDimensions.width
      setHeight(Math.round(newWidth * aspectRatio))
    }
  }

  const handleHeightChange = (newHeight: number) => {
    setHeight(newHeight)
    if (maintainAspectRatio && originalDimensions.height > 0) {
      const aspectRatio = originalDimensions.width / originalDimensions.height
      setWidth(Math.round(newHeight * aspectRatio))
    }
  }

  const resizeImage = () => {
    if (!image || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      canvas.width = width
      canvas.height = height
      ctx.drawImage(img, 0, 0, width, height)
      setResizedImage(canvas.toDataURL('image/png'))
    }
    img.src = image
  }

  const downloadImage = () => {
    if (!resizedImage) return
    const link = document.createElement('a')
    link.download = `resized-${width}x${height}.png`
    link.href = resizedImage
    link.click()
  }

  const resetPresets = (presetWidth: number, presetHeight: number) => {
    setWidth(presetWidth)
    setHeight(presetHeight)
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Image Resizer</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Resize images to custom dimensions while maintaining quality
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
            {/* Original Image Info */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Original Dimensions:</p>
              <p className="text-gray-600 dark:text-gray-400">
                {originalDimensions.width} × {originalDimensions.height} px
              </p>
            </div>

            {/* Quick Presets */}
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">Quick Presets:</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <button
                  onClick={() => resetPresets(1920, 1080)}
                  className="btn-sm border border-gray-300 dark:border-gray-600 hover:border-primary-500"
                >
                  1920×1080 (FHD)
                </button>
                <button
                  onClick={() => resetPresets(1280, 720)}
                  className="btn-sm border border-gray-300 dark:border-gray-600 hover:border-primary-500"
                >
                  1280×720 (HD)
                </button>
                <button
                  onClick={() => resetPresets(800, 600)}
                  className="btn-sm border border-gray-300 dark:border-gray-600 hover:border-primary-500"
                >
                  800×600
                </button>
                <button
                  onClick={() => resetPresets(640, 480)}
                  className="btn-sm border border-gray-300 dark:border-gray-600 hover:border-primary-500"
                >
                  640×480
                </button>
              </div>
            </div>

            {/* Dimension Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Width (px)
                </label>
                <input
                  type="number"
                  value={width}
                  onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                  className="input w-full"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Height (px)
                </label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                  className="input w-full"
                  min="1"
                />
              </div>
            </div>

            {/* Aspect Ratio Toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={maintainAspectRatio}
                onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Maintain aspect ratio
              </span>
            </label>

            {/* Resize Button */}
            <button
              onClick={resizeImage}
              className="btn bg-accent-600 text-white hover:bg-accent-700 w-full"
            >
              ✨ Resize Image
            </button>

            {/* Canvas (hidden) */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Preview */}
            {resizedImage && (
              <div className="space-y-4">
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Resized Image ({width}×{height})
                    </h3>
                    <button
                      onClick={downloadImage}
                      className="btn bg-success-600 text-white hover:bg-success-700"
                    >
                      💾 Download
                    </button>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 max-h-96 overflow-auto">
                    <img
                      src={resizedImage}
                      alt="Resized"
                      className="max-w-full h-auto mx-auto rounded shadow-lg"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Help Section */}
      <div className="card bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800">
        <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-100 mb-3">
          💡 Tips
        </h3>
        <ul className="space-y-2 text-sm text-primary-800 dark:text-primary-200">
          <li>• Maintain aspect ratio to prevent image distortion</li>
          <li>• Use quick presets for common dimensions</li>
          <li>• Larger dimensions may increase file size</li>
          <li>• All processing happens in your browser - your images stay private</li>
        </ul>
      </div>
    </div>
  )
}

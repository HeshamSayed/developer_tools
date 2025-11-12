import { useState, useRef, useEffect } from 'react'

export default function ImageResizer() {
  const [image, setImage] = useState<string | null>(null)
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 })
  const [width, setWidth] = useState<number>(0)
  const [height, setHeight] = useState<number>(0)
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true)
  const [resizedImage, setResizedImage] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragHandle, setDragHandle] = useState<string | null>(null)
  const [previewDimensions, setPreviewDimensions] = useState({ width: 0, height: 0 })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imagePreviewRef = useRef<HTMLDivElement>(null)
  const dragStartPos = useRef({ x: 0, y: 0, width: 0, height: 0 })

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new Image()
        img.onload = () => {
          setOriginalDimensions({ width: img.width, height: img.height })
          // Start with a reasonable preview size (max 600px)
          const scale = Math.min(600 / img.width, 600 / img.height, 1)
          const previewW = Math.round(img.width * scale)
          const previewH = Math.round(img.height * scale)
          setWidth(img.width)
          setHeight(img.height)
          setPreviewDimensions({ width: previewW, height: previewH })
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

  // Drag resize handlers
  const handleMouseDown = (e: React.MouseEvent, handle: string) => {
    e.preventDefault()
    setIsDragging(true)
    setDragHandle(handle)
    dragStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      width: previewDimensions.width,
      height: previewDimensions.height
    }
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !dragHandle) return

      const deltaX = e.clientX - dragStartPos.current.x
      const deltaY = e.clientY - dragStartPos.current.y

      let newWidth = previewDimensions.width
      let newHeight = previewDimensions.height

      switch (dragHandle) {
        case 'se': // Bottom-right
          newWidth = Math.max(50, dragStartPos.current.width + deltaX)
          newHeight = Math.max(50, dragStartPos.current.height + deltaY)
          break
        case 'sw': // Bottom-left
          newWidth = Math.max(50, dragStartPos.current.width - deltaX)
          newHeight = Math.max(50, dragStartPos.current.height + deltaY)
          break
        case 'ne': // Top-right
          newWidth = Math.max(50, dragStartPos.current.width + deltaX)
          newHeight = Math.max(50, dragStartPos.current.height - deltaY)
          break
        case 'nw': // Top-left
          newWidth = Math.max(50, dragStartPos.current.width - deltaX)
          newHeight = Math.max(50, dragStartPos.current.height - deltaY)
          break
      }

      if (maintainAspectRatio && originalDimensions.width > 0) {
        const aspectRatio = originalDimensions.height / originalDimensions.width
        if (dragHandle === 'se' || dragHandle === 'ne') {
          newHeight = Math.round(newWidth * aspectRatio)
        } else {
          newHeight = Math.round(newWidth * aspectRatio)
        }
      }

      setPreviewDimensions({ width: newWidth, height: newHeight })

      // Update actual dimensions based on preview scale
      const scaleX = originalDimensions.width / dragStartPos.current.width
      const scaleY = originalDimensions.height / dragStartPos.current.height
      setWidth(Math.round(newWidth * scaleX))
      setHeight(Math.round(newHeight * scaleY))
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      setDragHandle(null)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragHandle, maintainAspectRatio, originalDimensions, previewDimensions])

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
    // Update preview dimensions proportionally
    if (originalDimensions.width > 0) {
      const scale = Math.min(600 / presetWidth, 600 / presetHeight, 1)
      setPreviewDimensions({
        width: Math.round(presetWidth * scale),
        height: Math.round(presetHeight * scale)
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Interactive Image Resizer
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Resize images by dragging corners or entering dimensions manually
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
            className="btn-primary w-full"
          >
            📁 Upload Image
          </button>
        </div>

        {image && (
          <div className="space-y-6">
            {/* Original Image Info */}
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Original Dimensions:
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                {originalDimensions.width} × {originalDimensions.height} px
              </p>
            </div>

            {/* Interactive Preview with Drag Handles */}
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Interactive Preview (Drag corners to resize):
              </p>
              <div className="flex justify-center bg-gray-100 dark:bg-gray-800 rounded-lg p-8">
                <div
                  ref={imagePreviewRef}
                  className="relative"
                  style={{
                    width: `${previewDimensions.width}px`,
                    height: `${previewDimensions.height}px`,
                    cursor: isDragging ? 'nwse-resize' : 'default'
                  }}
                >
                  <img
                    src={image}
                    alt="Preview"
                    className="w-full h-full object-fill border-2 border-blue-500 rounded"
                    draggable={false}
                  />

                  {/* Drag Handles */}
                  {!isDragging && (
                    <>
                      {/* Top-left */}
                      <div
                        className="absolute -top-2 -left-2 w-4 h-4 bg-blue-600 border-2 border-white rounded-full cursor-nw-resize hover:bg-blue-700 shadow-lg"
                        onMouseDown={(e) => handleMouseDown(e, 'nw')}
                      />
                      {/* Top-right */}
                      <div
                        className="absolute -top-2 -right-2 w-4 h-4 bg-blue-600 border-2 border-white rounded-full cursor-ne-resize hover:bg-blue-700 shadow-lg"
                        onMouseDown={(e) => handleMouseDown(e, 'ne')}
                      />
                      {/* Bottom-left */}
                      <div
                        className="absolute -bottom-2 -left-2 w-4 h-4 bg-blue-600 border-2 border-white rounded-full cursor-sw-resize hover:bg-blue-700 shadow-lg"
                        onMouseDown={(e) => handleMouseDown(e, 'sw')}
                      />
                      {/* Bottom-right */}
                      <div
                        className="absolute -bottom-2 -right-2 w-4 h-4 bg-blue-600 border-2 border-white rounded-full cursor-se-resize hover:bg-blue-700 shadow-lg"
                        onMouseDown={(e) => handleMouseDown(e, 'se')}
                      />
                    </>
                  )}

                  {/* Dimension Overlay */}
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-3 py-1 rounded text-xs font-semibold whitespace-nowrap">
                    {width} × {height} px
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Presets */}
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Quick Presets:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <button
                  onClick={() => resetPresets(1920, 1080)}
                  className="btn-secondary text-sm"
                >
                  1920×1080 (FHD)
                </button>
                <button
                  onClick={() => resetPresets(1280, 720)}
                  className="btn-secondary text-sm"
                >
                  1280×720 (HD)
                </button>
                <button
                  onClick={() => resetPresets(800, 600)}
                  className="btn-secondary text-sm"
                >
                  800×600
                </button>
                <button
                  onClick={() => resetPresets(640, 480)}
                  className="btn-secondary text-sm"
                >
                  640×480
                </button>
              </div>
            </div>

            {/* Manual Dimension Controls */}
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Manual Input:
              </p>
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
            </div>

            {/* Aspect Ratio Toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={maintainAspectRatio}
                onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                🔒 Maintain aspect ratio
              </span>
            </label>

            {/* Resize Button */}
            <button
              onClick={resizeImage}
              className="btn-primary w-full"
            >
              ✨ Apply Resize
            </button>

            {/* Canvas (hidden) */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Preview of Resized Image */}
            {resizedImage && (
              <div className="space-y-4">
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Resized Image ({width}×{height})
                    </h3>
                    <button
                      onClick={downloadImage}
                      className="btn-primary flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download
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

      {/* Features */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Features</h3>
        <ul className="space-y-2 text-gray-600 dark:text-gray-400">
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>Interactive drag-to-resize with corner handles</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>Manual width/height input controls</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>Real-time dimension display while dragging</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>Quick presets for common sizes (FHD, HD, etc.)</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>Aspect ratio lock to prevent distortion</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>100% client-side - images never leave your browser</span>
          </li>
        </ul>
      </div>

      {/* Help Section */}
      <div className="card bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
          💡 How to Use
        </h3>
        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <li>• Upload an image to get started</li>
          <li>• <strong>Drag corner handles</strong> to resize interactively</li>
          <li>• Or enter exact dimensions manually in the input fields</li>
          <li>• Use quick presets for common sizes</li>
          <li>• Lock aspect ratio to prevent image distortion</li>
          <li>• Click "Apply Resize" to generate the final image</li>
          <li>• Download your resized image when ready</li>
        </ul>
      </div>
    </div>
  )
}

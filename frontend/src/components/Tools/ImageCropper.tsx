import { useState, useRef, useEffect } from 'react'

interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

type DragAction = 'move' | 'resize-nw' | 'resize-ne' | 'resize-sw' | 'resize-se' | 'resize-n' | 'resize-s' | 'resize-e' | 'resize-w' | null

export default function ImageCropper() {
  const [image, setImage] = useState<string | null>(null)
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 })
  const [displayDimensions, setDisplayDimensions] = useState({ width: 0, height: 0 })
  const [cropArea, setCropArea] = useState<CropArea>({ x: 50, y: 50, width: 200, height: 200 })
  const [croppedImage, setCroppedImage] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragAction, setDragAction] = useState<DragAction>(null)
  const [aspectRatioLock, setAspectRatioLock] = useState<number | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const dragStart = useRef({ x: 0, y: 0, cropX: 0, cropY: 0, cropWidth: 0, cropHeight: 0 })

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new Image()
        img.onload = () => {
          setImageDimensions({ width: img.width, height: img.height })

          // Calculate display size (max 800px)
          const maxDisplay = 800
          const scale = Math.min(maxDisplay / img.width, maxDisplay / img.height, 1)
          const displayW = img.width * scale
          const displayH = img.height * scale
          setDisplayDimensions({ width: displayW, height: displayH })

          // Set initial crop area (60% of image, centered)
          const cropW = displayW * 0.6
          const cropH = displayH * 0.6
          setCropArea({
            x: (displayW - cropW) / 2,
            y: (displayH - cropH) / 2,
            width: cropW,
            height: cropH,
          })
        }
        img.src = event.target?.result as string
        setImage(event.target?.result as string)
        setCroppedImage(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleMouseDown = (e: React.MouseEvent, action: DragAction) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
    setDragAction(action)
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      cropX: cropArea.x,
      cropY: cropArea.y,
      cropWidth: cropArea.width,
      cropHeight: cropArea.height
    }
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !dragAction) return

      const deltaX = e.clientX - dragStart.current.x
      const deltaY = e.clientY - dragStart.current.y

      let newCrop = { ...cropArea }

      if (dragAction === 'move') {
        // Move crop area
        newCrop.x = Math.max(0, Math.min(displayDimensions.width - cropArea.width, dragStart.current.cropX + deltaX))
        newCrop.y = Math.max(0, Math.min(displayDimensions.height - cropArea.height, dragStart.current.cropY + deltaY))
      } else if (dragAction.startsWith('resize')) {
        // Resize crop area
        const minSize = 50

        if (dragAction.includes('n')) {
          const newY = Math.max(0, dragStart.current.cropY + deltaY)
          const newHeight = dragStart.current.cropHeight - (newY - dragStart.current.cropY)
          if (newHeight >= minSize) {
            newCrop.y = newY
            newCrop.height = newHeight
          }
        }
        if (dragAction.includes('s')) {
          newCrop.height = Math.max(minSize, Math.min(displayDimensions.height - dragStart.current.cropY, dragStart.current.cropHeight + deltaY))
        }
        if (dragAction.includes('w')) {
          const newX = Math.max(0, dragStart.current.cropX + deltaX)
          const newWidth = dragStart.current.cropWidth - (newX - dragStart.current.cropX)
          if (newWidth >= minSize) {
            newCrop.x = newX
            newCrop.width = newWidth
          }
        }
        if (dragAction.includes('e')) {
          newCrop.width = Math.max(minSize, Math.min(displayDimensions.width - dragStart.current.cropX, dragStart.current.cropWidth + deltaX))
        }

        // Apply aspect ratio lock if active
        if (aspectRatioLock) {
          if (dragAction.includes('e') || dragAction.includes('w')) {
            newCrop.height = newCrop.width / aspectRatioLock
          } else if (dragAction.includes('n') || dragAction.includes('s')) {
            newCrop.width = newCrop.height * aspectRatioLock
          }

          // Ensure within bounds
          if (newCrop.x + newCrop.width > displayDimensions.width) {
            newCrop.width = displayDimensions.width - newCrop.x
            newCrop.height = newCrop.width / aspectRatioLock
          }
          if (newCrop.y + newCrop.height > displayDimensions.height) {
            newCrop.height = displayDimensions.height - newCrop.y
            newCrop.width = newCrop.height * aspectRatioLock
          }
        }
      }

      setCropArea(newCrop)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      setDragAction(null)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragAction, cropArea, displayDimensions, aspectRatioLock])

  const cropImage = () => {
    if (!image || !canvasRef.current || !imageDimensions.width) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Calculate actual crop coordinates based on display scale
    const scaleX = imageDimensions.width / displayDimensions.width
    const scaleY = imageDimensions.height / displayDimensions.height

    const actualX = cropArea.x * scaleX
    const actualY = cropArea.y * scaleY
    const actualWidth = cropArea.width * scaleX
    const actualHeight = cropArea.height * scaleY

    const img = new Image()
    img.onload = () => {
      canvas.width = actualWidth
      canvas.height = actualHeight

      ctx.drawImage(
        img,
        actualX,
        actualY,
        actualWidth,
        actualHeight,
        0,
        0,
        actualWidth,
        actualHeight
      )

      setCroppedImage(canvas.toDataURL('image/png'))
    }
    img.src = image
  }

  const downloadImage = () => {
    if (!croppedImage) return
    const link = document.createElement('a')
    link.download = `cropped-${Math.round(cropArea.width)}x${Math.round(cropArea.height)}.png`
    link.href = croppedImage
    link.click()
  }

  const setPresetAspectRatio = (ratio: string) => {
    let newAspectRatio: number | null = null

    switch (ratio) {
      case '1:1':
        newAspectRatio = 1
        setCropArea({ ...cropArea, height: cropArea.width })
        break
      case '16:9':
        newAspectRatio = 16 / 9
        setCropArea({ ...cropArea, height: cropArea.width / (16 / 9) })
        break
      case '4:3':
        newAspectRatio = 4 / 3
        setCropArea({ ...cropArea, height: cropArea.width / (4 / 3) })
        break
      case '3:2':
        newAspectRatio = 3 / 2
        setCropArea({ ...cropArea, height: cropArea.width / (3 / 2) })
        break
      case 'free':
        newAspectRatio = null
        break
    }

    setAspectRatioLock(newAspectRatio)
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Interactive Image Cropper
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Crop images by dragging and resizing the selection area
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
            {/* Aspect Ratio Presets */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Aspect Ratio:
              </h3>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                <button
                  onClick={() => setPresetAspectRatio('free')}
                  className={`btn-secondary text-sm ${!aspectRatioLock ? 'ring-2 ring-blue-500' : ''}`}
                >
                  Free
                </button>
                <button
                  onClick={() => setPresetAspectRatio('1:1')}
                  className={`btn-secondary text-sm ${aspectRatioLock === 1 ? 'ring-2 ring-blue-500' : ''}`}
                >
                  1:1
                </button>
                <button
                  onClick={() => setPresetAspectRatio('16:9')}
                  className={`btn-secondary text-sm ${aspectRatioLock === 16/9 ? 'ring-2 ring-blue-500' : ''}`}
                >
                  16:9
                </button>
                <button
                  onClick={() => setPresetAspectRatio('4:3')}
                  className={`btn-secondary text-sm ${aspectRatioLock === 4/3 ? 'ring-2 ring-blue-500' : ''}`}
                >
                  4:3
                </button>
                <button
                  onClick={() => setPresetAspectRatio('3:2')}
                  className={`btn-secondary text-sm ${aspectRatioLock === 3/2 ? 'ring-2 ring-blue-500' : ''}`}
                >
                  3:2
                </button>
                <button
                  onClick={() => {
                    const size = Math.min(displayDimensions.width, displayDimensions.height) * 0.8
                    setCropArea({
                      x: (displayDimensions.width - size) / 2,
                      y: (displayDimensions.height - size) / 2,
                      width: size,
                      height: size,
                    })
                    setAspectRatioLock(1)
                  }}
                  className="btn-secondary text-sm"
                >
                  Circle
                </button>
              </div>
            </div>

            {/* Interactive Preview with Crop Selection */}
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Interactive Preview (Drag to move, resize with handles):
              </p>
              <div className="relative bg-gray-100 dark:bg-gray-800 rounded-lg p-4 overflow-hidden flex justify-center">
                <div className="relative" style={{ width: displayDimensions.width, height: displayDimensions.height }}>
                  <img
                    ref={imageRef}
                    src={image}
                    alt="Source"
                    className="w-full h-full object-contain select-none"
                    draggable={false}
                  />

                  {/* Dark overlay outside crop area */}
                  <div className="absolute inset-0 pointer-events-none">
                    <svg width="100%" height="100%">
                      <defs>
                        <mask id="crop-mask">
                          <rect width="100%" height="100%" fill="white" />
                          <rect
                            x={cropArea.x}
                            y={cropArea.y}
                            width={cropArea.width}
                            height={cropArea.height}
                            fill="black"
                          />
                        </mask>
                      </defs>
                      <rect width="100%" height="100%" fill="black" opacity="0.5" mask="url(#crop-mask)" />
                    </svg>
                  </div>

                  {/* Crop Area */}
                  <div
                    className="absolute border-2 border-blue-500"
                    style={{
                      left: `${cropArea.x}px`,
                      top: `${cropArea.y}px`,
                      width: `${cropArea.width}px`,
                      height: `${cropArea.height}px`,
                      cursor: isDragging && dragAction === 'move' ? 'grabbing' : 'grab',
                    }}
                    onMouseDown={(e) => handleMouseDown(e, 'move')}
                  >
                    {/* Grid lines */}
                    <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
                      {[...Array(9)].map((_, i) => (
                        <div key={i} className="border border-blue-400/50" />
                      ))}
                    </div>

                    {/* Resize Handles */}
                    {!isDragging && (
                      <>
                        {/* Corners */}
                        <div
                          className="absolute -top-2 -left-2 w-4 h-4 bg-blue-600 border-2 border-white rounded-full cursor-nw-resize hover:bg-blue-700 shadow-lg z-10"
                          onMouseDown={(e) => handleMouseDown(e, 'resize-nw')}
                        />
                        <div
                          className="absolute -top-2 -right-2 w-4 h-4 bg-blue-600 border-2 border-white rounded-full cursor-ne-resize hover:bg-blue-700 shadow-lg z-10"
                          onMouseDown={(e) => handleMouseDown(e, 'resize-ne')}
                        />
                        <div
                          className="absolute -bottom-2 -left-2 w-4 h-4 bg-blue-600 border-2 border-white rounded-full cursor-sw-resize hover:bg-blue-700 shadow-lg z-10"
                          onMouseDown={(e) => handleMouseDown(e, 'resize-sw')}
                        />
                        <div
                          className="absolute -bottom-2 -right-2 w-4 h-4 bg-blue-600 border-2 border-white rounded-full cursor-se-resize hover:bg-blue-700 shadow-lg z-10"
                          onMouseDown={(e) => handleMouseDown(e, 'resize-se')}
                        />

                        {/* Edges */}
                        <div
                          className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-6 h-2 bg-blue-600 border border-white rounded cursor-n-resize hover:bg-blue-700 shadow z-10"
                          onMouseDown={(e) => handleMouseDown(e, 'resize-n')}
                        />
                        <div
                          className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-2 bg-blue-600 border border-white rounded cursor-s-resize hover:bg-blue-700 shadow z-10"
                          onMouseDown={(e) => handleMouseDown(e, 'resize-s')}
                        />
                        <div
                          className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-6 bg-blue-600 border border-white rounded cursor-w-resize hover:bg-blue-700 shadow z-10"
                          onMouseDown={(e) => handleMouseDown(e, 'resize-w')}
                        />
                        <div
                          className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-6 bg-blue-600 border border-white rounded cursor-e-resize hover:bg-blue-700 shadow z-10"
                          onMouseDown={(e) => handleMouseDown(e, 'resize-e')}
                        />
                      </>
                    )}

                    {/* Dimension overlay */}
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-3 py-1 rounded text-xs font-semibold whitespace-nowrap">
                      {Math.round(cropArea.width * (imageDimensions.width / displayDimensions.width))} × {Math.round(cropArea.height * (imageDimensions.height / displayDimensions.height))} px
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Manual Controls */}
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Manual Adjustment:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    X Position
                  </label>
                  <input
                    type="number"
                    value={Math.round(cropArea.x)}
                    onChange={(e) =>
                      setCropArea({ ...cropArea, x: Math.max(0, Math.min(displayDimensions.width - cropArea.width, parseInt(e.target.value) || 0)) })
                    }
                    className="input w-full"
                    min="0"
                    max={displayDimensions.width - cropArea.width}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Y Position
                  </label>
                  <input
                    type="number"
                    value={Math.round(cropArea.y)}
                    onChange={(e) =>
                      setCropArea({ ...cropArea, y: Math.max(0, Math.min(displayDimensions.height - cropArea.height, parseInt(e.target.value) || 0)) })
                    }
                    className="input w-full"
                    min="0"
                    max={displayDimensions.height - cropArea.height}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Width
                  </label>
                  <input
                    type="number"
                    value={Math.round(cropArea.width)}
                    onChange={(e) => {
                      const newWidth = Math.max(50, Math.min(displayDimensions.width - cropArea.x, parseInt(e.target.value) || 1))
                      setCropArea({
                        ...cropArea,
                        width: newWidth,
                        height: aspectRatioLock ? newWidth / aspectRatioLock : cropArea.height
                      })
                    }}
                    className="input w-full"
                    min="50"
                    max={displayDimensions.width}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Height
                  </label>
                  <input
                    type="number"
                    value={Math.round(cropArea.height)}
                    onChange={(e) => {
                      const newHeight = Math.max(50, Math.min(displayDimensions.height - cropArea.y, parseInt(e.target.value) || 1))
                      setCropArea({
                        ...cropArea,
                        height: newHeight,
                        width: aspectRatioLock ? newHeight * aspectRatioLock : cropArea.width
                      })
                    }}
                    className="input w-full"
                    min="50"
                    max={displayDimensions.height}
                  />
                </div>
              </div>
            </div>

            {/* Crop Button */}
            <button
              onClick={cropImage}
              className="btn-primary w-full"
            >
              ✂️ Apply Crop
            </button>

            {/* Canvas (hidden) */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Cropped Result */}
            {croppedImage && (
              <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Cropped Image
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
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                  <img
                    src={croppedImage}
                    alt="Cropped"
                    className="max-w-full h-auto mx-auto rounded shadow-lg"
                  />
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
            <span>Interactive drag-to-move crop selection</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>Resize with corner and edge handles</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>Aspect ratio lock (1:1, 16:9, 4:3, 3:2, Free)</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>Real-time dimension display</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>Manual position and size adjustment</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>Grid overlay for perfect alignment</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>100% client-side - images never leave your browser</span>
          </li>
        </ul>
      </div>

      {/* Tips */}
      <div className="card bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
          💡 How to Use
        </h3>
        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <li>• Upload an image to get started</li>
          <li>• <strong>Drag the crop area</strong> to move it around</li>
          <li>• <strong>Drag corner/edge handles</strong> to resize the crop area</li>
          <li>• Select aspect ratio presets (1:1 for Instagram, 16:9 for YouTube)</li>
          <li>• Use manual inputs for precise positioning</li>
          <li>• Grid overlay helps with composition and alignment</li>
          <li>• Click "Apply Crop" to generate the final image</li>
        </ul>
      </div>
    </div>
  )
}

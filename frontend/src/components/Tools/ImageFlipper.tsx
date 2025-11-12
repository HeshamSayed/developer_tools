import { useState, useRef } from 'react'

type FlipDirection = 'horizontal' | 'vertical' | 'both' | null

export default function ImageFlipper() {
  const [image, setImage] = useState<string | null>(null)
  const [flippedImage, setFlippedImage] = useState<string | null>(null)
  const [currentFlip, setCurrentFlip] = useState<FlipDirection>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setImage(event.target?.result as string)
        setFlippedImage(null)
        setCurrentFlip(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const flipImage = (direction: FlipDirection) => {
    if (!image || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height

      ctx.save()

      // Apply transformations based on direction
      if (direction === 'horizontal' || direction === 'both') {
        ctx.translate(canvas.width, 0)
        ctx.scale(-1, 1)
      }

      if (direction === 'vertical' || direction === 'both') {
        if (direction === 'vertical') {
          ctx.translate(0, canvas.height)
          ctx.scale(1, -1)
        } else {
          // Already translated for horizontal, adjust for both
          ctx.translate(-canvas.width, canvas.height)
          ctx.scale(1, -1)
        }
      }

      ctx.drawImage(img, 0, 0)
      ctx.restore()

      setFlippedImage(canvas.toDataURL('image/png'))
      setCurrentFlip(direction)
    }
    img.src = image
  }

  const rotateImage = (degrees: number) => {
    if (!image || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      // Swap canvas dimensions for 90 and 270 degree rotations
      if (degrees === 90 || degrees === 270) {
        canvas.width = img.height
        canvas.height = img.width
      } else {
        canvas.width = img.width
        canvas.height = img.height
      }

      ctx.save()

      // Move to center and rotate
      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.rotate((degrees * Math.PI) / 180)
      ctx.drawImage(img, -img.width / 2, -img.height / 2)

      ctx.restore()

      setFlippedImage(canvas.toDataURL('image/png'))
      setCurrentFlip(null)
    }
    img.src = flippedImage || image
  }

  const resetImage = () => {
    setFlippedImage(null)
    setCurrentFlip(null)
  }

  const downloadImage = () => {
    if (!flippedImage) return
    const link = document.createElement('a')
    link.download = `flipped-image.png`
    link.href = flippedImage
    link.click()
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">🔄 Image Flipper & Rotator</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Flip and rotate images horizontally, vertically, or both
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
            {/* Flip Controls */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Flip Image:
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <button
                  onClick={() => flipImage('horizontal')}
                  className={`btn-sm ${
                    currentFlip === 'horizontal'
                      ? 'bg-primary-600 text-white'
                      : 'border border-gray-300 dark:border-gray-600 hover:border-primary-500'
                  }`}
                >
                  ↔️ Horizontal
                </button>
                <button
                  onClick={() => flipImage('vertical')}
                  className={`btn-sm ${
                    currentFlip === 'vertical'
                      ? 'bg-primary-600 text-white'
                      : 'border border-gray-300 dark:border-gray-600 hover:border-primary-500'
                  }`}
                >
                  ↕️ Vertical
                </button>
                <button
                  onClick={() => flipImage('both')}
                  className={`btn-sm ${
                    currentFlip === 'both'
                      ? 'bg-primary-600 text-white'
                      : 'border border-gray-300 dark:border-gray-600 hover:border-primary-500'
                  }`}
                >
                  ↔️↕️ Both
                </button>
                <button
                  onClick={resetImage}
                  className="btn-sm border border-gray-300 dark:border-gray-600 hover:border-error-500 hover:text-error-600"
                >
                  🔄 Reset
                </button>
              </div>
            </div>

            {/* Rotate Controls */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Rotate Image:
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <button
                  onClick={() => rotateImage(90)}
                  className="btn-sm border border-gray-300 dark:border-gray-600 hover:border-accent-500"
                >
                  ↻ 90°
                </button>
                <button
                  onClick={() => rotateImage(180)}
                  className="btn-sm border border-gray-300 dark:border-gray-600 hover:border-accent-500"
                >
                  ↻ 180°
                </button>
                <button
                  onClick={() => rotateImage(270)}
                  className="btn-sm border border-gray-300 dark:border-gray-600 hover:border-accent-500"
                >
                  ↻ 270°
                </button>
                <button
                  onClick={() => rotateImage(-90)}
                  className="btn-sm border border-gray-300 dark:border-gray-600 hover:border-accent-500"
                >
                  ↺ -90°
                </button>
              </div>
            </div>

            {/* Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Original */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Original:
                </h3>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                  <img
                    src={image}
                    alt="Original"
                    className="max-w-full h-auto mx-auto rounded shadow-lg"
                    style={{ maxHeight: '400px' }}
                  />
                </div>
              </div>

              {/* Flipped/Rotated */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Result:
                </h3>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                  {flippedImage ? (
                    <img
                      src={flippedImage}
                      alt="Flipped"
                      className="max-w-full h-auto mx-auto rounded shadow-lg"
                      style={{ maxHeight: '400px' }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-64 text-gray-400">
                      <div className="text-center">
                        <svg
                          className="w-12 h-12 mx-auto mb-2 opacity-50"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                        <p className="text-sm">Choose a flip or rotation option</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Download Button */}
            {flippedImage && (
              <button
                onClick={downloadImage}
                className="btn bg-success-600 text-white hover:bg-success-700 w-full"
              >
                💾 Download Image
              </button>
            )}

            {/* Hidden Canvas */}
            <canvas ref={canvasRef} className="hidden" />
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="card bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800">
        <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-100 mb-3">
          💡 Quick Tips
        </h3>
        <ul className="space-y-2 text-sm text-primary-800 dark:text-primary-200">
          <li>• <strong>Horizontal Flip:</strong> Creates a mirror image left-to-right</li>
          <li>• <strong>Vertical Flip:</strong> Creates a mirror image top-to-bottom</li>
          <li>• <strong>Rotation:</strong> Can be combined with flips for creative effects</li>
          <li>• <strong>Multiple Operations:</strong> Apply multiple flips and rotations in sequence</li>
          <li>• All processing happens in your browser - images stay private</li>
        </ul>
      </div>
    </div>
  )
}

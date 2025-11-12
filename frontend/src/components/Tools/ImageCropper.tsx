import { useState, useRef } from 'react'

interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

export default function ImageCropper() {
  const [image, setImage] = useState<string | null>(null)
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 })
  const [cropArea, setCropArea] = useState<CropArea>({ x: 50, y: 50, width: 200, height: 200 })
  const [croppedImage, setCroppedImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new Image()
        img.onload = () => {
          setImageDimensions({ width: img.width, height: img.height })
          setCropArea({
            x: img.width * 0.2,
            y: img.height * 0.2,
            width: img.width * 0.6,
            height: img.height * 0.6,
          })
        }
        img.src = event.target?.result as string
        setImage(event.target?.result as string)
        setCroppedImage(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const cropImage = () => {
    if (!image || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      canvas.width = cropArea.width
      canvas.height = cropArea.height

      ctx.drawImage(
        img,
        cropArea.x,
        cropArea.y,
        cropArea.width,
        cropArea.height,
        0,
        0,
        cropArea.width,
        cropArea.height
      )

      setCroppedImage(canvas.toDataURL('image/png'))
    }
    img.src = image
  }

  const downloadImage = () => {
    if (!croppedImage) return
    const link = document.createElement('a')
    link.download = 'cropped-image.png'
    link.href = croppedImage
    link.click()
  }

  const setPresetAspectRatio = (ratio: string) => {
    let newHeight = cropArea.height

    switch (ratio) {
      case '1:1':
        newHeight = cropArea.width
        break
      case '16:9':
        newHeight = (cropArea.width * 9) / 16
        break
      case '4:3':
        newHeight = (cropArea.width * 3) / 4
        break
      case '3:2':
        newHeight = (cropArea.width * 2) / 3
        break
      case 'free':
        return
    }

    setCropArea({ ...cropArea, height: newHeight })
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">✂️ Image Cropper</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Crop images to your desired dimensions and aspect ratio
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
            {/* Aspect Ratio Presets */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Aspect Ratio:
              </h3>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                <button
                  onClick={() => setPresetAspectRatio('free')}
                  className="btn-sm border border-gray-300 dark:border-gray-600 hover:border-primary-500"
                >
                  Free
                </button>
                <button
                  onClick={() => setPresetAspectRatio('1:1')}
                  className="btn-sm border border-gray-300 dark:border-gray-600 hover:border-primary-500"
                >
                  1:1
                </button>
                <button
                  onClick={() => setPresetAspectRatio('16:9')}
                  className="btn-sm border border-gray-300 dark:border-gray-600 hover:border-primary-500"
                >
                  16:9
                </button>
                <button
                  onClick={() => setPresetAspectRatio('4:3')}
                  className="btn-sm border border-gray-300 dark:border-gray-600 hover:border-primary-500"
                >
                  4:3
                </button>
                <button
                  onClick={() => setPresetAspectRatio('3:2')}
                  className="btn-sm border border-gray-300 dark:border-gray-600 hover:border-primary-500"
                >
                  3:2
                </button>
                <button
                  onClick={() => {
                    const size = Math.min(imageDimensions.width, imageDimensions.height)
                    setCropArea({
                      x: (imageDimensions.width - size) / 2,
                      y: (imageDimensions.height - size) / 2,
                      width: size,
                      height: size,
                    })
                  }}
                  className="btn-sm border border-gray-300 dark:border-gray-600 hover:border-primary-500"
                >
                  Circle
                </button>
              </div>
            </div>

            {/* Crop Controls */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  X Position
                </label>
                <input
                  type="number"
                  value={Math.round(cropArea.x)}
                  onChange={(e) =>
                    setCropArea({ ...cropArea, x: parseInt(e.target.value) || 0 })
                  }
                  className="input w-full"
                  min="0"
                  max={imageDimensions.width - cropArea.width}
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
                    setCropArea({ ...cropArea, y: parseInt(e.target.value) || 0 })
                  }
                  className="input w-full"
                  min="0"
                  max={imageDimensions.height - cropArea.height}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Width
                </label>
                <input
                  type="number"
                  value={Math.round(cropArea.width)}
                  onChange={(e) =>
                    setCropArea({ ...cropArea, width: parseInt(e.target.value) || 1 })
                  }
                  className="input w-full"
                  min="1"
                  max={imageDimensions.width}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Height
                </label>
                <input
                  type="number"
                  value={Math.round(cropArea.height)}
                  onChange={(e) =>
                    setCropArea({ ...cropArea, height: parseInt(e.target.value) || 1 })
                  }
                  className="input w-full"
                  min="1"
                  max={imageDimensions.height}
                />
              </div>
            </div>

            {/* Image Preview with Crop Overlay */}
            <div className="relative bg-gray-100 dark:bg-gray-800 rounded-lg p-4 overflow-auto">
              <div className="relative inline-block">
                <img
                  ref={imageRef}
                  src={image}
                  alt="Source"
                  className="max-w-full h-auto"
                  style={{ maxHeight: '500px' }}
                />
                {/* Crop Overlay */}
                <div
                  className="absolute border-2 border-primary-500 bg-primary-500/20"
                  style={{
                    left: `${(cropArea.x / imageDimensions.width) * 100}%`,
                    top: `${(cropArea.y / imageDimensions.height) * 100}%`,
                    width: `${(cropArea.width / imageDimensions.width) * 100}%`,
                    height: `${(cropArea.height / imageDimensions.height) * 100}%`,
                    cursor: 'move',
                  }}
                >
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                    {[...Array(9)].map((_, i) => (
                      <div
                        key={i}
                        className="border border-primary-400/50"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Crop Info */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Crop Area:</strong> {Math.round(cropArea.width)} × {Math.round(cropArea.height)} px
                {' | '}
                <strong>Position:</strong> ({Math.round(cropArea.x)}, {Math.round(cropArea.y)})
              </p>
            </div>

            {/* Crop Button */}
            <button
              onClick={cropImage}
              className="btn bg-accent-600 text-white hover:bg-accent-700 w-full"
            >
              ✂️ Crop Image
            </button>

            {/* Canvas (hidden) */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Cropped Result */}
            {croppedImage && (
              <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Cropped Image:
                </h3>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                  <img
                    src={croppedImage}
                    alt="Cropped"
                    className="max-w-full h-auto mx-auto rounded shadow-lg"
                  />
                </div>
                <button
                  onClick={downloadImage}
                  className="btn bg-success-600 text-white hover:bg-success-700 w-full"
                >
                  💾 Download Cropped Image
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="card bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800">
        <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-100 mb-3">
          💡 Cropping Tips
        </h3>
        <ul className="space-y-2 text-sm text-primary-800 dark:text-primary-200">
          <li>• Use aspect ratio presets for common social media dimensions</li>
          <li>• 1:1 is perfect for Instagram posts and profile pictures</li>
          <li>• 16:9 is ideal for YouTube thumbnails and widescreen displays</li>
          <li>• Adjust position and size manually for precise cropping</li>
          <li>• All processing happens locally - your images stay private</li>
        </ul>
      </div>
    </div>
  )
}

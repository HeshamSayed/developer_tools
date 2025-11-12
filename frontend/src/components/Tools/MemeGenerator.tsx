import { useState, useRef, useEffect } from 'react'

export default function MemeGenerator() {
  const [image, setImage] = useState<string | null>(null)
  const [topText, setTopText] = useState('')
  const [bottomText, setBottomText] = useState('')
  const [fontSize, setFontSize] = useState(48)
  const [textColor, setTextColor] = useState('#FFFFFF')
  const [strokeColor, setStrokeColor] = useState('#000000')
  const [generatedMeme, setGeneratedMeme] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setImage(event.target?.result as string)
        setGeneratedMeme(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const generateMeme = () => {
    if (!image || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height

      // Draw image
      ctx.drawImage(img, 0, 0)

      // Configure text
      ctx.font = `bold ${fontSize}px Impact, Arial Black, sans-serif`
      ctx.fillStyle = textColor
      ctx.strokeStyle = strokeColor
      ctx.lineWidth = fontSize / 20
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'

      // Draw top text
      if (topText) {
        const topY = fontSize / 2
        ctx.strokeText(topText.toUpperCase(), canvas.width / 2, topY)
        ctx.fillText(topText.toUpperCase(), canvas.width / 2, topY)
      }

      // Draw bottom text
      if (bottomText) {
        const bottomY = canvas.height - fontSize * 1.5
        ctx.strokeText(bottomText.toUpperCase(), canvas.width / 2, bottomY)
        ctx.fillText(bottomText.toUpperCase(), canvas.width / 2, bottomY)
      }

      setGeneratedMeme(canvas.toDataURL('image/png'))
    }
    img.src = image
  }

  useEffect(() => {
    if (image && (topText || bottomText)) {
      generateMeme()
    }
  }, [topText, bottomText, fontSize, textColor, strokeColor])

  const downloadMeme = () => {
    if (!generatedMeme) return
    const link = document.createElement('a')
    link.download = 'meme.png'
    link.href = generatedMeme
    link.click()
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">🎭 Meme Generator</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Create hilarious memes with custom text and images
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Controls */}
          <div className="space-y-6">
            {/* File Upload */}
            <div>
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

            {/* Popular Templates */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Or use a popular template:
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button className="btn-sm border border-gray-300 dark:border-gray-600 hover:border-primary-500">
                  Drake
                </button>
                <button className="btn-sm border border-gray-300 dark:border-gray-600 hover:border-primary-500">
                  Distracted BF
                </button>
                <button className="btn-sm border border-gray-300 dark:border-gray-600 hover:border-primary-500">
                  Two Buttons
                </button>
                <button className="btn-sm border border-gray-300 dark:border-gray-600 hover:border-primary-500">
                  Change My Mind
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Note: Templates not included - upload your own image
              </p>
            </div>

            {/* Text Inputs */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Top Text
                </label>
                <input
                  type="text"
                  value={topText}
                  onChange={(e) => setTopText(e.target.value)}
                  placeholder="WHEN YOU..."
                  className="input w-full"
                  maxLength={50}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bottom Text
                </label>
                <input
                  type="text"
                  value={bottomText}
                  onChange={(e) => setBottomText(e.target.value)}
                  placeholder="...FINALLY UNDERSTAND"
                  className="input w-full"
                  maxLength={50}
                />
              </div>
            </div>

            {/* Customization */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Customize:
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Font Size: {fontSize}px
                </label>
                <input
                  type="range"
                  min="24"
                  max="96"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Text Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="h-10 w-full cursor-pointer rounded border border-gray-300 dark:border-gray-600"
                    />
                    <span className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                      {textColor}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Outline Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={strokeColor}
                      onChange={(e) => setStrokeColor(e.target.value)}
                      className="h-10 w-full cursor-pointer rounded border border-gray-300 dark:border-gray-600"
                    />
                    <span className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                      {strokeColor}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {generatedMeme && (
              <button
                onClick={downloadMeme}
                className="btn bg-success-600 text-white hover:bg-success-700 w-full"
              >
                💾 Download Meme
              </button>
            )}
          </div>

          {/* Right Column - Preview */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Preview:
            </h3>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 min-h-[400px] flex items-center justify-center">
              {generatedMeme ? (
                <img
                  src={generatedMeme}
                  alt="Generated Meme"
                  className="max-w-full h-auto rounded shadow-lg"
                />
              ) : (
                <div className="text-center text-gray-400">
                  <svg
                    className="w-16 h-16 mx-auto mb-4 opacity-50"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-sm">Upload an image and add text to create your meme</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hidden Canvas */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Tips */}
      <div className="card bg-accent-50 dark:bg-accent-900/20 border-accent-200 dark:border-accent-800">
        <h3 className="text-lg font-semibold text-accent-900 dark:text-accent-100 mb-3 flex items-center gap-2">
          <span>💡</span> Pro Meme Tips
        </h3>
        <ul className="space-y-2 text-sm text-accent-800 dark:text-accent-200">
          <li>• Keep text short and punchy for maximum impact</li>
          <li>• White text with black outline is the classic meme style</li>
          <li>• ALL CAPS text is traditional for memes</li>
          <li>• Use high-quality images for best results</li>
          <li>• Images processed locally - no uploads to servers</li>
        </ul>
      </div>
    </div>
  )
}

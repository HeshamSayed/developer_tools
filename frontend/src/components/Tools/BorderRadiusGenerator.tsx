import { useState } from 'react'
import CopyButton from '@/components/Common/CopyButton'
import { useNotification } from '@/contexts/NotificationContext'

type Unit = 'px' | '%' | 'rem' | 'em'

export default function BorderRadiusGenerator() {
  const { showSuccess } = useNotification()

  const [topLeft, setTopLeft] = useState(20)
  const [topRight, setTopRight] = useState(20)
  const [bottomRight, setBottomRight] = useState(20)
  const [bottomLeft, setBottomLeft] = useState(20)
  const [unit, setUnit] = useState<Unit>('px')
  const [previewBg, setPreviewBg] = useState('#667eea')
  const [exportFormat, setExportFormat] = useState<'css' | 'tailwind' | 'scss'>('css')

  const borderRadius = `${topLeft}${unit} ${topRight}${unit} ${bottomRight}${unit} ${bottomLeft}${unit}`
  const borderRadiusShort = topLeft === topRight && topRight === bottomRight && bottomRight === bottomLeft
    ? `${topLeft}${unit}`
    : borderRadius

  const resetAll = () => {
    setTopLeft(0)
    setTopRight(0)
    setBottomRight(0)
    setBottomLeft(0)
    showSuccess('Reset all corners')
  }

  const setAll = (value: number) => {
    setTopLeft(value)
    setTopRight(value)
    setBottomRight(value)
    setBottomLeft(value)
  }

  const generateExportCode = () => {
    switch (exportFormat) {
      case 'css':
        return `border-radius: ${borderRadiusShort};`
      case 'tailwind':
        // Tailwind has limited border-radius utilities
        if (topLeft === topRight && topRight === bottomRight && bottomRight === bottomLeft) {
          if (topLeft === 0) return 'rounded-none'
          if (topLeft <= 4) return 'rounded-sm'
          if (topLeft <= 8) return 'rounded'
          if (topLeft <= 12) return 'rounded-md'
          if (topLeft <= 16) return 'rounded-lg'
          if (topLeft <= 24) return 'rounded-xl'
          if (topLeft <= 32) return 'rounded-2xl'
          if (topLeft <= 48) return 'rounded-3xl'
          if (unit === '%' && topLeft === 50) return 'rounded-full'
        }
        return `/* Tailwind doesn't support custom corners. Use custom CSS: */\n.custom-radius {\n  border-radius: ${borderRadiusShort};\n}`
      case 'scss':
        return `$border-radius: ${borderRadiusShort};

.element {
  border-radius: $border-radius;
}`
      default:
        return `border-radius: ${borderRadiusShort};`
    }
  }

  const presets = [
    { name: 'None', tl: 0, tr: 0, br: 0, bl: 0, unit: 'px' },
    { name: 'Subtle', tl: 4, tr: 4, br: 4, bl: 4, unit: 'px' },
    { name: 'Small', tl: 8, tr: 8, br: 8, bl: 8, unit: 'px' },
    { name: 'Medium', tl: 12, tr: 12, br: 12, bl: 12, unit: 'px' },
    { name: 'Large', tl: 16, tr: 16, br: 16, bl: 16, unit: 'px' },
    { name: 'XL', tl: 24, tr: 24, br: 24, bl: 24, unit: 'px' },
    { name: '2XL', tl: 32, tr: 32, br: 32, bl: 32, unit: 'px' },
    { name: '3XL', tl: 48, tr: 48, br: 48, bl: 48, unit: 'px' },
    { name: 'Circle', tl: 50, tr: 50, br: 50, bl: 50, unit: '%' },
    { name: 'Pill', tl: 999, tr: 999, br: 999, bl: 999, unit: 'px' },
    { name: 'Top Only', tl: 16, tr: 16, br: 0, bl: 0, unit: 'px' },
    { name: 'Bottom Only', tl: 0, tr: 0, br: 16, bl: 16, unit: 'px' },
    { name: 'Left Only', tl: 16, tr: 0, br: 0, bl: 16, unit: 'px' },
    { name: 'Right Only', tl: 0, tr: 16, br: 16, bl: 0, unit: 'px' },
    { name: 'Drop', tl: 50, tr: 50, br: 50, bl: 0, unit: '%' },
    { name: 'Leaf', tl: 0, tr: 50, br: 0, bl: 50, unit: '%' },
    { name: 'Bevel TL/BR', tl: 0, tr: 32, br: 0, bl: 32, unit: 'px' },
    { name: 'Bevel TR/BL', tl: 32, tr: 0, br: 32, bl: 0, unit: 'px' },
    { name: 'Squircle', tl: 30, tr: 30, br: 30, bl: 30, unit: '%' },
    { name: 'Organic 1', tl: 30, tr: 60, br: 30, bl: 60, unit: '%' },
    { name: 'Organic 2', tl: 60, tr: 30, br: 60, bl: 30, unit: '%' },
    { name: 'Blob 1', tl: 40, tr: 60, br: 40, bl: 70, unit: '%' },
    { name: 'Blob 2', tl: 70, tr: 40, br: 60, bl: 40, unit: '%' },
    { name: 'iOS Icon', tl: 22, tr: 22, br: 22, bl: 22, unit: '%' },
  ]

  const loadPreset = (preset: typeof presets[0]) => {
    setTopLeft(preset.tl)
    setTopRight(preset.tr)
    setBottomRight(preset.br)
    setBottomLeft(preset.bl)
    setUnit(preset.unit as Unit)
    showSuccess(`Loaded preset: ${preset.name}`)
  }

  const getMaxValue = () => {
    switch (unit) {
      case 'px': return 200
      case '%': return 50
      case 'rem': return 10
      case 'em': return 10
      default: return 200
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Controls */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Units</h3>
            <div className="grid grid-cols-4 gap-2">
              {(['px', '%', 'rem', 'em'] as Unit[]).map((u) => (
                <button
                  key={u}
                  onClick={() => setUnit(u)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    unit === u
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          <div className="card space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Corner Radius</h3>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Top Left ↖
                </label>
                <span className="text-sm text-gray-500 font-mono">{topLeft}{unit}</span>
              </div>
              <input
                type="range"
                min="0"
                max={getMaxValue()}
                value={topLeft}
                onChange={(e) => setTopLeft(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary-600"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Top Right ↗
                </label>
                <span className="text-sm text-gray-500 font-mono">{topRight}{unit}</span>
              </div>
              <input
                type="range"
                min="0"
                max={getMaxValue()}
                value={topRight}
                onChange={(e) => setTopRight(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary-600"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Bottom Right ↘
                </label>
                <span className="text-sm text-gray-500 font-mono">{bottomRight}{unit}</span>
              </div>
              <input
                type="range"
                min="0"
                max={getMaxValue()}
                value={bottomRight}
                onChange={(e) => setBottomRight(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary-600"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Bottom Left ↙
                </label>
                <span className="text-sm text-gray-500 font-mono">{bottomLeft}{unit}</span>
              </div>
              <input
                type="range"
                min="0"
                max={getMaxValue()}
                value={bottomLeft}
                onChange={(e) => setBottomLeft(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary-600"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={resetAll} className="btn-secondary flex-1">
                Reset All
              </button>
              <button onClick={() => setAll(16)} className="btn-primary flex-1">
                Round All
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Preview */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Live Preview</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Element Background
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={previewBg}
                  onChange={(e) => setPreviewBg(e.target.value)}
                  className="w-12 h-10 cursor-pointer rounded border border-gray-300 dark:border-gray-600"
                />
                <input
                  type="text"
                  value={previewBg}
                  onChange={(e) => setPreviewBg(e.target.value)}
                  className="input flex-1 font-mono text-sm"
                />
              </div>
            </div>

            <div className="w-full h-80 bg-gray-100 dark:bg-gray-800 rounded-lg p-8 flex items-center justify-center relative">
              <div
                className="w-64 h-64 shadow-xl relative"
                style={{
                  backgroundColor: previewBg,
                  borderTopLeftRadius: `${topLeft}${unit}`,
                  borderTopRightRadius: `${topRight}${unit}`,
                  borderBottomRightRadius: `${bottomRight}${unit}`,
                  borderBottomLeftRadius: `${bottomLeft}${unit}`,
                }}
              >
                {/* Corner Indicators */}
                <div className="absolute -top-2 -left-2 w-4 h-4 bg-primary-600 rounded-full border-2 border-white dark:border-gray-800" title="Top Left" />
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-accent-600 rounded-full border-2 border-white dark:border-gray-800" title="Top Right" />
                <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-success-600 rounded-full border-2 border-white dark:border-gray-800" title="Bottom Right" />
                <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-warning-600 rounded-full border-2 border-white dark:border-gray-800" title="Bottom Left" />

                {/* Center Info */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white drop-shadow-lg">
                    <p className="text-xs font-medium mb-1">Border Radius</p>
                    <p className="text-2xl font-bold">{borderRadiusShort}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Section */}
      <div className="card">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Export Code</h3>
          <div className="flex gap-2">
            {['css', 'tailwind', 'scss'].map((format) => (
              <button
                key={format}
                onClick={() => setExportFormat(format as typeof exportFormat)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  exportFormat === format
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {format.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Code</span>
            <CopyButton text={generateExportCode()} />
          </div>
          <pre className="text-sm text-gray-800 dark:text-gray-200 font-mono overflow-x-auto whitespace-pre-wrap">
            {generateExportCode()}
          </pre>
        </div>
      </div>

      {/* Presets */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Presets</h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {presets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => loadPreset(preset)}
              className="group relative p-3 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 hover:border-primary-500 transition-all hover:scale-105"
            >
              <div
                className="w-16 h-16 mx-auto mb-2 bg-gradient-to-br from-primary-500 to-accent-500"
                style={{
                  borderTopLeftRadius: `${preset.tl}${preset.unit}`,
                  borderTopRightRadius: `${preset.tr}${preset.unit}`,
                  borderBottomRightRadius: `${preset.br}${preset.unit}`,
                  borderBottomLeftRadius: `${preset.bl}${preset.unit}`,
                }}
              />
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center truncate">
                {preset.name}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Pro Tips
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Use 50% border-radius with equal width/height for perfect circles</li>
          <li>• Large radius values (999px) create pill shapes on rectangles</li>
          <li>• Rem units scale with root font size, better for accessibility</li>
          <li>• Asymmetric corners create organic, unique shapes</li>
          <li>• iOS-style icons use ~22% border-radius for the squircle effect</li>
        </ul>
      </div>
    </div>
  )
}

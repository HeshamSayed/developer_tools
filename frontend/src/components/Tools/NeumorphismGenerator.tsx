import { useState } from 'react'
import CopyButton from '@/components/Common/CopyButton'
import { useNotification } from '@/contexts/NotificationContext'

type NeumorphismType = 'flat' | 'concave' | 'convex' | 'pressed'

export default function NeumorphismGenerator() {
  const { showSuccess } = useNotification()

  const [color, setColor] = useState('#e0e0e0')
  const [distance, setDistance] = useState(10)
  const [intensity, setIntensity] = useState(0.15)
  const [blur, setBlur] = useState(20)
  const [radius, setRadius] = useState(20)
  const [type, setType] = useState<NeumorphismType>('flat')
  const [size, setSize] = useState(200)
  const [exportFormat, setExportFormat] = useState<'css' | 'scss'>('css')

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : { r: 224, g: 224, b: 224 }
  }

  const rgb = hexToRgb(color)
  const lighter = `rgb(${Math.min(rgb.r + 255 * intensity, 255)}, ${Math.min(rgb.g + 255 * intensity, 255)}, ${Math.min(rgb.b + 255 * intensity, 255)})`
  const darker = `rgb(${Math.max(rgb.r - 255 * intensity, 0)}, ${Math.max(rgb.g - 255 * intensity, 0)}, ${Math.max(rgb.b - 255 * intensity, 0)})`

  const getShadows = () => {
    switch (type) {
      case 'flat':
        return `${distance}px ${distance}px ${blur}px ${darker}, -${distance}px -${distance}px ${blur}px ${lighter}`
      case 'concave':
        return `inset ${distance}px ${distance}px ${blur}px ${darker}, inset -${distance}px -${distance}px ${blur}px ${lighter}`
      case 'convex':
        return `${distance}px ${distance}px ${blur}px ${darker}, -${distance}px -${distance}px ${blur}px ${lighter}, inset -1px -1px 2px ${lighter}, inset 1px 1px 2px ${darker}`
      case 'pressed':
        return `inset ${distance}px ${distance}px ${blur}px ${darker}, inset -${distance}px -${distance}px ${blur}px ${lighter}`
      default:
        return ''
    }
  }

  const boxShadow = getShadows()
  const neumorphismCSS = `background: ${color};\nbox-shadow: ${boxShadow};\nborder-radius: ${radius}px;`

  const generateExportCode = () => {
    switch (exportFormat) {
      case 'css':
        return `.neumorphic {\n  ${neumorphismCSS.split('\n').join('\n  ')}\n}`
      case 'scss':
        return `$neuro-color: ${color};\n$neuro-distance: ${distance}px;\n$neuro-blur: ${blur}px;\n$neuro-radius: ${radius}px;\n\n.neumorphic {\n  ${neumorphismCSS.split('\n').join('\n  ')}\n}`
      default:
        return neumorphismCSS
    }
  }

  const presets = [
    { name: 'Light Classic', color: '#e0e0e0', dist: 10, int: 0.15, blur: 20, radius: 20, type: 'flat' as NeumorphismType },
    { name: 'Soft White', color: '#f0f0f0', dist: 8, int: 0.12, blur: 16, radius: 16, type: 'flat' as NeumorphismType },
    { name: 'Pressed Button', color: '#e0e0e0', dist: 6, int: 0.15, blur: 12, radius: 12, type: 'pressed' as NeumorphismType },
    { name: 'Card Raised', color: '#e8e8e8', dist: 12, int: 0.18, blur: 24, radius: 16, type: 'flat' as NeumorphismType },
    { name: 'Input Field', color: '#e6e6e6', dist: 8, int: 0.14, blur: 16, radius: 8, type: 'concave' as NeumorphismType },
    { name: 'Toggle Switch', color: '#d5d5d5', dist: 6, int: 0.16, blur: 12, radius: 999, type: 'flat' as NeumorphismType },
    { name: 'Dark Mode', color: '#2d2d2d', dist: 10, int: 0.25, blur: 20, radius: 20, type: 'flat' as NeumorphismType },
    { name: 'Convex Button', color: '#e0e0e0', dist: 8, int: 0.15, blur: 16, radius: 12, type: 'convex' as NeumorphismType },
  ]

  const loadPreset = (preset: typeof presets[0]) => {
    setColor(preset.color)
    setDistance(preset.dist)
    setIntensity(preset.int)
    setBlur(preset.blur)
    setRadius(preset.radius)
    setType(preset.type)
    showSuccess(`Loaded preset: ${preset.name}`)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Controls */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Style Type</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'flat', label: 'Flat (Raised)', icon: '▢', desc: 'Raised surface' },
                { value: 'concave', label: 'Concave', icon: '⌄', desc: 'Sunken inward' },
                { value: 'convex', label: 'Convex', icon: '⌃', desc: 'Bulging outward' },
                { value: 'pressed', label: 'Pressed', icon: '▣', desc: 'Button pressed' },
              ].map((t) => (
                <button
                  key={t.value}
                  onClick={() => setType(t.value as NeumorphismType)}
                  className={`px-3 py-2 rounded-lg transition-all text-sm font-medium ${
                    type === t.value
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                  title={t.desc}
                >
                  <span className="text-lg mr-1">{t.icon}</span>
                  <span className="text-xs">{t.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="card space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Neumorphic Properties</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Background Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-12 h-10 cursor-pointer rounded border border-gray-300 dark:border-gray-600"
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="input flex-1 font-mono text-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Shadow Distance
                </label>
                <span className="text-sm text-gray-500 font-mono">{distance}px</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                value={distance}
                onChange={(e) => setDistance(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary-600"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Shadow Intensity
                </label>
                <span className="text-sm text-gray-500 font-mono">{Math.round(intensity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.4"
                step="0.01"
                value={intensity}
                onChange={(e) => setIntensity(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary-600"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Blur Radius
                </label>
                <span className="text-sm text-gray-500 font-mono">{blur}px</span>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                value={blur}
                onChange={(e) => setBlur(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary-600"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Border Radius
                </label>
                <span className="text-sm text-gray-500 font-mono">{radius}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary-600"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Element Size
                </label>
                <span className="text-sm text-gray-500 font-mono">{size}px</span>
              </div>
              <input
                type="range"
                min="100"
                max="300"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary-600"
              />
            </div>
          </div>
        </div>

        {/* Right Column - Preview */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Live Preview</h3>
            <div
              className="w-full h-96 rounded-lg p-8 flex items-center justify-center"
              style={{ background: color }}
            >
              <div
                className="flex items-center justify-center transition-all"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  background: color,
                  boxShadow,
                  borderRadius: `${radius}px`,
                }}
              >
                <svg className="w-12 h-12 opacity-30" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
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
            {['css', 'scss'].map((format) => (
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
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Style Presets</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {presets.map((preset) => {
            const presetRgb = hexToRgb(preset.color)
            const presetLighter = `rgb(${Math.min(presetRgb.r + 255 * preset.int, 255)}, ${Math.min(presetRgb.g + 255 * preset.int, 255)}, ${Math.min(presetRgb.b + 255 * preset.int, 255)})`
            const presetDarker = `rgb(${Math.max(presetRgb.r - 255 * preset.int, 0)}, ${Math.max(presetRgb.g - 255 * preset.int, 0)}, ${Math.max(presetRgb.b - 255 * preset.int, 0)})`
            const presetShadow = preset.type === 'flat'
              ? `${preset.dist}px ${preset.dist}px ${preset.blur}px ${presetDarker}, -${preset.dist}px -${preset.dist}px ${preset.blur}px ${presetLighter}`
              : `inset ${preset.dist}px ${preset.dist}px ${preset.blur}px ${presetDarker}, inset -${preset.dist}px -${preset.dist}px ${preset.blur}px ${presetLighter}`

            return (
              <button
                key={preset.name}
                onClick={() => loadPreset(preset)}
                className="p-4 rounded-lg transition-all hover:scale-105"
                style={{ background: preset.color }}
              >
                <div
                  className="w-16 h-16 mx-auto mb-2 rounded-lg"
                  style={{
                    background: preset.color,
                    boxShadow: presetShadow,
                    borderRadius: `${preset.radius}px`,
                  }}
                />
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">
                  {preset.name}
                </p>
              </button>
            )
          })}
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
          <li>• Neumorphism works best with soft, muted colors (grays, pastels)</li>
          <li>• Background color should match the page background for best effect</li>
          <li>• Use 'flat' for raised buttons, 'pressed' for active state</li>
          <li>• Keep shadow distance subtle (8-12px) for realistic depth</li>
          <li>• Intensity between 12-18% creates the most natural effect</li>
          <li>• Avoid high contrast colors - neumorphism needs subtle lighting</li>
        </ul>
      </div>
    </div>
  )
}

import { useState } from 'react'
import CopyButton from '@/components/Common/CopyButton'
import { useNotification } from '@/contexts/NotificationContext'

type Direction = 'up' | 'down' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
type TriangleType = 'isosceles' | 'right-angled' | 'equilateral'

export default function CSSTriangleGenerator() {
  const { showNotification } = useNotification()

  const [direction, setDirection] = useState<Direction>('up')
  const [triangleType, setTriangleType] = useState<TriangleType>('isosceles')
  const [width, setWidth] = useState(100)
  const [height, setHeight] = useState(100)
  const [color, setColor] = useState('#3b82f6')
  const [exportFormat, setExportFormat] = useState<'css' | 'scss'>('css')

  const getTriangleCSS = (): { css: string; style: React.CSSProperties; explanation: string } => {
    const w = width
    const h = height

    // For equilateral triangles, adjust dimensions
    const isEquilateral = triangleType === 'equilateral'
    const adjustedH = isEquilateral ? (w * Math.sqrt(3)) / 2 : h

    switch (direction) {
      case 'up':
        return {
          css: `width: 0;\nheight: 0;\nborder-left: ${w / 2}px solid transparent;\nborder-right: ${w / 2}px solid transparent;\nborder-bottom: ${adjustedH}px solid ${color};`,
          style: {
            width: 0,
            height: 0,
            borderLeft: `${w / 2}px solid transparent`,
            borderRight: `${w / 2}px solid transparent`,
            borderBottom: `${adjustedH}px solid ${color}`,
          },
          explanation: 'Pointing upward by using a bottom border with transparent left/right borders'
        }
      case 'down':
        return {
          css: `width: 0;\nheight: 0;\nborder-left: ${w / 2}px solid transparent;\nborder-right: ${w / 2}px solid transparent;\nborder-top: ${adjustedH}px solid ${color};`,
          style: {
            width: 0,
            height: 0,
            borderLeft: `${w / 2}px solid transparent`,
            borderRight: `${w / 2}px solid transparent`,
            borderTop: `${adjustedH}px solid ${color}`,
          },
          explanation: 'Pointing downward by using a top border with transparent left/right borders'
        }
      case 'left':
        return {
          css: `width: 0;\nheight: 0;\nborder-top: ${h / 2}px solid transparent;\nborder-bottom: ${h / 2}px solid transparent;\nborder-right: ${w}px solid ${color};`,
          style: {
            width: 0,
            height: 0,
            borderTop: `${h / 2}px solid transparent`,
            borderBottom: `${h / 2}px solid transparent`,
            borderRight: `${w}px solid ${color}`,
          },
          explanation: 'Pointing left by using a right border with transparent top/bottom borders'
        }
      case 'right':
        return {
          css: `width: 0;\nheight: 0;\nborder-top: ${h / 2}px solid transparent;\nborder-bottom: ${h / 2}px solid transparent;\nborder-left: ${w}px solid ${color};`,
          style: {
            width: 0,
            height: 0,
            borderTop: `${h / 2}px solid transparent`,
            borderBottom: `${h / 2}px solid transparent`,
            borderLeft: `${w}px solid ${color}`,
          },
          explanation: 'Pointing right by using a left border with transparent top/bottom borders'
        }
      case 'top-left':
        return {
          css: `width: 0;\nheight: 0;\nborder-top: ${h}px solid ${color};\nborder-right: ${w}px solid transparent;`,
          style: {
            width: 0,
            height: 0,
            borderTop: `${h}px solid ${color}`,
            borderRight: `${w}px solid transparent`,
          },
          explanation: 'Top-left corner triangle using top border and transparent right border'
        }
      case 'top-right':
        return {
          css: `width: 0;\nheight: 0;\nborder-top: ${h}px solid ${color};\nborder-left: ${w}px solid transparent;`,
          style: {
            width: 0,
            height: 0,
            borderTop: `${h}px solid ${color}`,
            borderLeft: `${w}px solid transparent`,
          },
          explanation: 'Top-right corner triangle using top border and transparent left border'
        }
      case 'bottom-left':
        return {
          css: `width: 0;\nheight: 0;\nborder-bottom: ${h}px solid ${color};\nborder-right: ${w}px solid transparent;`,
          style: {
            width: 0,
            height: 0,
            borderBottom: `${h}px solid ${color}`,
            borderRight: `${w}px solid transparent`,
          },
          explanation: 'Bottom-left corner triangle using bottom border and transparent right border'
        }
      case 'bottom-right':
        return {
          css: `width: 0;\nheight: 0;\nborder-bottom: ${h}px solid ${color};\nborder-left: ${w}px solid transparent;`,
          style: {
            width: 0,
            height: 0,
            borderBottom: `${h}px solid ${color}`,
            borderLeft: `${w}px solid transparent`,
          },
          explanation: 'Bottom-right corner triangle using bottom border and transparent left border'
        }
    }
  }

  const { css, style, explanation } = getTriangleCSS()

  const generateExportCode = () => {
    switch (exportFormat) {
      case 'css':
        return `.triangle {\n  ${css.split('\n').join('\n  ')}\n}`
      case 'scss':
        return `$triangle-color: ${color};\n$triangle-width: ${width}px;\n$triangle-height: ${height}px;\n\n.triangle {\n  ${css.split('\n').join('\n  ')}\n}`
      default:
        return css
    }
  }

  const presets = [
    { name: 'Dropdown Arrow', dir: 'down' as Direction, w: 12, h: 8, color: '#6b7280' },
    { name: 'Tooltip Up', dir: 'up' as Direction, w: 16, h: 10, color: '#1f2937' },
    { name: 'Menu Chevron', dir: 'right' as Direction, w: 8, h: 12, color: '#3b82f6' },
    { name: 'Back Arrow', dir: 'left' as Direction, w: 12, h: 16, color: '#3b82f6' },
    { name: 'Ribbon Corner', dir: 'top-right' as Direction, w: 60, h: 60, color: '#ef4444' },
    { name: 'Folded Corner', dir: 'bottom-right' as Direction, w: 40, h: 40, color: '#94a3b8' },
    { name: 'Play Button', dir: 'right' as Direction, w: 60, h: 80, color: '#22c55e' },
    { name: 'Large Up', dir: 'up' as Direction, w: 120, h: 100, color: '#8b5cf6' },
  ]

  const loadPreset = (preset: typeof presets[0]) => {
    setDirection(preset.dir)
    setWidth(preset.w)
    setHeight(preset.h)
    setColor(preset.color)
    showNotification(`Loaded preset: ${preset.name}`, 'success')
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Controls */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Triangle Type</h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'isosceles', label: 'Isosceles', icon: '▲' },
                { value: 'right-angled', label: 'Right-Angled', icon: '◢' },
                { value: 'equilateral', label: 'Equilateral', icon: '△' },
              ].map((type) => (
                <button
                  key={type.value}
                  onClick={() => setTriangleType(type.value as TriangleType)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    triangleType === type.value
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                  title={type.label}
                >
                  <span className="text-lg mr-1">{type.icon}</span>
                  <span className="text-xs">{type.label.split('-')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Direction</h3>
            <div className="grid grid-cols-4 gap-2">
              {/* Cardinal directions */}
              {(['up', 'down', 'left', 'right'] as Direction[]).map((dir) => (
                <button
                  key={dir}
                  onClick={() => setDirection(dir)}
                  className={`px-3 py-2 rounded-lg transition-all capitalize text-sm font-medium ${
                    direction === dir
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {dir === 'up' && '↑'}
                  {dir === 'down' && '↓'}
                  {dir === 'left' && '←'}
                  {dir === 'right' && '→'}
                  <span className="ml-1 text-xs">{dir}</span>
                </button>
              ))}
            </div>

            {triangleType === 'right-angled' && (
              <div className="mt-3">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Corner Triangles</p>
                <div className="grid grid-cols-4 gap-2">
                  {(['top-left', 'top-right', 'bottom-left', 'bottom-right'] as Direction[]).map((dir) => (
                    <button
                      key={dir}
                      onClick={() => setDirection(dir)}
                      className={`px-2 py-2 rounded-lg transition-all text-xs font-medium ${
                        direction === dir
                          ? 'bg-accent-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {dir === 'top-left' && '◤'}
                      {dir === 'top-right' && '◥'}
                      {dir === 'bottom-left' && '◣'}
                      {dir === 'bottom-right' && '◢'}
                      <span className="block text-[10px] mt-0.5">{dir.replace('-', ' ')}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="card space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Dimensions</h3>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Width
                </label>
                <span className="text-sm text-gray-500 font-mono">{width}px</span>
              </div>
              <input
                type="range"
                min="10"
                max="300"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary-600"
              />
            </div>

            {triangleType !== 'equilateral' && (
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Height
                  </label>
                  <span className="text-sm text-gray-500 font-mono">{height}px</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="300"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary-600"
                />
              </div>
            )}

            {triangleType === 'equilateral' && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  Height automatically calculated: {Math.round((width * Math.sqrt(3)) / 2)}px
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Color
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
          </div>
        </div>

        {/* Right Column - Preview */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Live Preview</h3>
            <div className="w-full h-96 bg-gray-100 dark:bg-gray-800 rounded-lg p-8 flex items-center justify-center relative">
              <div style={style} />

              {/* Grid background for reference */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 19px, #000 19px, #000 20px), repeating-linear-gradient(90deg, transparent, transparent 19px, #000 19px, #000 20px)',
                backgroundSize: '20px 20px'
              }} />
            </div>

            {/* Explanation */}
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                <span className="font-semibold">How it works:</span> {explanation}
              </p>
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
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Common Use Cases</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 gap-3">
          {presets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => loadPreset(preset)}
              className="group relative p-4 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 hover:border-primary-500 transition-all hover:scale-105"
            >
              <div className="h-16 flex items-center justify-center mb-2">
                <div
                  style={{
                    width: 0,
                    height: 0,
                    ...(() => {
                      const w = preset.w
                      const h = preset.h
                      const c = preset.color
                      switch (preset.dir) {
                        case 'up':
                          return { borderLeft: `${w/2}px solid transparent`, borderRight: `${w/2}px solid transparent`, borderBottom: `${h}px solid ${c}` }
                        case 'down':
                          return { borderLeft: `${w/2}px solid transparent`, borderRight: `${w/2}px solid transparent`, borderTop: `${h}px solid ${c}` }
                        case 'left':
                          return { borderTop: `${h/2}px solid transparent`, borderBottom: `${h/2}px solid transparent`, borderRight: `${w}px solid ${c}` }
                        case 'right':
                          return { borderTop: `${h/2}px solid transparent`, borderBottom: `${h/2}px solid transparent`, borderLeft: `${w}px solid ${c}` }
                        case 'top-left':
                          return { borderTop: `${h}px solid ${c}`, borderRight: `${w}px solid transparent` }
                        case 'top-right':
                          return { borderTop: `${h}px solid ${c}`, borderLeft: `${w}px solid transparent` }
                        case 'bottom-left':
                          return { borderBottom: `${h}px solid ${c}`, borderRight: `${w}px solid transparent` }
                        case 'bottom-right':
                          return { borderBottom: `${h}px solid ${c}`, borderLeft: `${w}px solid transparent` }
                      }
                    })()
                  }}
                />
              </div>
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">
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
          <li>• CSS triangles work by setting width/height to 0 and using colored borders</li>
          <li>• Use transparent borders on opposite sides to create the triangle effect</li>
          <li>• Perfect for dropdown arrows, tooltips, ribbons, and decorative elements</li>
          <li>• Corner triangles are great for folded paper effects and badges</li>
          <li>• Combine with pseudo-elements (::before, ::after) for complex shapes</li>
        </ul>
      </div>
    </div>
  )
}

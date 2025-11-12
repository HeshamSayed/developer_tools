import { useState } from 'react'
import CopyButton from '@/components/Common/CopyButton'

export default function NeumorphismGenerator() {
  const [color, setColor] = useState('#e0e0e0')
  const [distance, setDistance] = useState(10)
  const [intensity, setIntensity] = useState(0.15)
  const [blur, setBlur] = useState(20)
  const [radius, setRadius] = useState(20)
  const [type, setType] = useState<'flat' | 'concave' | 'convex' | 'pressed'>('flat')

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 224, g: 224, b: 224 }
  }

  const rgb = hexToRgb(color)
  const lighter = `rgb(${Math.min(rgb.r + 255 * intensity, 255)}, ${Math.min(
    rgb.g + 255 * intensity,
    255
  )}, ${Math.min(rgb.b + 255 * intensity, 255)})`
  const darker = `rgb(${Math.max(rgb.r - 255 * intensity, 0)}, ${Math.max(
    rgb.g - 255 * intensity,
    0
  )}, ${Math.max(rgb.b - 255 * intensity, 0)})`

  const getShadows = () => {
    switch (type) {
      case 'flat':
        return `${distance}px ${distance}px ${blur}px ${darker}, -${distance}px -${distance}px ${blur}px ${lighter}`
      case 'concave':
        return `inset ${distance}px ${distance}px ${blur}px ${darker}, inset -${distance}px -${distance}px ${blur}px ${lighter}`
      case 'convex':
        return `${distance}px ${distance}px ${blur}px ${darker}, -${distance}px -${distance}px ${blur}px ${lighter}, inset -2px -2px 4px ${lighter}`
      case 'pressed':
        return `inset ${distance}px ${distance}px ${blur}px ${darker}, inset -${distance}px -${distance}px ${blur}px ${lighter}`
      default:
        return ''
    }
  }

  const boxShadow = getShadows()
  const neumorphismCSS = `background: ${color};
box-shadow: ${boxShadow};
border-radius: ${radius}px;`

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Style Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['flat', 'concave', 'convex', 'pressed'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`px-4 py-2 rounded-lg transition-colors capitalize ${
                    type === t
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Background Color
            </label>
            <div className="flex gap-3">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-16 h-10 cursor-pointer rounded border border-gray-300 dark:border-gray-600"
              />
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="input flex-1 font-mono"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Shadow Distance
              </label>
              <span className="text-sm text-gray-500">{distance}px</span>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              value={distance}
              onChange={(e) => setDistance(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Shadow Intensity
              </label>
              <span className="text-sm text-gray-500">{Math.round(intensity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.4"
              step="0.01"
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Blur
              </label>
              <span className="text-sm text-gray-500">{blur}px</span>
            </div>
            <input
              type="range"
              min="5"
              max="60"
              value={blur}
              onChange={(e) => setBlur(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Border Radius
              </label>
              <span className="text-sm text-gray-500">{radius}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Preview
          </label>
          <div
            className="w-full h-full min-h-[300px] rounded-lg p-8 flex items-center justify-center"
            style={{ backgroundColor: color }}
          >
            <div
              className="w-48 h-48 flex items-center justify-center"
              style={{
                background: color,
                boxShadow,
                borderRadius: `${radius}px`,
              }}
            >
              <div className="text-gray-600 dark:text-gray-400 font-semibold">
                Neumorphic
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">CSS Code</span>
          <CopyButton text={neumorphismCSS} />
        </div>
        <pre className="text-sm text-gray-800 dark:text-gray-200 font-mono whitespace-pre-wrap">
          {neumorphismCSS}
        </pre>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2 text-sm">Color Presets</h4>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {[
            { name: 'Light', color: '#e0e0e0' },
            { name: 'Blue', color: '#d1e8ff' },
            { name: 'Green', color: '#d4edda' },
            { name: 'Purple', color: '#e2d9f3' },
            { name: 'Pink', color: '#f8d7da' },
            { name: 'Yellow', color: '#fff3cd' },
          ].map((preset) => (
            <button
              key={preset.name}
              onClick={() => setColor(preset.color)}
              className="px-3 py-2 rounded text-sm font-medium border border-gray-300 dark:border-gray-600 hover:border-primary-500 transition-colors"
              style={{ backgroundColor: preset.color }}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

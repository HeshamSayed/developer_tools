import { useState } from 'react'
import CopyButton from '@/components/Common/CopyButton'

export default function BoxShadowGenerator() {
  const [horizontal, setHorizontal] = useState(0)
  const [vertical, setVertical] = useState(4)
  const [blur, setBlur] = useState(6)
  const [spread, setSpread] = useState(0)
  const [color, setColor] = useState('#000000')
  const [opacity, setOpacity] = useState(0.1)
  const [inset, setInset] = useState(false)

  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  const shadowColor = hexToRgba(color, opacity)
  const boxShadow = `${inset ? 'inset ' : ''}${horizontal}px ${vertical}px ${blur}px ${spread}px ${shadowColor}`

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Horizontal Offset
              </label>
              <span className="text-sm text-gray-500">{horizontal}px</span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              value={horizontal}
              onChange={(e) => setHorizontal(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Vertical Offset
              </label>
              <span className="text-sm text-gray-500">{vertical}px</span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              value={vertical}
              onChange={(e) => setVertical(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Blur Radius
              </label>
              <span className="text-sm text-gray-500">{blur}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={blur}
              onChange={(e) => setBlur(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Spread Radius
              </label>
              <span className="text-sm text-gray-500">{spread}px</span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              value={spread}
              onChange={(e) => setSpread(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Opacity
              </label>
              <span className="text-sm text-gray-500">{Math.round(opacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Shadow Color
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

          <div className="flex items-center">
            <input
              type="checkbox"
              id="inset"
              checked={inset}
              onChange={(e) => setInset(e.target.checked)}
              className="w-4 h-4 text-primary-600 rounded"
            />
            <label htmlFor="inset" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Inset Shadow
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Preview
          </label>
          <div className="w-full h-full min-h-[300px] bg-gray-100 dark:bg-gray-800 rounded-lg p-8 flex items-center justify-center">
            <div
              className="w-48 h-48 bg-white dark:bg-gray-700 rounded-lg"
              style={{ boxShadow }}
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">CSS Code</span>
          <CopyButton text={`box-shadow: ${boxShadow};`} />
        </div>
        <pre className="text-sm text-gray-800 dark:text-gray-200 font-mono">
          box-shadow: {boxShadow};
        </pre>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2 text-sm">Presets</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {[
            { name: 'Subtle', h: 0, v: 1, b: 3, s: 0, o: 0.12 },
            { name: 'Medium', h: 0, v: 4, b: 6, s: -1, o: 0.1 },
            { name: 'Large', h: 0, v: 10, b: 15, s: -3, o: 0.1 },
            { name: 'Extra Large', h: 0, v: 20, b: 25, s: -5, o: 0.1 },
            { name: 'Inner', h: 0, v: 2, b: 4, s: 0, o: 0.06, inset: true },
            { name: 'Lifted', h: 0, v: 16, b: 32, s: -4, o: 0.12 },
          ].map((preset) => (
            <button
              key={preset.name}
              onClick={() => {
                setHorizontal(preset.h)
                setVertical(preset.v)
                setBlur(preset.b)
                setSpread(preset.s)
                setOpacity(preset.o)
                setInset(preset.inset || false)
              }}
              className="btn btn-secondary text-left text-sm"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

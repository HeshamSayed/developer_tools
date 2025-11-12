import { useState } from 'react'
import CopyButton from '@/components/Common/CopyButton'

export default function BorderRadiusGenerator() {
  const [topLeft, setTopLeft] = useState(20)
  const [topRight, setTopRight] = useState(20)
  const [bottomRight, setBottomRight] = useState(20)
  const [bottomLeft, setBottomLeft] = useState(20)
  const [unit, setUnit] = useState<'px' | '%'>('px')

  const borderRadius = `${topLeft}${unit} ${topRight}${unit} ${bottomRight}${unit} ${bottomLeft}${unit}`

  const resetAll = () => {
    setTopLeft(0)
    setTopRight(0)
    setBottomRight(0)
    setBottomLeft(0)
  }

  const setAll = (value: number) => {
    setTopLeft(value)
    setTopRight(value)
    setBottomRight(value)
    setBottomLeft(value)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setUnit('px')}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                unit === 'px'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Pixels (px)
            </button>
            <button
              onClick={() => setUnit('%')}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                unit === '%'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Percent (%)
            </button>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Top Left
              </label>
              <span className="text-sm text-gray-500">{topLeft}{unit}</span>
            </div>
            <input
              type="range"
              min="0"
              max={unit === 'px' ? '200' : '50'}
              value={topLeft}
              onChange={(e) => setTopLeft(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Top Right
              </label>
              <span className="text-sm text-gray-500">{topRight}{unit}</span>
            </div>
            <input
              type="range"
              min="0"
              max={unit === 'px' ? '200' : '50'}
              value={topRight}
              onChange={(e) => setTopRight(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Bottom Right
              </label>
              <span className="text-sm text-gray-500">{bottomRight}{unit}</span>
            </div>
            <input
              type="range"
              min="0"
              max={unit === 'px' ? '200' : '50'}
              value={bottomRight}
              onChange={(e) => setBottomRight(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Bottom Left
              </label>
              <span className="text-sm text-gray-500">{bottomLeft}{unit}</span>
            </div>
            <input
              type="range"
              min="0"
              max={unit === 'px' ? '200' : '50'}
              value={bottomLeft}
              onChange={(e) => setBottomLeft(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="flex gap-2">
            <button onClick={resetAll} className="btn btn-secondary flex-1">
              Reset All
            </button>
            <button onClick={() => setAll(20)} className="btn btn-secondary flex-1">
              Round All
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Preview
          </label>
          <div className="w-full h-full min-h-[300px] bg-gray-100 dark:bg-gray-800 rounded-lg p-8 flex items-center justify-center">
            <div
              className="w-48 h-48 bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg"
              style={{
                borderTopLeftRadius: `${topLeft}${unit}`,
                borderTopRightRadius: `${topRight}${unit}`,
                borderBottomRightRadius: `${bottomRight}${unit}`,
                borderBottomLeftRadius: `${bottomLeft}${unit}`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">CSS Code</span>
          <CopyButton text={`border-radius: ${borderRadius};`} />
        </div>
        <pre className="text-sm text-gray-800 dark:text-gray-200 font-mono">
          border-radius: {borderRadius};
        </pre>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2 text-sm">Quick Shapes</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { name: 'Square', tl: 0, tr: 0, br: 0, bl: 0 },
            { name: 'Rounded', tl: 12, tr: 12, br: 12, bl: 12 },
            { name: 'Circle', tl: 50, tr: 50, br: 50, bl: 50, unit: '%' as const },
            { name: 'Pill Left', tl: 100, tr: 0, br: 0, bl: 100 },
            { name: 'Pill Right', tl: 0, tr: 100, br: 100, bl: 0 },
            { name: 'Drop', tl: 50, tr: 50, br: 50, bl: 0, unit: '%' as const },
            { name: 'Leaf', tl: 0, tr: 50, br: 0, bl: 50, unit: '%' as const },
            { name: 'Bevel', tl: 0, tr: 30, br: 0, bl: 30 },
          ].map((preset) => (
            <button
              key={preset.name}
              onClick={() => {
                setTopLeft(preset.tl)
                setTopRight(preset.tr)
                setBottomRight(preset.br)
                setBottomLeft(preset.bl)
                if (preset.unit) setUnit(preset.unit)
              }}
              className="btn btn-secondary text-sm"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

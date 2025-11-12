import { useState } from 'react'
import CopyButton from '@/components/Common/CopyButton'

export default function GradientGenerator() {
  const [color1, setColor1] = useState('#667eea')
  const [color2, setColor2] = useState('#764ba2')
  const [angle, setAngle] = useState(135)
  const [type, setType] = useState<'linear' | 'radial'>('linear')

  const gradientCSS = type === 'linear'
    ? `background: linear-gradient(${angle}deg, ${color1}, ${color2});`
    : `background: radial-gradient(circle, ${color1}, ${color2});`

  const gradientStyle = type === 'linear'
    ? { background: `linear-gradient(${angle}deg, ${color1}, ${color2})` }
    : { background: `radial-gradient(circle, ${color1}, ${color2})` }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Gradient Type
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setType('linear')}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                  type === 'linear'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Linear
              </button>
              <button
                onClick={() => setType('radial')}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                  type === 'radial'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Radial
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Color 1
            </label>
            <div className="flex gap-3">
              <input
                type="color"
                value={color1}
                onChange={(e) => setColor1(e.target.value)}
                className="w-16 h-10 cursor-pointer rounded border border-gray-300 dark:border-gray-600"
              />
              <input
                type="text"
                value={color1}
                onChange={(e) => setColor1(e.target.value)}
                className="input flex-1 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Color 2
            </label>
            <div className="flex gap-3">
              <input
                type="color"
                value={color2}
                onChange={(e) => setColor2(e.target.value)}
                className="w-16 h-10 cursor-pointer rounded border border-gray-300 dark:border-gray-600"
              />
              <input
                type="text"
                value={color2}
                onChange={(e) => setColor2(e.target.value)}
                className="input flex-1 font-mono"
              />
            </div>
          </div>

          {type === 'linear' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Angle: {angle}°
              </label>
              <input
                type="range"
                min="0"
                max="360"
                value={angle}
                onChange={(e) => setAngle(Number(e.target.value))}
                className="w-full"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Preview
          </label>
          <div
            className="w-full h-64 rounded-lg border-2 border-gray-200 dark:border-gray-700 shadow-lg"
            style={gradientStyle}
          />
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">CSS Code</span>
          <CopyButton text={gradientCSS} />
        </div>
        <pre className="text-sm text-gray-800 dark:text-gray-200 font-mono overflow-x-auto">
          {gradientCSS}
        </pre>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2 text-sm">Quick Presets</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { name: 'Purple', c1: '#667eea', c2: '#764ba2' },
            { name: 'Sunset', c1: '#ff6b6b', c2: '#feca57' },
            { name: 'Ocean', c1: '#0066ff', c2: '#00ccff' },
            { name: 'Forest', c1: '#134e5e', c2: '#71b280' },
            { name: 'Fire', c1: '#f12711', c2: '#f5af19' },
            { name: 'Ice', c1: '#d3cce3', c2: '#e9e4f0' },
            { name: 'Candy', c1: '#ff0844', c2: '#ffb199' },
            { name: 'Sky', c1: '#667db6', c2: '#0082c8' },
          ].map((preset) => (
            <button
              key={preset.name}
              onClick={() => {
                setColor1(preset.c1)
                setColor2(preset.c2)
              }}
              className="px-3 py-2 rounded text-sm font-medium bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:border-primary-500 transition-colors"
              style={{
                background: `linear-gradient(135deg, ${preset.c1}, ${preset.c2})`,
                color: 'white',
                textShadow: '0 1px 2px rgba(0,0,0,0.5)',
              }}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

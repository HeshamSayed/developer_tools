import { useState } from 'react'
import CopyButton from '@/components/Common/CopyButton'

export default function GlassmorphismGenerator() {
  const [blur, setBlur] = useState(10)
  const [transparency, setTransparency] = useState(0.25)
  const [saturation, setSaturation] = useState(1.8)
  const [borderOpacity, setBorderOpacity] = useState(0.18)
  const [backgroundColor, setBackgroundColor] = useState('#ffffff')

  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  const bgColor = hexToRgba(backgroundColor, transparency)
  const borderColor = hexToRgba(backgroundColor, borderOpacity)

  const glassCSS = `background: ${bgColor};
backdrop-filter: blur(${blur}px) saturate(${saturation * 100}%);
-webkit-backdrop-filter: blur(${blur}px) saturate(${saturation * 100}%);
border-radius: 12px;
border: 1px solid ${borderColor};`

  const glassStyle = {
    background: bgColor,
    backdropFilter: `blur(${blur}px) saturate(${saturation * 100}%)`,
    WebkitBackdropFilter: `blur(${blur}px) saturate(${saturation * 100}%)`,
    borderRadius: '12px',
    border: `1px solid ${borderColor}`,
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Blur
              </label>
              <span className="text-sm text-gray-500">{blur}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              value={blur}
              onChange={(e) => setBlur(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Transparency
              </label>
              <span className="text-sm text-gray-500">{Math.round(transparency * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={transparency}
              onChange={(e) => setTransparency(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Saturation
              </label>
              <span className="text-sm text-gray-500">{Math.round(saturation * 100)}%</span>
            </div>
            <input
              type="range"
              min="1"
              max="3"
              step="0.1"
              value={saturation}
              onChange={(e) => setSaturation(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Border Opacity
              </label>
              <span className="text-sm text-gray-500">{Math.round(borderOpacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={borderOpacity}
              onChange={(e) => setBorderOpacity(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Background Color
            </label>
            <div className="flex gap-3">
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-16 h-10 cursor-pointer rounded border border-gray-300 dark:border-gray-600"
              />
              <input
                type="text"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="input flex-1 font-mono"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Preview
          </label>
          <div
            className="w-full h-full min-h-[300px] rounded-lg p-8 flex items-center justify-center relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            <div
              className="w-64 h-64 p-6 flex items-center justify-center text-center"
              style={glassStyle}
            >
              <div className="text-white">
                <h3 className="text-xl font-bold mb-2">Glassmorphism</h3>
                <p className="text-sm opacity-90">Beautiful frosted glass effect</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">CSS Code</span>
          <CopyButton text={glassCSS} />
        </div>
        <pre className="text-sm text-gray-800 dark:text-gray-200 font-mono whitespace-pre-wrap">
          {glassCSS}
        </pre>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2 text-sm">Presets</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { name: 'Light', b: 10, t: 0.25, s: 1.8, bo: 0.18 },
            { name: 'Strong', b: 16, t: 0.45, s: 2.0, bo: 0.3 },
            { name: 'Subtle', b: 6, t: 0.15, s: 1.5, bo: 0.1 },
            { name: 'Heavy', b: 24, t: 0.6, s: 2.2, bo: 0.4 },
          ].map((preset) => (
            <button
              key={preset.name}
              onClick={() => {
                setBlur(preset.b)
                setTransparency(preset.t)
                setSaturation(preset.s)
                setBorderOpacity(preset.bo)
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

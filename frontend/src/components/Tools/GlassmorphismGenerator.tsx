import { useState } from 'react'
import CopyButton from '@/components/Common/CopyButton'
import { useNotification } from '@/contexts/NotificationContext'

export default function GlassmorphismGenerator() {
  const { showSuccess } = useNotification()

  const [blur, setBlur] = useState(10)
  const [transparency, setTransparency] = useState(0.25)
  const [saturation, setSaturation] = useState(1.8)
  const [borderOpacity, setBorderOpacity] = useState(0.18)
  const [borderRadius, setBorderRadius] = useState(12)
  const [shadow, setShadow] = useState(20)
  const [backgroundColor, setBackgroundColor] = useState('#ffffff')
  const [exportFormat, setExportFormat] = useState<'css' | 'tailwind' | 'scss'>('css')

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
border-radius: ${borderRadius}px;
border: 1px solid ${borderColor};
box-shadow: 0 8px 32px 0 rgba(0, 0, 0, ${shadow / 100});`

  const glassStyle = {
    background: bgColor,
    backdropFilter: `blur(${blur}px) saturate(${saturation * 100}%)`,
    WebkitBackdropFilter: `blur(${blur}px) saturate(${saturation * 100}%)`,
    borderRadius: `${borderRadius}px`,
    border: `1px solid ${borderColor}`,
    boxShadow: `0 8px 32px 0 rgba(0, 0, 0, ${shadow / 100})`,
  }

  const generateExportCode = () => {
    switch (exportFormat) {
      case 'css':
        return `.glass {\n  ${glassCSS.split('\n').join('\n  ')}\n}`
      case 'tailwind':
        return `/* Tailwind requires custom CSS for glassmorphism */\n.glass {\n  ${glassCSS.split('\n').join('\n  ')}\n}\n\n/* Add to tailwind.config.js utilities */`
      case 'scss':
        return `$glass-blur: ${blur}px;\n$glass-transparency: ${transparency};\n$glass-saturation: ${saturation * 100}%;\n\n.glass {\n  ${glassCSS.split('\n').join('\n  ')}\n}`
      default:
        return glassCSS
    }
  }

  const presets = [
    { name: 'Classic Light', blur: 10, trans: 0.25, sat: 1.8, border: 0.18, bg: '#ffffff', radius: 12, shadow: 20 },
    { name: 'Subtle White', blur: 5, trans: 0.15, sat: 1.5, border: 0.1, bg: '#ffffff', radius: 16, shadow: 15 },
    { name: 'Frosted', blur: 16, trans: 0.3, sat: 2.0, border: 0.2, bg: '#f0f0f0', radius: 20, shadow: 25 },
    { name: 'Blue Tint', blur: 12, trans: 0.2, sat: 1.9, border: 0.15, bg: '#e0f2fe', radius: 12, shadow: 18 },
    { name: 'Purple Glow', blur: 14, trans: 0.22, sat: 2.2, border: 0.25, bg: '#f3e8ff', radius: 16, shadow: 22 },
    { name: 'Dark Mode', blur: 8, trans: 0.1, sat: 1.6, border: 0.1, bg: '#1f2937', radius: 12, shadow: 30 },
    { name: 'Heavy Blur', blur: 25, trans: 0.35, sat: 2.5, border: 0.3, bg: '#ffffff', radius: 20, shadow: 28 },
    { name: 'macOS Style', blur: 20, trans: 0.28, sat: 1.8, border: 0.2, bg: '#f5f5f7', radius: 14, shadow: 20 },
  ]

  const loadPreset = (preset: typeof presets[0]) => {
    setBlur(preset.blur)
    setTransparency(preset.trans)
    setSaturation(preset.sat)
    setBorderOpacity(preset.border)
    setBackgroundColor(preset.bg)
    setBorderRadius(preset.radius)
    setShadow(preset.shadow)
    showSuccess(`Loaded preset: ${preset.name}`)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Controls */}
        <div className="space-y-4">
          <div className="card space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Glass Properties</h3>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Blur
                </label>
                <span className="text-sm text-gray-500 font-mono">{blur}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                value={blur}
                onChange={(e) => setBlur(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary-600"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Transparency
                </label>
                <span className="text-sm text-gray-500 font-mono">{Math.round(transparency * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={transparency}
                onChange={(e) => setTransparency(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary-600"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Saturation
                </label>
                <span className="text-sm text-gray-500 font-mono">{Math.round(saturation * 100)}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={saturation}
                onChange={(e) => setSaturation(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary-600"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Border Opacity
                </label>
                <span className="text-sm text-gray-500 font-mono">{Math.round(borderOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={borderOpacity}
                onChange={(e) => setBorderOpacity(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary-600"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Border Radius
                </label>
                <span className="text-sm text-gray-500 font-mono">{borderRadius}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                value={borderRadius}
                onChange={(e) => setBorderRadius(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary-600"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Shadow Intensity
                </label>
                <span className="text-sm text-gray-500 font-mono">{shadow}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={shadow}
                onChange={(e) => setShadow(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Background Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-12 h-10 cursor-pointer rounded border border-gray-300 dark:border-gray-600"
                />
                <input
                  type="text"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
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
            <div
              className="w-full h-96 rounded-lg p-8 flex items-center justify-center relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              {/* Colorful background elements */}
              <div className="absolute top-10 left-10 w-32 h-32 bg-pink-400 rounded-full opacity-60"></div>
              <div className="absolute bottom-10 right-10 w-40 h-40 bg-blue-400 rounded-full opacity-60"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-purple-400 rounded-full opacity-40"></div>

              {/* Glass card */}
              <div
                className="relative w-64 h-48 p-6 flex flex-col justify-center items-center text-white"
                style={glassStyle}
              >
                <svg className="w-12 h-12 mb-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
                <h4 className="text-lg font-bold mb-1">Glassmorphism</h4>
                <p className="text-xs text-center opacity-90">Frosted glass effect</p>
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
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Style Presets</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {presets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => loadPreset(preset)}
              className="group relative p-4 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 overflow-hidden transition-all hover:scale-105"
            >
              <div
                className="absolute inset-2 rounded-lg"
                style={{
                  background: hexToRgba(preset.bg, preset.trans),
                  backdropFilter: `blur(${preset.blur}px) saturate(${preset.sat * 100}%)`,
                  WebkitBackdropFilter: `blur(${preset.blur}px) saturate(${preset.sat * 100}%)`,
                  border: `1px solid ${hexToRgba(preset.bg, preset.border)}`,
                }}
              />
              <p className="relative text-xs font-medium text-white text-center z-10 drop-shadow-lg">
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
          <li>• Use backdrop-filter for the frosted glass effect (requires colorful background)</li>
          <li>• Keep transparency between 20-35% for best readability</li>
          <li>• Higher saturation enhances colors behind the glass</li>
          <li>• Add subtle borders for definition and depth</li>
          <li>• Works best with colorful gradients or images behind it</li>
          <li>• Note: Limited browser support for backdrop-filter (check caniuse.com)</li>
        </ul>
      </div>
    </div>
  )
}

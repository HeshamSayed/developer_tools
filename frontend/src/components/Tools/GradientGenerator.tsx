import { useState, useEffect } from 'react'
import CopyButton from '@/components/Common/CopyButton'
import { useNotification } from '@/contexts/NotificationContext'

interface ColorStop {
  id: string
  color: string
  position: number
}

type GradientType = 'linear' | 'radial' | 'conic' | 'repeating-linear' | 'repeating-radial'
type RadialShape = 'circle' | 'ellipse'
type RadialPosition = 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top left' | 'top right' | 'bottom left' | 'bottom right'

export default function GradientGenerator() {
  const { showNotification } = useNotification()

  const [colorStops, setColorStops] = useState<ColorStop[]>([
    { id: '1', color: '#667eea', position: 0 },
    { id: '2', color: '#764ba2', position: 100 },
  ])

  const [type, setType] = useState<GradientType>('linear')
  const [angle, setAngle] = useState(135)
  const [radialShape, setRadialShape] = useState<RadialShape>('circle')
  const [radialPosition, setRadialPosition] = useState<RadialPosition>('center')
  const [exportFormat, setExportFormat] = useState<'css' | 'tailwind' | 'scss'>('css')
  const [history, setHistory] = useState<string[]>([])

  // Generate CSS string
  const generateCSS = () => {
    const sortedStops = [...colorStops].sort((a, b) => a.position - b.position)
    const stopsString = sortedStops.map(stop => `${stop.color} ${stop.position}%`).join(', ')

    switch (type) {
      case 'linear':
        return `background: linear-gradient(${angle}deg, ${stopsString});`
      case 'radial':
        return `background: radial-gradient(${radialShape} at ${radialPosition}, ${stopsString});`
      case 'conic':
        return `background: conic-gradient(from ${angle}deg at ${radialPosition}, ${stopsString});`
      case 'repeating-linear':
        return `background: repeating-linear-gradient(${angle}deg, ${stopsString});`
      case 'repeating-radial':
        return `background: repeating-radial-gradient(${radialShape} at ${radialPosition}, ${stopsString});`
      default:
        return ''
    }
  }

  const gradientCSS = generateCSS()

  // Generate style object for preview
  const generateStyle = () => {
    const sortedStops = [...colorStops].sort((a, b) => a.position - b.position)
    const stopsString = sortedStops.map(stop => `${stop.color} ${stop.position}%`).join(', ')

    switch (type) {
      case 'linear':
        return { background: `linear-gradient(${angle}deg, ${stopsString})` }
      case 'radial':
        return { background: `radial-gradient(${radialShape} at ${radialPosition}, ${stopsString})` }
      case 'conic':
        return { background: `conic-gradient(from ${angle}deg at ${radialPosition}, ${stopsString})` }
      case 'repeating-linear':
        return { background: `repeating-linear-gradient(${angle}deg, ${stopsString})` }
      case 'repeating-radial':
        return { background: `repeating-radial-gradient(${radialShape} at ${radialPosition}, ${stopsString})` }
      default:
        return {}
    }
  }

  // Generate export code based on format
  const generateExportCode = () => {
    const sortedStops = [...colorStops].sort((a, b) => a.position - b.position)

    switch (exportFormat) {
      case 'css':
        return gradientCSS
      case 'tailwind':
        // Tailwind doesn't support complex gradients, so we provide the closest equivalent
        if (colorStops.length === 2) {
          const color1Class = colorStops[0].color
          const color2Class = colorStops[1].color
          return `bg-gradient-to-r from-[${color1Class}] to-[${color2Class}]`
        }
        return `/* Tailwind doesn't support ${colorStops.length} color stops natively. Use CSS instead: */\n${gradientCSS}`
      case 'scss':
        return `$gradient: ${gradientCSS.replace('background: ', '').replace(';', '')};

.my-gradient {
  background: $gradient;
}`
      default:
        return gradientCSS
    }
  }

  // Add color stop
  const addColorStop = () => {
    if (colorStops.length >= 10) {
      showNotification('Maximum 10 color stops allowed', 'warning')
      return
    }

    const newPosition = colorStops.length > 0
      ? Math.max(...colorStops.map(s => s.position)) + 10
      : 50

    setColorStops([
      ...colorStops,
      {
        id: Date.now().toString(),
        color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'),
        position: Math.min(newPosition, 100),
      },
    ])
  }

  // Remove color stop
  const removeColorStop = (id: string) => {
    if (colorStops.length <= 2) {
      showNotification('Minimum 2 color stops required', 'warning')
      return
    }
    setColorStops(colorStops.filter(stop => stop.id !== id))
  }

  // Update color stop
  const updateColorStop = (id: string, field: 'color' | 'position', value: string | number) => {
    setColorStops(colorStops.map(stop =>
      stop.id === id ? { ...stop, [field]: value } : stop
    ))
  }

  // Generate random gradient
  const generateRandom = () => {
    const randomType: GradientType = ['linear', 'radial', 'conic'][Math.floor(Math.random() * 3)] as GradientType
    const numStops = Math.floor(Math.random() * 3) + 2 // 2-4 stops
    const newStops: ColorStop[] = []

    for (let i = 0; i < numStops; i++) {
      newStops.push({
        id: `${Date.now()}-${i}`,
        color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'),
        position: (i * (100 / (numStops - 1))),
      })
    }

    setType(randomType)
    setColorStops(newStops)
    setAngle(Math.floor(Math.random() * 360))
    showNotification('Random gradient generated!', 'success')
  }

  // Save to history
  const saveToHistory = () => {
    const newHistory = [gradientCSS, ...history.filter(h => h !== gradientCSS)].slice(0, 10)
    setHistory(newHistory)
    showNotification('Saved to history', 'success')
  }

  // Load from history
  const loadFromHistory = (cssCode: string) => {
    try {
      // Basic parsing - this is simplified
      showNotification('History loaded (manual adjustment may be needed)', 'info')
    } catch (error) {
      showNotification('Could not load from history', 'error')
    }
  }

  // Preset gradients
  const presets = [
    { name: 'Purple Dream', stops: [{ color: '#667eea', pos: 0 }, { color: '#764ba2', pos: 100 }] },
    { name: 'Sunset Glow', stops: [{ color: '#ff6b6b', pos: 0 }, { color: '#feca57', pos: 100 }] },
    { name: 'Ocean Blue', stops: [{ color: '#0066ff', pos: 0 }, { color: '#00ccff', pos: 100 }] },
    { name: 'Forest Green', stops: [{ color: '#134e5e', pos: 0 }, { color: '#71b280', pos: 100 }] },
    { name: 'Fire Blaze', stops: [{ color: '#f12711', pos: 0 }, { color: '#f5af19', pos: 100 }] },
    { name: 'Ice Cold', stops: [{ color: '#d3cce3', pos: 0 }, { color: '#e9e4f0', pos: 100 }] },
    { name: 'Cotton Candy', stops: [{ color: '#ff0844', pos: 0 }, { color: '#ffb199', pos: 100 }] },
    { name: 'Clear Sky', stops: [{ color: '#667db6', pos: 0 }, { color: '#0082c8', pos: 100 }] },
    { name: 'Lush', stops: [{ color: '#56ab2f', pos: 0 }, { color: '#a8e063', pos: 100 }] },
    { name: 'Aurora', stops: [{ color: '#00c6ff', pos: 0 }, { color: '#0072ff', pos: 50 }, { color: '#5e00ff', pos: 100 }] },
    { name: 'Peach', stops: [{ color: '#ed4264', pos: 0 }, { color: '#ffedbc', pos: 100 }] },
    { name: 'Mojito', stops: [{ color: '#1d976c', pos: 0 }, { color: '#93f9b9', pos: 100 }] },
  ]

  const loadPreset = (preset: typeof presets[0]) => {
    setColorStops(preset.stops.map((s, i) => ({
      id: `preset-${i}`,
      color: s.color,
      position: s.pos,
    })))
    showNotification(`Loaded preset: ${preset.name}`, 'success')
  }

  return (
    <div className="space-y-6">
      {/* Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Type & Settings */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Gradient Type</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'linear', label: 'Linear', icon: '→' },
                { value: 'radial', label: 'Radial', icon: '◉' },
                { value: 'conic', label: 'Conic', icon: '◐' },
                { value: 'repeating-linear', label: 'Repeat Linear', icon: '↔' },
                { value: 'repeating-radial', label: 'Repeat Radial', icon: '⊙' },
              ].map((t) => (
                <button
                  key={t.value}
                  onClick={() => setType(t.value as GradientType)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    type === t.value
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="mr-1">{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Angle Control (for linear, conic, repeating-linear) */}
          {(type === 'linear' || type === 'conic' || type === 'repeating-linear') && (
            <div className="card">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Angle: {angle}°
              </label>
              <input
                type="range"
                min="0"
                max="360"
                value={angle}
                onChange={(e) => setAngle(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary-600"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>0°</span>
                <span>90°</span>
                <span>180°</span>
                <span>270°</span>
                <span>360°</span>
              </div>
            </div>
          )}

          {/* Radial Controls */}
          {(type === 'radial' || type === 'repeating-radial') && (
            <div className="card space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Shape
                </label>
                <div className="flex gap-2">
                  {['circle', 'ellipse'].map((shape) => (
                    <button
                      key={shape}
                      onClick={() => setRadialShape(shape as RadialShape)}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        radialShape === shape
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {shape.charAt(0).toUpperCase() + shape.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Position
                </label>
                <select
                  value={radialPosition}
                  onChange={(e) => setRadialPosition(e.target.value as RadialPosition)}
                  className="input w-full"
                >
                  <option value="center">Center</option>
                  <option value="top">Top</option>
                  <option value="bottom">Bottom</option>
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                  <option value="top left">Top Left</option>
                  <option value="top right">Top Right</option>
                  <option value="bottom left">Bottom Left</option>
                  <option value="bottom right">Bottom Right</option>
                </select>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="card space-y-2">
            <button
              onClick={generateRandom}
              className="btn-primary w-full justify-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Random Gradient
            </button>
            <button
              onClick={saveToHistory}
              className="btn-secondary w-full justify-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              Save to History
            </button>
          </div>
        </div>

        {/* Middle Column - Color Stops */}
        <div className="space-y-4">
          <div className="card">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Color Stops</h3>
              <button
                onClick={addColorStop}
                className="btn-primary text-sm py-1"
                disabled={colorStops.length >= 10}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Stop
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {colorStops.map((stop) => (
                <div key={stop.id} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <input
                    type="color"
                    value={stop.color}
                    onChange={(e) => updateColorStop(stop.id, 'color', e.target.value)}
                    className="w-12 h-12 cursor-pointer rounded border border-gray-300 dark:border-gray-600"
                  />
                  <div className="flex-1 space-y-1">
                    <input
                      type="text"
                      value={stop.color}
                      onChange={(e) => updateColorStop(stop.id, 'color', e.target.value)}
                      className="input w-full text-sm font-mono"
                      placeholder="#000000"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={stop.position}
                        onChange={(e) => updateColorStop(stop.id, 'position', Number(e.target.value))}
                        className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary-600"
                      />
                      <span className="text-xs text-gray-600 dark:text-gray-400 w-10 text-right">
                        {stop.position}%
                      </span>
                    </div>
                  </div>
                  {colorStops.length > 2 && (
                    <button
                      onClick={() => removeColorStop(stop.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Preview */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Live Preview</h3>
            <div
              className="w-full h-64 rounded-lg border-2 border-gray-200 dark:border-gray-700 shadow-lg"
              style={generateStyle()}
            />
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
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Popular Presets</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {presets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => loadPreset(preset)}
              className="group relative px-3 py-8 rounded-lg text-sm font-medium transition-all hover:scale-105 hover:shadow-lg overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${preset.stops.map(s => `${s.color} ${s.pos}%`).join(', ')})`,
              }}
            >
              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity"></div>
              <span className="relative text-white text-xs font-semibold drop-shadow-lg">
                {preset.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent History</h3>
          <div className="space-y-2">
            {history.map((css, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div
                  className="w-16 h-16 rounded border-2 border-gray-200 dark:border-gray-600 flex-shrink-0"
                  style={{ background: css.replace('background: ', '').replace(';', '') }}
                />
                <code className="flex-1 text-xs text-gray-600 dark:text-gray-400 font-mono truncate">
                  {css}
                </code>
                <CopyButton text={css} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Pro Tips
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Use 2-4 color stops for best results and performance</li>
          <li>• Conic gradients work great for loading spinners and pie charts</li>
          <li>• Repeating gradients are perfect for background patterns</li>
          <li>• Adjust color positions for more control over the gradient transition</li>
          <li>• Save your favorite gradients to history for quick access</li>
        </ul>
      </div>
    </div>
  )
}

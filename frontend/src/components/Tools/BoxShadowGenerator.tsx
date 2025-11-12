import { useState } from 'react'
import CopyButton from '@/components/Common/CopyButton'
import { useNotification } from '@/contexts/NotificationContext'

interface Shadow {
  id: string
  horizontal: number
  vertical: number
  blur: number
  spread: number
  color: string
  opacity: number
  inset: boolean
}

interface PresetShadow {
  horizontal: number
  vertical: number
  blur: number
  spread: number
  opacity: number
  inset?: boolean
  color?: string
}

type PreviewShape = 'rectangle' | 'circle' | 'rounded'
type ExportFormat = 'css' | 'tailwind' | 'scss'

export default function BoxShadowGenerator() {
  const { showSuccess } = useNotification()

  const [shadows, setShadows] = useState<Shadow[]>([
    {
      id: '1',
      horizontal: 0,
      vertical: 4,
      blur: 6,
      spread: 0,
      color: '#000000',
      opacity: 0.1,
      inset: false,
    },
  ])

  const [activeShadowId, setActiveShadowId] = useState('1')
  const [previewShape, setPreviewShape] = useState<PreviewShape>('rectangle')
  const [previewBg, setPreviewBg] = useState('#ffffff')
  const [exportFormat, setExportFormat] = useState<ExportFormat>('css')

  // Get active shadow
  const activeShadow = shadows.find(s => s.id === activeShadowId) || shadows[0]

  // Convert hex to rgba
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  // Generate CSS box-shadow string
  const generateBoxShadow = () => {
    return shadows.map(shadow => {
      const shadowColor = hexToRgba(shadow.color, shadow.opacity)
      return `${shadow.inset ? 'inset ' : ''}${shadow.horizontal}px ${shadow.vertical}px ${shadow.blur}px ${shadow.spread}px ${shadowColor}`
    }).join(', ')
  }

  const boxShadow = generateBoxShadow()

  // Generate export code
  const generateExportCode = () => {
    switch (exportFormat) {
      case 'css':
        return `box-shadow: ${boxShadow};`
      case 'tailwind':
        // Tailwind doesn't support complex multi-shadows easily
        if (shadows.length === 1 && shadows[0].inset === false) {
          return `/* Use Tailwind's built-in shadow utilities or custom class: */
.custom-shadow {
  box-shadow: ${boxShadow};
}`
        }
        return `/* Tailwind doesn't support multiple shadows natively. Use custom CSS: */
.custom-shadow {
  box-shadow: ${boxShadow};
}`
      case 'scss':
        return `$box-shadow: ${boxShadow};

.element {
  box-shadow: $box-shadow;
}`
      default:
        return `box-shadow: ${boxShadow};`
    }
  }

  // Update active shadow
  const updateShadow = (field: keyof Shadow, value: any) => {
    setShadows(shadows.map(shadow =>
      shadow.id === activeShadowId ? { ...shadow, [field]: value } : shadow
    ))
  }

  // Add new shadow
  const addShadow = () => {
    if (shadows.length >= 5) {
      showSuccess('Maximum 5 shadow layers allowed')
      return
    }

    const newShadow: Shadow = {
      id: Date.now().toString(),
      horizontal: 0,
      vertical: 0,
      blur: 10,
      spread: 0,
      color: '#000000',
      opacity: 0.1,
      inset: false,
    }

    setShadows([...shadows, newShadow])
    setActiveShadowId(newShadow.id)
    showSuccess('Shadow layer added')
  }

  // Remove shadow
  const removeShadow = (id: string) => {
    if (shadows.length <= 1) {
      showSuccess('At least one shadow layer is required')
      return
    }

    const newShadows = shadows.filter(s => s.id !== id)
    setShadows(newShadows)

    if (activeShadowId === id) {
      setActiveShadowId(newShadows[0].id)
    }

    showSuccess('Shadow layer removed')
  }

  // Duplicate shadow
  const duplicateShadow = (id: string) => {
    if (shadows.length >= 5) {
      showSuccess('Maximum 5 shadow layers allowed')
      return
    }

    const shadowToDuplicate = shadows.find(s => s.id === id)
    if (!shadowToDuplicate) return

    const newShadow: Shadow = {
      ...shadowToDuplicate,
      id: Date.now().toString(),
    }

    setShadows([...shadows, newShadow])
    setActiveShadowId(newShadow.id)
    showSuccess('Shadow layer duplicated')
  }

  // Load preset
  const loadPreset = (preset: { name: string, shadows: Partial<Shadow>[] }) => {
    const newShadows: Shadow[] = preset.shadows.map((s, i) => ({
      id: `preset-${i}`,
      horizontal: s.horizontal || 0,
      vertical: s.vertical || 0,
      blur: s.blur || 0,
      spread: s.spread || 0,
      color: s.color || '#000000',
      opacity: s.opacity || 0.1,
      inset: s.inset || false,
    }))

    setShadows(newShadows)
    setActiveShadowId(newShadows[0].id)
    showSuccess(`Loaded preset: ${preset.name}`)
  }

  // Presets - Material Design, Tailwind, Custom
  const presets: { name: string; shadows: PresetShadow[] }[] = [
    {
      name: 'Material - Elevation 1',
      shadows: [
        { horizontal: 0, vertical: 2, blur: 1, spread: -1, opacity: 0.2 },
        { horizontal: 0, vertical: 1, blur: 1, spread: 0, opacity: 0.14 },
        { horizontal: 0, vertical: 1, blur: 3, spread: 0, opacity: 0.12 },
      ],
    },
    {
      name: 'Material - Elevation 2',
      shadows: [
        { horizontal: 0, vertical: 3, blur: 1, spread: -2, opacity: 0.2 },
        { horizontal: 0, vertical: 2, blur: 2, spread: 0, opacity: 0.14 },
        { horizontal: 0, vertical: 1, blur: 5, spread: 0, opacity: 0.12 },
      ],
    },
    {
      name: 'Material - Elevation 3',
      shadows: [
        { horizontal: 0, vertical: 3, blur: 3, spread: -2, opacity: 0.2 },
        { horizontal: 0, vertical: 3, blur: 4, spread: 0, opacity: 0.14 },
        { horizontal: 0, vertical: 1, blur: 8, spread: 0, opacity: 0.12 },
      ],
    },
    {
      name: 'Material - Elevation 4',
      shadows: [
        { horizontal: 0, vertical: 2, blur: 4, spread: -1, opacity: 0.2 },
        { horizontal: 0, vertical: 4, blur: 5, spread: 0, opacity: 0.14 },
        { horizontal: 0, vertical: 1, blur: 10, spread: 0, opacity: 0.12 },
      ],
    },
    {
      name: 'Tailwind - sm',
      shadows: [{ horizontal: 0, vertical: 1, blur: 2, spread: 0, opacity: 0.05 }],
    },
    {
      name: 'Tailwind - md',
      shadows: [
        { horizontal: 0, vertical: 4, blur: 6, spread: -1, opacity: 0.1 },
        { horizontal: 0, vertical: 2, blur: 4, spread: -2, opacity: 0.1 },
      ],
    },
    {
      name: 'Tailwind - lg',
      shadows: [
        { horizontal: 0, vertical: 10, blur: 15, spread: -3, opacity: 0.1 },
        { horizontal: 0, vertical: 4, blur: 6, spread: -4, opacity: 0.1 },
      ],
    },
    {
      name: 'Tailwind - xl',
      shadows: [
        { horizontal: 0, vertical: 20, blur: 25, spread: -5, opacity: 0.1 },
        { horizontal: 0, vertical: 8, blur: 10, spread: -6, opacity: 0.1 },
      ],
    },
    {
      name: 'Tailwind - 2xl',
      shadows: [{ horizontal: 0, vertical: 25, blur: 50, spread: -12, opacity: 0.25 }],
    },
    {
      name: 'Soft Inner',
      shadows: [{ horizontal: 0, vertical: 2, blur: 4, spread: 0, opacity: 0.06, inset: true }],
    },
    {
      name: 'Neumorphism Light',
      shadows: [
        { horizontal: 8, vertical: 8, blur: 16, spread: 0, color: '#d1d9e6', opacity: 1 },
        { horizontal: -8, vertical: -8, blur: 16, spread: 0, color: '#ffffff', opacity: 1 },
      ],
    },
    {
      name: 'Neumorphism Pressed',
      shadows: [
        { horizontal: 4, vertical: 4, blur: 8, spread: 0, color: '#d1d9e6', opacity: 1, inset: true },
        { horizontal: -4, vertical: -4, blur: 8, spread: 0, color: '#ffffff', opacity: 1, inset: true },
      ],
    },
    {
      name: 'Neon Glow',
      shadows: [
        { horizontal: 0, vertical: 0, blur: 10, spread: 0, color: '#00ffff', opacity: 0.8 },
        { horizontal: 0, vertical: 0, blur: 20, spread: 0, color: '#00ffff', opacity: 0.4 },
        { horizontal: 0, vertical: 0, blur: 40, spread: 0, color: '#00ffff', opacity: 0.2 },
      ],
    },
    {
      name: 'Lifted Card',
      shadows: [
        { horizontal: 0, vertical: 16, blur: 32, spread: -4, opacity: 0.12 },
        { horizontal: 0, vertical: 8, blur: 16, spread: -8, opacity: 0.08 },
      ],
    },
    {
      name: 'Sharp Accent',
      shadows: [{ horizontal: 6, vertical: 6, blur: 0, spread: 0, color: '#3b82f6', opacity: 1 }],
    },
    {
      name: 'Brutal',
      shadows: [{ horizontal: 8, vertical: 8, blur: 0, spread: 0, color: '#000000', opacity: 1 }],
    },
  ]

  // Shape styles
  const getShapeClass = () => {
    switch (previewShape) {
      case 'circle':
        return 'rounded-full'
      case 'rounded':
        return 'rounded-2xl'
      default:
        return 'rounded-lg'
    }
  }

  return (
    <div className="space-y-6">
      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Shadow Layers */}
        <div className="space-y-4">
          <div className="card">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Shadow Layers</h3>
              <button
                onClick={addShadow}
                className="btn-primary text-sm py-1"
                disabled={shadows.length >= 5}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Layer
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {shadows.map((shadow, index) => (
                <div
                  key={shadow.id}
                  className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                    activeShadowId === shadow.id
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => setActiveShadowId(shadow.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded border"
                        style={{ boxShadow: `${shadow.inset ? 'inset ' : ''}${shadow.horizontal}px ${shadow.vertical}px ${shadow.blur}px ${shadow.spread}px ${hexToRgba(shadow.color, shadow.opacity)}` }}
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Layer {index + 1} {shadow.inset && '(Inset)'}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          duplicateShadow(shadow.id)
                        }}
                        className="p-1 text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                        title="Duplicate"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                      {shadows.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            removeShadow(shadow.id)
                          }}
                          className="p-1 text-red-600 hover:text-red-700 dark:text-red-400"
                          title="Remove"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-mono truncate">
                    {shadow.horizontal}px {shadow.vertical}px {shadow.blur}px {shadow.spread}px
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Middle Column - Controls */}
        <div className="space-y-4">
          <div className="card space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              Layer {shadows.findIndex(s => s.id === activeShadowId) + 1} Controls
            </h3>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Horizontal
                </label>
                <span className="text-sm text-gray-500">{activeShadow.horizontal}px</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={activeShadow.horizontal}
                onChange={(e) => updateShadow('horizontal', Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary-600"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Vertical
                </label>
                <span className="text-sm text-gray-500">{activeShadow.vertical}px</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={activeShadow.vertical}
                onChange={(e) => updateShadow('vertical', Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary-600"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Blur
                </label>
                <span className="text-sm text-gray-500">{activeShadow.blur}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={activeShadow.blur}
                onChange={(e) => updateShadow('blur', Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary-600"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Spread
                </label>
                <span className="text-sm text-gray-500">{activeShadow.spread}px</span>
              </div>
              <input
                type="range"
                min="-50"
                max="50"
                value={activeShadow.spread}
                onChange={(e) => updateShadow('spread', Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary-600"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Opacity
                </label>
                <span className="text-sm text-gray-500">{Math.round(activeShadow.opacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={activeShadow.opacity}
                onChange={(e) => updateShadow('opacity', Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Color
              </label>
              <div className="flex gap-3">
                <input
                  type="color"
                  value={activeShadow.color}
                  onChange={(e) => updateShadow('color', e.target.value)}
                  className="w-16 h-10 cursor-pointer rounded border border-gray-300 dark:border-gray-600"
                />
                <input
                  type="text"
                  value={activeShadow.color}
                  onChange={(e) => updateShadow('color', e.target.value)}
                  className="input flex-1 font-mono"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="inset"
                checked={activeShadow.inset}
                onChange={(e) => updateShadow('inset', e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded"
              />
              <label htmlFor="inset" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Inset Shadow
              </label>
            </div>
          </div>
        </div>

        {/* Right Column - Preview */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Live Preview</h3>

            {/* Preview Controls */}
            <div className="mb-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Shape
                </label>
                <div className="flex gap-2">
                  {[
                    { value: 'rectangle', label: '▭', title: 'Rectangle' },
                    { value: 'rounded', label: '▢', title: 'Rounded' },
                    { value: 'circle', label: '●', title: 'Circle' },
                  ].map((shape) => (
                    <button
                      key={shape.value}
                      onClick={() => setPreviewShape(shape.value as PreviewShape)}
                      className={`flex-1 px-3 py-2 rounded text-lg transition-all ${
                        previewShape === shape.value
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }`}
                      title={shape.title}
                    >
                      {shape.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
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
            </div>

            {/* Preview Box */}
            <div className="w-full h-64 bg-gray-100 dark:bg-gray-800 rounded-lg p-8 flex items-center justify-center">
              <div
                className={`w-40 h-40 ${getShapeClass()}`}
                style={{
                  boxShadow,
                  backgroundColor: previewBg,
                }}
              />
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
                onClick={() => setExportFormat(format as ExportFormat)}
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
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Professional Presets</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {presets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => loadPreset(preset)}
              className="group relative p-4 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 hover:border-primary-500 transition-all hover:scale-105"
            >
              <div
                className="w-16 h-16 mx-auto mb-2 bg-white dark:bg-gray-700 rounded"
                style={{
                  boxShadow: preset.shadows.map(s =>
                    `${s.inset ? 'inset ' : ''}${s.horizontal}px ${s.vertical}px ${s.blur}px ${s.spread}px ${hexToRgba(s.color || '#000000', s.opacity || 0.1)}`
                  ).join(', '),
                }}
              />
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
          <li>• Layer multiple shadows for depth and realism</li>
          <li>• Use inset shadows to create pressed or carved effects</li>
          <li>• Negative spread values create tighter, more focused shadows</li>
          <li>• Material Design uses 3-layer shadows for realistic elevation</li>
          <li>• Lower opacity (10-20%) creates subtle, professional shadows</li>
        </ul>
      </div>
    </div>
  )
}

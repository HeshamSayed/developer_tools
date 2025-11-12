import { useState } from 'react'
import CopyButton from '@/components/Common/CopyButton'
import { useNotification } from '@/contexts/NotificationContext'

type ExportFormat = 'js' | 'ts' | 'json'

interface CustomBreakpoint {
  name: string
  value: string
}

export default function TailwindConfigGenerator() {
  const { showNotification } = useNotification()

  // Colors
  const [primaryColor, setPrimaryColor] = useState('#3b82f6')
  const [secondaryColor, setSecondaryColor] = useState('#8b5cf6')
  const [accentColor, setAccentColor] = useState('#10b981')
  const [generateColorShades, setGenerateColorShades] = useState(true)

  // Typography
  const [fontSans, setFontSans] = useState('Inter, system-ui, sans-serif')
  const [fontSerif, setFontSerif] = useState('Georgia, serif')
  const [fontMono, setFontMono] = useState('Fira Code, monospace')

  // Spacing & Sizing
  const [includeCustomSpacing, setIncludeCustomSpacing] = useState(true)
  const [maxWidth, setMaxWidth] = useState('1280px')

  // Breakpoints
  const [customBreakpoints, setCustomBreakpoints] = useState<CustomBreakpoint[]>([])
  const [includeCustomBreakpoints, setIncludeCustomBreakpoints] = useState(false)

  // Design Tokens
  const [borderRadius, setBorderRadius] = useState('0.5rem')
  const [includeCustomShadows, setIncludeCustomShadows] = useState(true)
  const [includeAnimations, setIncludeAnimations] = useState(true)

  // Configuration Options
  const [darkMode, setDarkMode] = useState<'class' | 'media'>('class')
  const [includePlugins, setIncludePlugins] = useState(false)
  const [exportFormat, setExportFormat] = useState<ExportFormat>('js')

  // Helper function to generate color shades
  const generateShades = (hex: string) => {
    const hexToRgb = (h: string) => {
      const r = parseInt(h.slice(1, 3), 16)
      const g = parseInt(h.slice(3, 5), 16)
      const b = parseInt(h.slice(5, 7), 16)
      return { r, g, b }
    }

    const rgbToHex = (r: number, g: number, b: number) => {
      return '#' + [r, g, b].map(x => {
        const hex = Math.round(x).toString(16)
        return hex.length === 1 ? '0' + hex : hex
      }).join('')
    }

    const adjustBrightness = (rgb: { r: number; g: number; b: number }, factor: number) => {
      return {
        r: Math.min(255, Math.max(0, rgb.r + (255 - rgb.r) * factor)),
        g: Math.min(255, Math.max(0, rgb.g + (255 - rgb.g) * factor)),
        b: Math.min(255, Math.max(0, rgb.b + (255 - rgb.b) * factor))
      }
    }

    const rgb = hexToRgb(hex)
    return {
      50: rgbToHex(...Object.values(adjustBrightness(rgb, 0.9))),
      100: rgbToHex(...Object.values(adjustBrightness(rgb, 0.8))),
      200: rgbToHex(...Object.values(adjustBrightness(rgb, 0.6))),
      300: rgbToHex(...Object.values(adjustBrightness(rgb, 0.4))),
      400: rgbToHex(...Object.values(adjustBrightness(rgb, 0.2))),
      500: hex,
      600: rgbToHex(...Object.values(adjustBrightness(rgb, -0.15))),
      700: rgbToHex(...Object.values(adjustBrightness(rgb, -0.3))),
      800: rgbToHex(...Object.values(adjustBrightness(rgb, -0.45))),
      900: rgbToHex(...Object.values(adjustBrightness(rgb, -0.6))),
      950: rgbToHex(...Object.values(adjustBrightness(rgb, -0.75))),
    }
  }

  const generateConfig = () => {
    const config: any = {
      content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
      darkMode,
      theme: {
        extend: {
          colors: {},
          fontFamily: {},
        },
      },
    }

    // Colors
    if (generateColorShades) {
      config.theme.extend.colors.primary = generateShades(primaryColor)
      config.theme.extend.colors.secondary = generateShades(secondaryColor)
      config.theme.extend.colors.accent = generateShades(accentColor)
    } else {
      config.theme.extend.colors.primary = primaryColor
      config.theme.extend.colors.secondary = secondaryColor
      config.theme.extend.colors.accent = accentColor
    }

    // Typography
    if (fontSans) {
      config.theme.extend.fontFamily.sans = fontSans.split(',').map(f => f.trim())
    }
    if (fontSerif) {
      config.theme.extend.fontFamily.serif = fontSerif.split(',').map(f => f.trim())
    }
    if (fontMono) {
      config.theme.extend.fontFamily.mono = fontMono.split(',').map(f => f.trim())
    }

    // Spacing
    if (includeCustomSpacing) {
      config.theme.extend.spacing = {
        '18': '4.5rem',
        '88': '22rem',
        '100': '25rem',
        '112': '28rem',
        '128': '32rem',
        '144': '36rem',
      }
    }

    // Max Width
    if (maxWidth) {
      config.theme.extend.maxWidth = {
        'screen-2xl': maxWidth,
      }
    }

    // Custom Breakpoints
    if (includeCustomBreakpoints && customBreakpoints.length > 0) {
      config.theme.extend.screens = {}
      customBreakpoints.forEach(bp => {
        config.theme.extend.screens[bp.name] = bp.value
      })
    }

    // Border Radius
    if (borderRadius) {
      config.theme.extend.borderRadius = {
        'DEFAULT': borderRadius,
        'xl': `calc(${borderRadius} * 1.5)`,
        '2xl': `calc(${borderRadius} * 2)`,
        '3xl': `calc(${borderRadius} * 3)`,
      }
    }

    // Shadows
    if (includeCustomShadows) {
      config.theme.extend.boxShadow = {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 30px -5px rgba(0, 0, 0, 0.04)',
        'hard': '0 10px 40px -10px rgba(0, 0, 0, 0.2)',
        'glow': `0 0 15px ${primaryColor}40`,
        'glow-lg': `0 0 30px ${primaryColor}60`,
      }
    }

    // Animations
    if (includeAnimations) {
      config.theme.extend.animation = {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-out': 'fadeOut 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-left': 'slideLeft 0.3s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-subtle': 'bounceSubtle 0.6s ease-in-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
      config.theme.extend.keyframes = {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      }
    }

    // Plugins
    if (includePlugins) {
      config.plugins = [
        'require("@tailwindcss/forms")',
        'require("@tailwindcss/typography")',
        'require("@tailwindcss/aspect-ratio")',
      ]
    }

    return config
  }

  const formatConfig = () => {
    const config = generateConfig()

    switch (exportFormat) {
      case 'js':
        return `/** @type {import('tailwindcss').Config} */
module.exports = ${JSON.stringify(config, null, 2).replace(/"require\\((.+?)\\)"/g, 'require($1)')}`

      case 'ts':
        return `import type { Config } from 'tailwindcss'

const config: Config = ${JSON.stringify(config, null, 2).replace(/"require\\((.+?)\\)"/g, 'require($1)')}

export default config`

      case 'json':
        return JSON.stringify(config, null, 2)

      default:
        return ''
    }
  }

  const configCode = formatConfig()

  const presets = [
    {
      name: 'Modern Blue',
      primary: '#3b82f6',
      secondary: '#8b5cf6',
      accent: '#10b981',
      fontSans: 'Inter, system-ui, sans-serif',
      borderRadius: '0.5rem',
    },
    {
      name: 'Vibrant Purple',
      primary: '#8b5cf6',
      secondary: '#ec4899',
      accent: '#f59e0b',
      fontSans: 'Plus Jakarta Sans, sans-serif',
      borderRadius: '0.75rem',
    },
    {
      name: 'Professional Dark',
      primary: '#1e293b',
      secondary: '#475569',
      accent: '#06b6d4',
      fontSans: 'IBM Plex Sans, sans-serif',
      borderRadius: '0.375rem',
    },
    {
      name: 'Fresh Green',
      primary: '#10b981',
      secondary: '#059669',
      accent: '#3b82f6',
      fontSans: 'DM Sans, sans-serif',
      borderRadius: '0.5rem',
    },
    {
      name: 'Elegant Rose',
      primary: '#e11d48',
      secondary: '#f43f5e',
      accent: '#fb7185',
      fontSans: 'Outfit, sans-serif',
      borderRadius: '0.625rem',
    },
    {
      name: 'Ocean Blue',
      primary: '#0ea5e9',
      secondary: '#06b6d4',
      accent: '#6366f1',
      fontSans: 'Figtree, sans-serif',
      borderRadius: '0.5rem',
    },
    {
      name: 'Warm Orange',
      primary: '#f97316',
      secondary: '#fb923c',
      accent: '#fbbf24',
      fontSans: 'Manrope, sans-serif',
      borderRadius: '0.75rem',
    },
    {
      name: 'Minimalist',
      primary: '#000000',
      secondary: '#525252',
      accent: '#737373',
      fontSans: 'Inter, sans-serif',
      borderRadius: '0.25rem',
    },
  ]

  const loadPreset = (preset: typeof presets[0]) => {
    setPrimaryColor(preset.primary)
    setSecondaryColor(preset.secondary)
    setAccentColor(preset.accent)
    setFontSans(preset.fontSans)
    setBorderRadius(preset.borderRadius)
    showNotification(`Loaded preset: ${preset.name}`, 'success')
  }

  return (
    <div className="space-y-6">
      {/* Presets */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Start Presets</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {presets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => loadPreset(preset)}
              className="p-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-primary-500 transition-all hover:scale-105"
            >
              <div className="flex gap-1 mb-2">
                <div className="w-6 h-6 rounded" style={{ backgroundColor: preset.primary }} />
                <div className="w-6 h-6 rounded" style={{ backgroundColor: preset.secondary }} />
                <div className="w-6 h-6 rounded" style={{ backgroundColor: preset.accent }} />
              </div>
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">
                {preset.name}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Configuration */}
        <div className="space-y-4">
          {/* Colors */}
          <div className="card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Color Palette</h3>
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={generateColorShades}
                  onChange={(e) => setGenerateColorShades(e.target.checked)}
                  className="rounded"
                />
                <span className="text-gray-600 dark:text-gray-400">Generate shades</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Primary Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-12 h-10 cursor-pointer rounded border border-gray-300 dark:border-gray-600"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="input flex-1 font-mono text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Secondary Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-12 h-10 cursor-pointer rounded border border-gray-300 dark:border-gray-600"
                />
                <input
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="input flex-1 font-mono text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Accent Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-12 h-10 cursor-pointer rounded border border-gray-300 dark:border-gray-600"
                />
                <input
                  type="text"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="input flex-1 font-mono text-sm"
                />
              </div>
            </div>
          </div>

          {/* Typography */}
          <div className="card space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Typography</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sans Serif Font
              </label>
              <input
                type="text"
                value={fontSans}
                onChange={(e) => setFontSans(e.target.value)}
                className="input w-full font-mono text-sm"
                placeholder="Inter, system-ui, sans-serif"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Serif Font
              </label>
              <input
                type="text"
                value={fontSerif}
                onChange={(e) => setFontSerif(e.target.value)}
                className="input w-full font-mono text-sm"
                placeholder="Georgia, serif"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Monospace Font
              </label>
              <input
                type="text"
                value={fontMono}
                onChange={(e) => setFontMono(e.target.value)}
                className="input w-full font-mono text-sm"
                placeholder="Fira Code, monospace"
              />
            </div>
          </div>

          {/* Design Tokens */}
          <div className="card space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Design Tokens</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Border Radius
              </label>
              <input
                type="text"
                value={borderRadius}
                onChange={(e) => setBorderRadius(e.target.value)}
                className="input w-full font-mono text-sm"
                placeholder="0.5rem"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Max Width
              </label>
              <input
                type="text"
                value={maxWidth}
                onChange={(e) => setMaxWidth(e.target.value)}
                className="input w-full font-mono text-sm"
                placeholder="1280px"
              />
            </div>
          </div>

          {/* Configuration Options */}
          <div className="card space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Configuration</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Dark Mode Strategy
              </label>
              <select
                value={darkMode}
                onChange={(e) => setDarkMode(e.target.value as 'class' | 'media')}
                className="input w-full text-sm"
              >
                <option value="class">Class-based (manual toggle)</option>
                <option value="media">Media query (system preference)</option>
              </select>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeCustomSpacing}
                onChange={(e) => setIncludeCustomSpacing(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Include extended spacing scale</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeCustomShadows}
                onChange={(e) => setIncludeCustomShadows(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Include custom shadow utilities</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeAnimations}
                onChange={(e) => setIncludeAnimations(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Include animation utilities</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includePlugins}
                onChange={(e) => setIncludePlugins(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Include official plugins</span>
            </label>
          </div>
        </div>

        {/* Right Column - Preview */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Color Preview</h3>
            <div className="space-y-3">
              {generateColorShades ? (
                <>
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Primary Shades</p>
                    <div className="flex gap-1">
                      {Object.entries(generateShades(primaryColor)).map(([shade, color]) => (
                        <div
                          key={shade}
                          className="flex-1 h-12 rounded"
                          style={{ backgroundColor: color }}
                          title={`${shade}: ${color}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Secondary Shades</p>
                    <div className="flex gap-1">
                      {Object.entries(generateShades(secondaryColor)).map(([shade, color]) => (
                        <div
                          key={shade}
                          className="flex-1 h-12 rounded"
                          style={{ backgroundColor: color }}
                          title={`${shade}: ${color}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Accent Shades</p>
                    <div className="flex gap-1">
                      {Object.entries(generateShades(accentColor)).map(([shade, color]) => (
                        <div
                          key={shade}
                          className="flex-1 h-12 rounded"
                          style={{ backgroundColor: color }}
                          title={`${shade}: ${color}`}
                        />
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-6 rounded-lg" style={{ backgroundColor: primaryColor }}>
                    <p className="text-white font-semibold drop-shadow">Primary Color</p>
                    <p className="text-white text-sm opacity-90 drop-shadow">{primaryColor}</p>
                  </div>
                  <div className="p-6 rounded-lg" style={{ backgroundColor: secondaryColor }}>
                    <p className="text-white font-semibold drop-shadow">Secondary Color</p>
                    <p className="text-white text-sm opacity-90 drop-shadow">{secondaryColor}</p>
                  </div>
                  <div className="p-6 rounded-lg" style={{ backgroundColor: accentColor }}>
                    <p className="text-white font-semibold drop-shadow">Accent Color</p>
                    <p className="text-white text-sm opacity-90 drop-shadow">{accentColor}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Component Preview */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Component Preview</h3>
            <div className="space-y-3">
              <button
                className="w-full py-2 px-4 rounded font-medium text-white transition-all hover:scale-105"
                style={{
                  backgroundColor: primaryColor,
                  borderRadius: borderRadius
                }}
              >
                Primary Button
              </button>
              <button
                className="w-full py-2 px-4 rounded font-medium text-white transition-all hover:scale-105"
                style={{
                  backgroundColor: secondaryColor,
                  borderRadius: borderRadius
                }}
              >
                Secondary Button
              </button>
              <button
                className="w-full py-2 px-4 rounded font-medium text-white transition-all hover:scale-105"
                style={{
                  backgroundColor: accentColor,
                  borderRadius: borderRadius
                }}
              >
                Accent Button
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Export Section */}
      <div className="card">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Export Configuration</h3>
          <div className="flex gap-2">
            {(['js', 'ts', 'json'] as ExportFormat[]).map((format) => (
              <button
                key={format}
                onClick={() => setExportFormat(format)}
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
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {exportFormat === 'js' ? 'tailwind.config.js' : exportFormat === 'ts' ? 'tailwind.config.ts' : 'tailwind.config.json'}
            </span>
            <CopyButton text={configCode} />
          </div>
          <pre className="text-xs text-gray-800 dark:text-gray-200 font-mono overflow-x-auto max-h-96">
            {configCode}
          </pre>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Setup Instructions
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Save this configuration file in your project root directory</li>
          <li>• Install Tailwind CSS: <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">npm install -D tailwindcss</code></li>
          <li>• Use color shades with: <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">bg-primary-500</code>, <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">text-secondary-600</code>, etc.</li>
          <li>• For dark mode: add <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">dark:</code> prefix (e.g., <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">dark:bg-gray-800</code>)</li>
          {includePlugins && <li>• Install plugins: <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">npm install -D @tailwindcss/forms @tailwindcss/typography @tailwindcss/aspect-ratio</code></li>}
          <li>• Custom animations can be used with: <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">animate-fade-in</code>, <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">animate-slide-up</code>, etc.</li>
        </ul>
      </div>
    </div>
  )
}

import { useState } from 'react'
import CopyButton from '@/components/Common/CopyButton'

export default function TailwindConfigGenerator() {
  const [primaryColor, setPrimaryColor] = useState('#3b82f6')
  const [secondaryColor, setSecondaryColor] = useState('#8b5cf6')
  const [fontFamily, setFontFamily] = useState('Inter, sans-serif')
  const [includeDarkMode, setIncludeDarkMode] = useState(true)
  const [includeCustomSpacing, setIncludeCustomSpacing] = useState(false)
  const [includeAnimations, setIncludeAnimations] = useState(false)

  const generateConfig = () => {
    const config: any = {
      content: ["./src/**/*.{js,jsx,ts,tsx}"],
      theme: {
        extend: {
          colors: {
            primary: primaryColor,
            secondary: secondaryColor,
          },
        },
      },
    }

    if (fontFamily) {
      config.theme.extend.fontFamily = {
        sans: [fontFamily],
      }
    }

    if (includeDarkMode) {
      config.darkMode = 'class'
    }

    if (includeCustomSpacing) {
      config.theme.extend.spacing = {
        '128': '32rem',
        '144': '36rem',
      }
    }

    if (includeAnimations) {
      config.theme.extend.animation = {
        'fade-in': 'fadeIn 0.5s ease-in',
        'slide-in': 'slideIn 0.3s ease-out',
      }
      config.theme.extend.keyframes = {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      }
    }

    return `/** @type {import('tailwindcss').Config} */
module.exports = ${JSON.stringify(config, null, 2)}`
  }

  const configCode = generateConfig()

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Primary Color
            </label>
            <div className="flex gap-3">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-16 h-10 cursor-pointer rounded border border-gray-300 dark:border-gray-600"
              />
              <input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="input flex-1 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Secondary Color
            </label>
            <div className="flex gap-3">
              <input
                type="color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="w-16 h-10 cursor-pointer rounded border border-gray-300 dark:border-gray-600"
              />
              <input
                type="text"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="input flex-1 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Font Family
            </label>
            <input
              type="text"
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="input w-full"
              placeholder="Inter, sans-serif"
            />
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="darkMode"
                checked={includeDarkMode}
                onChange={(e) => setIncludeDarkMode(e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded"
              />
              <label htmlFor="darkMode" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Include Dark Mode Support
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="spacing"
                checked={includeCustomSpacing}
                onChange={(e) => setIncludeCustomSpacing(e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded"
              />
              <label htmlFor="spacing" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Include Custom Spacing
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="animations"
                checked={includeAnimations}
                onChange={(e) => setIncludeAnimations(e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded"
              />
              <label htmlFor="animations" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Include Custom Animations
              </label>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Color Preview
          </label>
          <div className="space-y-4">
            <div className="p-6 rounded-lg" style={{ backgroundColor: primaryColor }}>
              <p className="text-white font-semibold drop-shadow">Primary Color</p>
              <p className="text-white text-sm opacity-90 drop-shadow">{primaryColor}</p>
            </div>
            <div className="p-6 rounded-lg" style={{ backgroundColor: secondaryColor }}>
              <p className="text-white font-semibold drop-shadow">Secondary Color</p>
              <p className="text-white text-sm opacity-90 drop-shadow">{secondaryColor}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            tailwind.config.js
          </span>
          <CopyButton text={configCode} />
        </div>
        <pre className="text-xs text-gray-800 dark:text-gray-200 font-mono overflow-x-auto max-h-96">
          {configCode}
        </pre>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2 text-sm">Usage</h4>
        <ul className="space-y-1 text-blue-800 dark:text-blue-200 text-xs">
          <li>• Save this as <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">tailwind.config.js</code> in your project root</li>
          <li>• Use <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">bg-primary</code> and <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">bg-secondary</code> in your components</li>
          <li>• For dark mode, add <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">dark:</code> prefix to your classes</li>
        </ul>
      </div>
    </div>
  )
}

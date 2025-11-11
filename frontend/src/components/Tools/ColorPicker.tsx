import { useState } from 'react'
import CopyButton from '@/components/Common/CopyButton'

export default function ColorPicker() {
  const [color, setColor] = useState('#3b82f6')

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null
  }

  const hexToHsl = (hex: string) => {
    const rgb = hexToRgb(hex)
    if (!rgb) return null

    const r = rgb.r / 255
    const g = rgb.g / 255
    const b = rgb.b / 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0
    let s = 0
    const l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6
          break
        case g:
          h = ((b - r) / d + 2) / 6
          break
        case b:
          h = ((r - g) / d + 4) / 6
          break
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    }
  }

  const rgb = hexToRgb(color)
  const hsl = hexToHsl(color)

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-full h-48 rounded-lg border-4 border-gray-200 dark:border-gray-700 shadow-lg"
          style={{ backgroundColor: color }}
        />
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-full h-16 cursor-pointer rounded-lg"
        />
      </div>

      <div className="space-y-4">
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">HEX</span>
            <CopyButton text={color} />
          </div>
          <code className="text-lg text-gray-800 dark:text-gray-200 font-mono">{color.toUpperCase()}</code>
        </div>

        {rgb && (
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">RGB</span>
              <CopyButton text={`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`} />
            </div>
            <code className="text-lg text-gray-800 dark:text-gray-200 font-mono">
              rgb({rgb.r}, {rgb.g}, {rgb.b})
            </code>
            <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">R:</span> {rgb.r}
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">G:</span> {rgb.g}
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">B:</span> {rgb.b}
              </div>
            </div>
          </div>
        )}

        {hsl && (
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">HSL</span>
              <CopyButton text={`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`} />
            </div>
            <code className="text-lg text-gray-800 dark:text-gray-200 font-mono">
              hsl({hsl.h}, {hsl.s}%, {hsl.l}%)
            </code>
            <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">H:</span> {hsl.h}°
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">S:</span> {hsl.s}%
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">L:</span> {hsl.l}%
              </div>
            </div>
          </div>
        )}

        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">CSS Variable</span>
            <CopyButton text={`--color: ${color};`} />
          </div>
          <code className="text-sm text-gray-800 dark:text-gray-200 font-mono">--color: {color};</code>
        </div>
      </div>
    </div>
  )
}

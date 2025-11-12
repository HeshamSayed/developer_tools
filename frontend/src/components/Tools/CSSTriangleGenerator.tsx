import { useState } from 'react'
import CopyButton from '@/components/Common/CopyButton'

export default function CSSTriangleGenerator() {
  const [direction, setDirection] = useState<'up' | 'down' | 'left' | 'right'>('up')
  const [width, setWidth] = useState(100)
  const [height, setHeight] = useState(100)
  const [color, setColor] = useState('#3b82f6')

  const getTriangleCSS = () => {
    const w = width
    const h = height

    switch (direction) {
      case 'up':
        return {
          css: `width: 0;
height: 0;
border-left: ${w / 2}px solid transparent;
border-right: ${w / 2}px solid transparent;
border-bottom: ${h}px solid ${color};`,
          style: {
            width: 0,
            height: 0,
            borderLeft: `${w / 2}px solid transparent`,
            borderRight: `${w / 2}px solid transparent`,
            borderBottom: `${h}px solid ${color}`,
          },
        }
      case 'down':
        return {
          css: `width: 0;
height: 0;
border-left: ${w / 2}px solid transparent;
border-right: ${w / 2}px solid transparent;
border-top: ${h}px solid ${color};`,
          style: {
            width: 0,
            height: 0,
            borderLeft: `${w / 2}px solid transparent`,
            borderRight: `${w / 2}px solid transparent`,
            borderTop: `${h}px solid ${color}`,
          },
        }
      case 'left':
        return {
          css: `width: 0;
height: 0;
border-top: ${h / 2}px solid transparent;
border-bottom: ${h / 2}px solid transparent;
border-right: ${w}px solid ${color};`,
          style: {
            width: 0,
            height: 0,
            borderTop: `${h / 2}px solid transparent`,
            borderBottom: `${h / 2}px solid transparent`,
            borderRight: `${w}px solid ${color}`,
          },
        }
      case 'right':
        return {
          css: `width: 0;
height: 0;
border-top: ${h / 2}px solid transparent;
border-bottom: ${h / 2}px solid transparent;
border-left: ${w}px solid ${color};`,
          style: {
            width: 0,
            height: 0,
            borderTop: `${h / 2}px solid transparent`,
            borderBottom: `${h / 2}px solid transparent`,
            borderLeft: `${w}px solid ${color}`,
          },
        }
    }
  }

  const { css, style } = getTriangleCSS()

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Direction
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['up', 'down', 'left', 'right'] as const).map((dir) => (
                <button
                  key={dir}
                  onClick={() => setDirection(dir)}
                  className={`px-4 py-2 rounded-lg transition-colors capitalize ${
                    direction === dir
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {dir}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Width
              </label>
              <span className="text-sm text-gray-500">{width}px</span>
            </div>
            <input
              type="range"
              min="20"
              max="300"
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Height
              </label>
              <span className="text-sm text-gray-500">{height}px</span>
            </div>
            <input
              type="range"
              min="20"
              max="300"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Color
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
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Preview
          </label>
          <div className="w-full h-full min-h-[300px] bg-gray-100 dark:bg-gray-800 rounded-lg p-8 flex items-center justify-center">
            <div style={style} />
          </div>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">CSS Code</span>
          <CopyButton text={css} />
        </div>
        <pre className="text-sm text-gray-800 dark:text-gray-200 font-mono whitespace-pre-wrap">
          {css}
        </pre>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">How it works</h4>
        <p className="text-blue-800 dark:text-blue-200 text-xs">
          CSS triangles are created using borders. By setting the width and height to 0 and manipulating
          border widths and colors, you can create triangular shapes pointing in any direction.
        </p>
      </div>
    </div>
  )
}

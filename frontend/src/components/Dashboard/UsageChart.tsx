import { useEffect, useRef } from 'react'

interface UsageDataPoint {
  date: string
  count: number
}

interface UsageChartProps {
  data: UsageDataPoint[]
  title: string
  color?: 'primary' | 'accent' | 'success'
}

export default function UsageChart({ data, title, color = 'primary' }: UsageChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height)

    // Calculate dimensions
    const padding = { top: 20, right: 20, bottom: 40, left: 50 }
    const chartWidth = rect.width - padding.left - padding.right
    const chartHeight = rect.height - padding.top - padding.bottom

    // Find max value
    const maxValue = Math.max(...data.map(d => d.count), 1)
    const yStep = Math.ceil(maxValue / 5)
    const maxY = yStep * 5

    // Color schemes
    const colors = {
      primary: { line: '#0ea5e9', fill: 'rgba(14, 165, 233, 0.1)', grid: '#e5e7eb' },
      accent: { line: '#d946ef', fill: 'rgba(217, 70, 239, 0.1)', grid: '#e5e7eb' },
      success: { line: '#22c55e', fill: 'rgba(34, 197, 94, 0.1)', grid: '#e5e7eb' },
    }
    const colorScheme = colors[color]

    // Draw grid lines
    ctx.strokeStyle = colorScheme.grid
    ctx.lineWidth = 1
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (chartHeight / 5) * i
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(padding.left + chartWidth, y)
      ctx.stroke()

      // Y-axis labels
      const value = maxY - (maxY / 5) * i
      ctx.fillStyle = '#6b7280'
      ctx.font = '12px sans-serif'
      ctx.textAlign = 'right'
      ctx.textBaseline = 'middle'
      ctx.fillText(value.toString(), padding.left - 10, y)
    }

    // Draw chart line and area
    if (data.length > 0) {
      const xStep = chartWidth / (data.length - 1 || 1)

      // Create gradient for area fill
      const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight)
      gradient.addColorStop(0, colorScheme.fill.replace('0.1', '0.3'))
      gradient.addColorStop(1, colorScheme.fill.replace('0.1', '0.05'))

      // Draw area
      ctx.beginPath()
      ctx.moveTo(padding.left, padding.top + chartHeight)
      data.forEach((point, index) => {
        const x = padding.left + xStep * index
        const y = padding.top + chartHeight - (point.count / maxY) * chartHeight
        if (index === 0) {
          ctx.lineTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      ctx.lineTo(padding.left + xStep * (data.length - 1), padding.top + chartHeight)
      ctx.closePath()
      ctx.fillStyle = gradient
      ctx.fill()

      // Draw line
      ctx.beginPath()
      data.forEach((point, index) => {
        const x = padding.left + xStep * index
        const y = padding.top + chartHeight - (point.count / maxY) * chartHeight
        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      ctx.strokeStyle = colorScheme.line
      ctx.lineWidth = 3
      ctx.stroke()

      // Draw points
      data.forEach((point, index) => {
        const x = padding.left + xStep * index
        const y = padding.top + chartHeight - (point.count / maxY) * chartHeight
        ctx.beginPath()
        ctx.arc(x, y, 4, 0, 2 * Math.PI)
        ctx.fillStyle = colorScheme.line
        ctx.fill()
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 2
        ctx.stroke()
      })

      // X-axis labels
      ctx.fillStyle = '#6b7280'
      ctx.font = '11px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      data.forEach((point, index) => {
        if (index % Math.ceil(data.length / 7) === 0 || index === data.length - 1) {
          const x = padding.left + xStep * index
          const date = new Date(point.date)
          const label = `${date.getMonth() + 1}/${date.getDate()}`
          ctx.fillText(label, x, padding.top + chartHeight + 10)
        }
      })
    }
  }, [data, color])

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400">No data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      <div className="relative" style={{ height: '300px' }}>
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ display: 'block' }}
        />
      </div>
    </div>
  )
}

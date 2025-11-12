import { useState } from 'react'
import CopyButton from '@/components/Common/CopyButton'

type Preset = {
  name: string
  expression: string
  description: string
}

const presets: Preset[] = [
  { name: 'Every minute', expression: '* * * * *', description: 'Runs every minute' },
  { name: 'Every 5 minutes', expression: '*/5 * * * *', description: 'Runs every 5 minutes' },
  { name: 'Every 15 minutes', expression: '*/15 * * * *', description: 'Runs every 15 minutes' },
  { name: 'Every 30 minutes', expression: '*/30 * * * *', description: 'Runs every 30 minutes' },
  { name: 'Every hour', expression: '0 * * * *', description: 'Runs at the start of every hour' },
  { name: 'Every 6 hours', expression: '0 */6 * * *', description: 'Runs every 6 hours' },
  { name: 'Every day at midnight', expression: '0 0 * * *', description: 'Runs at 00:00 every day' },
  { name: 'Every day at noon', expression: '0 12 * * *', description: 'Runs at 12:00 every day' },
  { name: 'Every Monday at 9 AM', expression: '0 9 * * 1', description: 'Runs at 09:00 every Monday' },
  { name: 'Every weekday at 9 AM', expression: '0 9 * * 1-5', description: 'Runs at 09:00 Monday through Friday' },
  { name: 'Every weekend at 10 AM', expression: '0 10 * * 0,6', description: 'Runs at 10:00 on Saturday and Sunday' },
  { name: 'First day of month', expression: '0 0 1 * *', description: 'Runs at midnight on the 1st of every month' },
  { name: 'Last day of month', expression: '0 0 L * *', description: 'Runs at midnight on the last day of the month' },
  { name: 'Every quarter', expression: '0 0 1 */3 *', description: 'Runs at midnight on the 1st of every 3rd month' },
  { name: 'Twice daily', expression: '0 0,12 * * *', description: 'Runs at midnight and noon' },
]

export default function CrontabGenerator() {
  const [minute, setMinute] = useState('*')
  const [hour, setHour] = useState('*')
  const [dayOfMonth, setDayOfMonth] = useState('*')
  const [month, setMonth] = useState('*')
  const [dayOfWeek, setDayOfWeek] = useState('*')
  const [expression, setExpression] = useState('* * * * *')
  const [explanation, setExplanation] = useState('')
  const [command, setCommand] = useState('')

  const months = [
    { value: '*', label: 'Every month' },
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ]

  const daysOfWeek = [
    { value: '*', label: 'Every day' },
    { value: '0', label: 'Sunday' },
    { value: '1', label: 'Monday' },
    { value: '2', label: 'Tuesday' },
    { value: '3', label: 'Wednesday' },
    { value: '4', label: 'Thursday' },
    { value: '5', label: 'Friday' },
    { value: '6', label: 'Saturday' },
    { value: '1-5', label: 'Weekdays (Mon-Fri)' },
    { value: '0,6', label: 'Weekends (Sat-Sun)' },
  ]

  const explainCron = (cron: string): string => {
    const parts = cron.trim().split(/\s+/)
    if (parts.length !== 5) return 'Invalid cron expression (must have 5 parts)'

    const [min, hr, dom, mon, dow] = parts
    let explanation = 'Runs '

    // Minute
    if (min === '*') explanation += 'every minute'
    else if (min.includes('/')) explanation += `every ${min.split('/')[1]} minutes`
    else if (min.includes(',')) explanation += `at minutes ${min}`
    else explanation += `at minute ${min}`

    // Hour
    if (hr === '*') explanation += ' of every hour'
    else if (hr.includes('/')) explanation += ` of every ${hr.split('/')[1]} hours`
    else if (hr.includes(',')) explanation += ` past hours ${hr}`
    else if (hr.includes('-')) explanation += ` between hours ${hr}`
    else explanation += ` past hour ${hr}`

    // Day of month
    if (dom === '*') { /* skip */ }
    else if (dom.includes('/')) explanation += `, every ${dom.split('/')[1]} days`
    else if (dom.includes(',')) explanation += `, on days ${dom} of the month`
    else if (dom === 'L') explanation += ', on the last day of the month'
    else explanation += `, on day ${dom} of the month`

    // Month
    if (mon === '*') { /* skip */ }
    else if (mon.includes('/')) explanation += `, every ${mon.split('/')[1]} months`
    else if (mon.includes(',')) explanation += `, in months ${mon}`
    else explanation += `, in month ${mon}`

    // Day of week
    if (dow === '*') { /* skip */ }
    else if (dow === '1-5') explanation += ', on weekdays'
    else if (dow === '0,6' || dow === '6,0') explanation += ', on weekends'
    else if (dow.includes(',')) explanation += `, on days of week ${dow}`
    else {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      explanation += `, on ${dayNames[parseInt(dow)] || `day ${dow}`}`
    }

    return explanation
  }

  const updateExpression = () => {
    const newExpression = `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`
    setExpression(newExpression)
    setExplanation(explainCron(newExpression))
  }

  const handlePresetSelect = (preset: Preset) => {
    const parts = preset.expression.split(' ')
    setMinute(parts[0] || '*')
    setHour(parts[1] || '*')
    setDayOfMonth(parts[2] || '*')
    setMonth(parts[3] || '*')
    setDayOfWeek(parts[4] || '*')
    setExpression(preset.expression)
    setExplanation(preset.description)
  }

  const handleExpressionInput = (value: string) => {
    setExpression(value)
    const parts = value.trim().split(/\s+/)
    if (parts.length === 5) {
      setMinute(parts[0])
      setHour(parts[1])
      setDayOfMonth(parts[2])
      setMonth(parts[3])
      setDayOfWeek(parts[4])
      setExplanation(explainCron(value))
    }
  }

  const generateCrontabEntry = () => {
    return `${expression} ${command || '/path/to/command'}`
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generateCrontabEntry())
  }

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
          ⏰ Crontab Expression Generator
        </h3>
        <p className="text-xs text-blue-800 dark:text-blue-200">
          Generate cron schedule expressions with an easy-to-use interface. Cron format:
          <code className="mx-1 px-1 bg-blue-100 dark:bg-blue-800 rounded">minute hour day month weekday</code>
        </p>
      </div>

      {/* Presets */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          🎯 Quick Presets:
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          {presets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => handlePresetSelect(preset)}
              className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-primary-100 dark:hover:bg-primary-900 text-gray-700 dark:text-gray-300 hover:text-primary-700 dark:hover:text-primary-300 rounded transition-colors text-left"
              title={preset.description}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Builder */}
      <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
          🛠️ Visual Builder:
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Minute */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Minute (0-59)
            </label>
            <input
              type="text"
              value={minute}
              onChange={(e) => setMinute(e.target.value)}
              placeholder="* or 0-59"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono"
            />
            <p className="text-xs text-gray-500 mt-1">Examples: *, 0, 15, */5, 0-30</p>
          </div>

          {/* Hour */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Hour (0-23)
            </label>
            <input
              type="text"
              value={hour}
              onChange={(e) => setHour(e.target.value)}
              placeholder="* or 0-23"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono"
            />
            <p className="text-xs text-gray-500 mt-1">Examples: *, 0, 12, */2, 9-17</p>
          </div>

          {/* Day of Month */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Day of Month (1-31)
            </label>
            <input
              type="text"
              value={dayOfMonth}
              onChange={(e) => setDayOfMonth(e.target.value)}
              placeholder="* or 1-31"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono"
            />
            <p className="text-xs text-gray-500 mt-1">Examples: *, 1, 15, L (last)</p>
          </div>

          {/* Month */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Month (1-12)
            </label>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Day of Week */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Day of Week (0-6)
            </label>
            <select
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {daysOfWeek.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-center pt-4">
          <button
            onClick={updateExpression}
            className="btn btn-primary px-8"
          >
            🔄 Generate Expression
          </button>
        </div>
      </div>

      {/* Generated Expression */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            📝 Cron Expression:
          </label>
          <CopyButton text={expression} />
        </div>
        <input
          type="text"
          value={expression}
          onChange={(e) => handleExpressionInput(e.target.value)}
          className="w-full px-4 py-3 text-lg border-2 border-primary-300 dark:border-primary-600 rounded-lg dark:bg-gray-800 dark:text-white font-mono font-bold"
          placeholder="* * * * *"
        />
      </div>

      {/* Explanation */}
      {explanation && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-green-900 dark:text-green-100 mb-2">
            💬 Human Readable:
          </h3>
          <p className="text-green-800 dark:text-green-200">{explanation}</p>
        </div>
      )}

      {/* Command */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          🖥️ Command to Execute:
        </label>
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="/usr/bin/backup.sh"
          className="w-full px-3 py-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono"
        />
      </div>

      {/* Full Crontab Entry */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            📋 Full Crontab Entry:
          </label>
          <button
            onClick={handleCopy}
            className="btn btn-secondary text-sm"
          >
            📋 Copy Entry
          </button>
        </div>
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
          {generateCrontabEntry()}
        </div>
      </div>

      {/* Cron Syntax Reference */}
      <details className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <summary className="cursor-pointer font-medium text-gray-700 dark:text-gray-300 mb-2">
          📖 Cron Syntax Reference
        </summary>
        <div className="mt-4 space-y-4 text-sm">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Field Values:</h4>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-300 dark:border-gray-600">
                  <th className="py-2">Field</th>
                  <th className="py-2">Allowed Values</th>
                  <th className="py-2">Special Characters</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 dark:text-gray-300">
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-2">Minute</td>
                  <td>0-59</td>
                  <td>* , - /</td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-2">Hour</td>
                  <td>0-23</td>
                  <td>* , - /</td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-2">Day of Month</td>
                  <td>1-31</td>
                  <td>* , - / L W</td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-2">Month</td>
                  <td>1-12</td>
                  <td>* , - /</td>
                </tr>
                <tr>
                  <td className="py-2">Day of Week</td>
                  <td>0-6 (0=Sunday)</td>
                  <td>* , - / L #</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Special Characters:</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
              <li><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">*</code> - Any value (every)</li>
              <li><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">,</code> - List of values (e.g., 1,3,5)</li>
              <li><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">-</code> - Range of values (e.g., 1-5)</li>
              <li><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">/</code> - Step values (e.g., */5 = every 5)</li>
              <li><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">L</code> - Last (day of month or week)</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Examples:</h4>
            <ul className="space-y-1 text-gray-700 dark:text-gray-300 font-mono text-xs">
              <li><code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">0 0 * * *</code> - Daily at midnight</li>
              <li><code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">*/15 * * * *</code> - Every 15 minutes</li>
              <li><code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">0 9-17 * * 1-5</code> - Every hour 9AM-5PM, weekdays</li>
              <li><code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">0 0 1,15 * *</code> - 1st and 15th of month</li>
            </ul>
          </div>
        </div>
      </details>
    </div>
  )
}

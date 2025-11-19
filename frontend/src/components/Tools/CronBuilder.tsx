import { useState } from 'react'
import CopyButton from '@/components/Common/CopyButton'

export default function CronBuilder() {
  const [minute, setMinute] = useState('*')
  const [hour, setHour] = useState('*')
  const [dayOfMonth, setDayOfMonth] = useState('*')
  const [month, setMonth] = useState('*')
  const [dayOfWeek, setDayOfWeek] = useState('*')

  const cronExpression = `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`

  const getDescription = () => {
    let description = 'Runs '

    // Minute
    if (minute === '*') description += 'every minute'
    else if (minute.includes('/')) description += `every ${minute.split('/')[1]} minutes`
    else if (minute.includes(',')) description += `at minutes ${minute}`
    else description += `at minute ${minute}`

    // Hour
    if (hour === '*') description += ' of every hour'
    else if (hour.includes('/')) description += ` of every ${hour.split('/')[1]} hours`
    else if (hour.includes(',')) description += ` past hours ${hour}`
    else {
      const hourNum = parseInt(hour)
      const formatted = hourNum.toString().padStart(2, '0') + ':00'
      description += ` at ${formatted}`
    }

    // Month
    if (month !== '*') {
      const months = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
      description += ` in ${months[parseInt(month)]}`
    }

    // CRITICAL: Day of Month and Day of Week use OR logic, not AND!
    const domSpecified = dayOfMonth !== '*'
    const dowSpecified = dayOfWeek !== '*'

    if (domSpecified && dowSpecified) {
      // Both specified = OR logic
      description += ', on (day ' + dayOfMonth

      description += ' OR '

      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      description += days[parseInt(dayOfWeek)]

      description += ')'
    } else if (domSpecified) {
      // Only day of month specified
      description += `, on day ${dayOfMonth} of the month`
    } else if (dowSpecified) {
      // Only day of week specified
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      description += `, on ${days[parseInt(dayOfWeek)]}`
    }

    return description
  }

  const commonPatterns = [
    { label: 'Every minute', value: '* * * * *' },
    { label: 'Every hour', value: '0 * * * *' },
    { label: 'Every day at midnight', value: '0 0 * * *' },
    { label: 'Every day at noon', value: '0 12 * * *' },
    { label: 'Every Monday at 9 AM', value: '0 9 * * 1' },
    { label: 'Every 15 minutes', value: '*/15 * * * *' },
    { label: 'Every 6 hours', value: '0 */6 * * *' },
    { label: 'First day of month', value: '0 0 1 * *' },
  ]

  const loadPattern = (pattern: string) => {
    const [m, h, d, mo, dw] = pattern.split(' ')
    setMinute(m)
    setHour(h)
    setDayOfMonth(d)
    setMonth(mo)
    setDayOfWeek(dw)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Minute
          </label>
          <input
            type="text"
            value={minute}
            onChange={(e) => setMinute(e.target.value)}
            className="input font-mono text-center"
            placeholder="*"
          />
          <p className="text-xs text-gray-500 mt-1">0-59 or *</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Hour
          </label>
          <input
            type="text"
            value={hour}
            onChange={(e) => setHour(e.target.value)}
            className="input font-mono text-center"
            placeholder="*"
          />
          <p className="text-xs text-gray-500 mt-1">0-23 or *</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Day of Month
          </label>
          <input
            type="text"
            value={dayOfMonth}
            onChange={(e) => setDayOfMonth(e.target.value)}
            className="input font-mono text-center"
            placeholder="*"
          />
          <p className="text-xs text-gray-500 mt-1">1-31 or *</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Month
          </label>
          <input
            type="text"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="input font-mono text-center"
            placeholder="*"
          />
          <p className="text-xs text-gray-500 mt-1">1-12 or *</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Day of Week
          </label>
          <input
            type="text"
            value={dayOfWeek}
            onChange={(e) => setDayOfWeek(e.target.value)}
            className="input font-mono text-center"
            placeholder="*"
          />
          <p className="text-xs text-gray-500 mt-1">0-6 or *</p>
        </div>
      </div>

      <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-primary-900 dark:text-primary-100">
            Cron Expression
          </span>
          <CopyButton text={cronExpression} />
        </div>
        <code className="text-xl text-primary-800 dark:text-primary-200 font-mono">
          {cronExpression}
        </code>
      </div>

      {/* DOM/DOW Warning */}
      {dayOfMonth !== '*' && dayOfWeek !== '*' && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-400 dark:border-amber-600 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-2 flex items-center gap-2">
            <span>⚠️</span>
            <span>OR Logic Warning</span>
          </h3>
          <p className="text-amber-800 dark:text-amber-200 text-sm">
            Both Day of Month and Day of Week are specified. In standard cron, these use <strong>OR logic</strong>,
            meaning the job runs when <em>either</em> condition is met.
          </p>
        </div>
      )}

      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Description
        </h3>
        <p className="text-gray-800 dark:text-gray-200">
          {getDescription()}
        </p>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Common Patterns
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {commonPatterns.map((pattern) => (
            <button
              key={pattern.value}
              onClick={() => loadPattern(pattern.value)}
              className="btn btn-secondary text-left justify-start"
            >
              <div>
                <div className="font-medium text-sm">{pattern.label}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">{pattern.value}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Cron Syntax Help</h4>
        <ul className="space-y-1 text-blue-800 dark:text-blue-200 text-xs">
          <li>• Use <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">*</code> for any value</li>
          <li>• Use <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">,</code> to separate values (e.g., 1,15,30)</li>
          <li>• Use <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">-</code> for ranges (e.g., 1-5)</li>
          <li>• Use <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">/</code> for step values (e.g., */15 for every 15 minutes)</li>
          <li className="pt-2 border-t border-blue-200 dark:border-blue-700">
            ⚠️ <strong>Important:</strong> When both Day of Month and Day of Week are specified,
            cron uses OR logic (not AND). The job runs when either condition is true.
          </li>
        </ul>
      </div>
    </div>
  )
}

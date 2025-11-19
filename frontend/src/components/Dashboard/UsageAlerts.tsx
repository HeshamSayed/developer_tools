interface UsageAlertsProps {
  dailyUsage: number
  dailyQuota: number
  monthlyUsage: number
  monthlyQuota: number
}

export default function UsageAlerts({ dailyUsage, dailyQuota, monthlyUsage, monthlyQuota }: UsageAlertsProps) {
  const dailyPercentage = (dailyUsage / dailyQuota) * 100
  const monthlyPercentage = (monthlyUsage / monthlyQuota) * 100

  const alerts = []

  // Daily quota alerts
  if (dailyPercentage >= 90) {
    alerts.push({
      level: 'error',
      title: 'Daily Quota Critical',
      message: `You've used ${dailyPercentage.toFixed(0)}% of your daily quota. Upgrade to avoid service interruption.`,
      icon: '🚨',
    })
  } else if (dailyPercentage >= 75) {
    alerts.push({
      level: 'warning',
      title: 'Daily Quota Warning',
      message: `You've used ${dailyPercentage.toFixed(0)}% of your daily quota. Consider upgrading your plan.`,
      icon: '⚠️',
    })
  }

  // Monthly quota alerts
  if (monthlyPercentage >= 90) {
    alerts.push({
      level: 'error',
      title: 'Monthly Quota Critical',
      message: `You've used ${monthlyPercentage.toFixed(0)}% of your monthly quota. Upgrade to continue using tools.`,
      icon: '🚨',
    })
  } else if (monthlyPercentage >= 75) {
    alerts.push({
      level: 'warning',
      title: 'Monthly Quota Warning',
      message: `You've used ${monthlyPercentage.toFixed(0)}% of your monthly quota.`,
      icon: '⚠️',
    })
  }

  // Success state
  if (alerts.length === 0 && (dailyUsage > 0 || monthlyUsage > 0)) {
    alerts.push({
      level: 'success',
      title: 'All Good!',
      message: 'Your usage is within normal limits. Keep up the good work!',
      icon: '✅',
    })
  }

  if (alerts.length === 0) return null

  return (
    <div className="space-y-3">
      {alerts.map((alert, index) => (
        <div
          key={index}
          className={`p-4 rounded-lg border ${
            alert.level === 'error'
              ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              : alert.level === 'warning'
              ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
              : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
          }`}
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">{alert.icon}</span>
            <div className="flex-1">
              <h4
                className={`font-semibold mb-1 ${
                  alert.level === 'error'
                    ? 'text-red-900 dark:text-red-300'
                    : alert.level === 'warning'
                    ? 'text-yellow-900 dark:text-yellow-300'
                    : 'text-green-900 dark:text-green-300'
                }`}
              >
                {alert.title}
              </h4>
              <p
                className={`text-sm ${
                  alert.level === 'error'
                    ? 'text-red-800 dark:text-red-400'
                    : alert.level === 'warning'
                    ? 'text-yellow-800 dark:text-yellow-400'
                    : 'text-green-800 dark:text-green-400'
                }`}
              >
                {alert.message}
              </p>
              {alert.level !== 'success' && (
                <a
                  href="/pricing"
                  className={`inline-block mt-2 text-sm font-semibold underline ${
                    alert.level === 'error'
                      ? 'text-red-700 dark:text-red-300'
                      : 'text-yellow-700 dark:text-yellow-300'
                  }`}
                >
                  Upgrade Plan →
                </a>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

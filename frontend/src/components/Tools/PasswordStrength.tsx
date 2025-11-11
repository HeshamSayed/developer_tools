import { useState } from 'react'
import { checkPasswordStrength } from '@/services/api'

export default function PasswordStrength() {
  const [password, setPassword] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleCheck = async () => {
    if (!password) return

    setLoading(true)
    try {
      const response = await checkPasswordStrength(password)
      if (response.success) {
        setResult(response)
      }
    } catch (err) {
      console.error('Failed to check password strength', err)
    } finally {
      setLoading(false)
    }
  }

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'very_strong':
        return 'bg-green-500'
      case 'strong':
        return 'bg-blue-500'
      case 'moderate':
        return 'bg-yellow-500'
      case 'weak':
        return 'bg-orange-500'
      case 'very_weak':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Enter Password
        </label>
        <input
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input"
          placeholder="Enter password to check strength..."
        />
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleCheck}
          disabled={loading || !password}
          className="btn btn-primary px-8"
        >
          {loading ? 'Checking...' : 'Check Strength'}
        </button>
      </div>

      {result && (
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Strength: {result.strength_label}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Score: {result.score}/100
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-300 ${getStrengthColor(result.strength)}`}
                style={{ width: `${result.score}%` }}
              />
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Password Checks
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                {result.checks.length >= 8 ? (
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                <span className="text-gray-700 dark:text-gray-300">
                  Length: {result.checks.length} characters
                </span>
              </div>
              <div className="flex items-center gap-2">
                {result.checks.has_lowercase ? (
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                <span className="text-gray-700 dark:text-gray-300">Lowercase letters</span>
              </div>
              <div className="flex items-center gap-2">
                {result.checks.has_uppercase ? (
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                <span className="text-gray-700 dark:text-gray-300">Uppercase letters</span>
              </div>
              <div className="flex items-center gap-2">
                {result.checks.has_numbers ? (
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                <span className="text-gray-700 dark:text-gray-300">Numbers</span>
              </div>
              <div className="flex items-center gap-2">
                {result.checks.has_symbols ? (
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                <span className="text-gray-700 dark:text-gray-300">Special symbols</span>
              </div>
            </div>
          </div>

          {result.suggestions.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                Suggestions
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-blue-800 dark:text-blue-200">
                {result.suggestions.map((suggestion: string, index: number) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

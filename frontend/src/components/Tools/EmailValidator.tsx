import { useState } from 'react'

export default function EmailValidator() {
  const [email, setEmail] = useState('')
  const [result, setResult] = useState<{ valid: boolean; message: string; details: string[] } | null>(null)

  const validateEmail = () => {
    const details: string[] = []

    if (!email) {
      setResult({ valid: false, message: 'Email cannot be empty', details: [] })
      return
    }

    // Basic format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      details.push('❌ Invalid email format')
      setResult({ valid: false, message: 'Invalid email format', details })
      return
    }

    // Split email
    const [localPart, domain] = email.split('@')

    // Local part checks
    if (localPart.length > 64) {
      details.push('❌ Local part exceeds 64 characters')
    } else {
      details.push('✓ Local part length is valid')
    }

    if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(localPart)) {
      details.push('✓ Local part contains valid characters')
    } else {
      details.push('❌ Local part contains invalid characters')
    }

    if (!/^\./.test(localPart) && !/\.$/.test(localPart)) {
      details.push('✓ Local part does not start or end with a dot')
    } else {
      details.push('❌ Local part starts or ends with a dot')
    }

    if (!/\.\./.test(localPart)) {
      details.push('✓ No consecutive dots in local part')
    } else {
      details.push('❌ Consecutive dots found in local part')
    }

    // Domain checks
    if (domain && domain.length <= 255) {
      details.push('✓ Domain length is valid')
    } else {
      details.push('❌ Domain length exceeds 255 characters')
    }

    if (domain && /^[a-zA-Z0-9.-]+$/.test(domain)) {
      details.push('✓ Domain contains valid characters')
    } else {
      details.push('❌ Domain contains invalid characters')
    }

    const domainParts = domain ? domain.split('.') : []
    if (domainParts.length >= 2) {
      details.push('✓ Domain has at least two parts')
    } else {
      details.push('❌ Domain must have at least two parts (e.g., example.com)')
    }

    const tld = domainParts[domainParts.length - 1]
    if (tld && tld.length >= 2) {
      details.push('✓ Top-level domain is valid')
    } else {
      details.push('❌ Top-level domain must be at least 2 characters')
    }

    // Overall validation
    const hasErrors = details.some(d => d.startsWith('❌'))

    setResult({
      valid: !hasErrors,
      message: hasErrors ? 'Email has validation errors' : 'Email is valid',
      details
    })
  }

  const getResultColor = () => {
    if (!result) return ''
    return result.valid
      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
      : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
  }

  const getResultTextColor = () => {
    if (!result) return ''
    return result.valid
      ? 'text-green-900 dark:text-green-100'
      : 'text-red-900 dark:text-red-100'
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Email Address
        </label>
        <input
          type="text"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setResult(null)
          }}
          className="input w-full font-mono"
          placeholder="example@domain.com"
          onKeyDown={(e) => e.key === 'Enter' && validateEmail()}
        />
      </div>

      <button onClick={validateEmail} className="btn btn-primary w-full">
        Validate Email
      </button>

      {result && (
        <div className={`border-2 rounded-lg p-4 ${getResultColor()}`}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">
              {result.valid ? '✅' : '❌'}
            </span>
            <h3 className={`text-lg font-semibold ${getResultTextColor()}`}>
              {result.message}
            </h3>
          </div>

          <div className="space-y-2">
            <h4 className={`text-sm font-medium ${getResultTextColor()}`}>
              Validation Details:
            </h4>
            {result.details.map((detail, index) => (
              <div
                key={index}
                className={`text-sm ${getResultTextColor()} opacity-90`}
              >
                {detail}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2 text-sm">Validation Rules</h4>
        <ul className="space-y-1 text-blue-800 dark:text-blue-200 text-xs">
          <li>• Local part (before @) must be 1-64 characters</li>
          <li>• Domain (after @) must be 1-255 characters</li>
          <li>• No consecutive dots allowed</li>
          <li>• Cannot start or end with a dot</li>
          <li>• Domain must have at least 2 parts (e.g., example.com)</li>
          <li>• Top-level domain must be at least 2 characters</li>
        </ul>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2 text-sm">Examples</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {[
            'user@example.com',
            'john.doe@company.co.uk',
            'support@my-site.org',
            'admin+tag@domain.io',
          ].map((example) => (
            <button
              key={example}
              onClick={() => {
                setEmail(example)
                setResult(null)
              }}
              className="text-left text-sm px-3 py-2 rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:border-primary-500 transition-colors font-mono"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

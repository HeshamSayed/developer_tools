import { useState } from 'react'
import { generatePassword } from '@/services/api'
import CopyButton from '@/components/Common/CopyButton'

export default function PasswordGenerator() {
  const [passwords, setPasswords] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [options, setOptions] = useState({
    length: 16,
    include_uppercase: true,
    include_lowercase: true,
    include_numbers: true,
    include_symbols: true,
    exclude_ambiguous: false,
    quantity: 5,
  })

  const handleGenerate = async () => {
    setLoading(true)
    setError('')
    setPasswords([])

    try {
      const result = await generatePassword(options)
      if (result.success) {
        setPasswords(result.passwords)
      } else {
        setError(result.error || 'An error occurred')
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate passwords')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Password Length: {options.length}
          </label>
          <input
            type="range"
            min="4"
            max="128"
            value={options.length}
            onChange={(e) => setOptions({ ...options, length: Number(e.target.value) })}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Quantity: {options.quantity}
          </label>
          <input
            type="range"
            min="1"
            max="50"
            value={options.quantity}
            onChange={(e) => setOptions({ ...options, quantity: Number(e.target.value) })}
            className="w-full"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Character Types
        </label>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={options.include_uppercase}
              onChange={(e) => setOptions({ ...options, include_uppercase: e.target.checked })}
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Uppercase (A-Z)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={options.include_lowercase}
              onChange={(e) => setOptions({ ...options, include_lowercase: e.target.checked })}
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Lowercase (a-z)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={options.include_numbers}
              onChange={(e) => setOptions({ ...options, include_numbers: e.target.checked })}
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Numbers (0-9)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={options.include_symbols}
              onChange={(e) => setOptions({ ...options, include_symbols: e.target.checked })}
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Symbols (!@#$%^&*)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={options.exclude_ambiguous}
              onChange={(e) => setOptions({ ...options, exclude_ambiguous: e.target.checked })}
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Exclude ambiguous (il1Lo0O)</span>
          </label>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="btn btn-primary px-8"
        >
          {loading ? 'Generating...' : 'Generate Passwords'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      {passwords.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Generated Passwords
          </h3>
          {passwords.map((password, index) => (
            <div key={index} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 flex justify-between items-center">
              <code className="text-sm text-gray-800 dark:text-gray-200 font-mono flex-1">
                {password}
              </code>
              <CopyButton text={password} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { generatePassword } from '@/services/api'
import CopyButton from '@/components/Common/CopyButton'

type PasswordMode = 'random' | 'memorable' | 'pin' | 'custom'
type Preset = 'weak' | 'medium' | 'strong' | 'ultra'

interface PasswordStrength {
  score: number
  label: string
  color: string
  feedback: string[]
}

export default function PasswordGenerator() {
  const [passwords, setPasswords] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState<PasswordMode>('random')
  const [options, setOptions] = useState({
    length: 16,
    include_uppercase: true,
    include_lowercase: true,
    include_numbers: true,
    include_symbols: true,
    exclude_ambiguous: false,
    quantity: 5,
  })
  const [customCharset, setCustomCharset] = useState('')
  const [wordCount, setWordCount] = useState(4)
  const [wordSeparator, setWordSeparator] = useState('-')
  const [pinLength, setPinLength] = useState(6)
  const [strengthScores, setStrengthScores] = useState<PasswordStrength[]>([])

  // Calculate password strength
  const calculateStrength = (password: string): PasswordStrength => {
    let score = 0
    const feedback: string[] = []

    // Length check
    if (password.length >= 8) score += 1
    if (password.length >= 12) score += 1
    if (password.length >= 16) score += 1

    // Character diversity
    if (/[a-z]/.test(password)) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/[0-9]/.test(password)) score += 1
    if (/[^a-zA-Z0-9]/.test(password)) score += 1

    // Entropy check
    const uniqueChars = new Set(password).size
    if (uniqueChars > password.length * 0.5) score += 1

    // Feedback
    if (password.length < 8) feedback.push('Use at least 8 characters')
    if (!/[a-z]/.test(password)) feedback.push('Add lowercase letters')
    if (!/[A-Z]/.test(password)) feedback.push('Add uppercase letters')
    if (!/[0-9]/.test(password)) feedback.push('Add numbers')
    if (!/[^a-zA-Z0-9]/.test(password)) feedback.push('Add special characters')

    let label = 'Weak'
    let color = 'red'
    if (score >= 6) {
      label = 'Strong'
      color = 'green'
    } else if (score >= 4) {
      label = 'Medium'
      color = 'yellow'
    }

    return { score, label, color, feedback }
  }

  // Apply preset
  const applyPreset = (preset: Preset) => {
    switch (preset) {
      case 'weak':
        setOptions({
          ...options,
          length: 8,
          include_uppercase: true,
          include_lowercase: true,
          include_numbers: false,
          include_symbols: false,
        })
        break
      case 'medium':
        setOptions({
          ...options,
          length: 12,
          include_uppercase: true,
          include_lowercase: true,
          include_numbers: true,
          include_symbols: false,
        })
        break
      case 'strong':
        setOptions({
          ...options,
          length: 16,
          include_uppercase: true,
          include_lowercase: true,
          include_numbers: true,
          include_symbols: true,
        })
        break
      case 'ultra':
        setOptions({
          ...options,
          length: 32,
          include_uppercase: true,
          include_lowercase: true,
          include_numbers: true,
          include_symbols: true,
        })
        break
    }
  }

  // Generate memorable password (word-based)
  const generateMemorablePassword = () => {
    const words = [
      'apple', 'banana', 'cherry', 'dragon', 'eagle', 'falcon', 'garden', 'harbor',
      'island', 'jungle', 'kitten', 'lemon', 'mountain', 'ninja', 'ocean', 'planet',
      'queen', 'river', 'sunset', 'tiger', 'umbrella', 'village', 'wizard', 'yellow'
    ]

    const passwords: string[] = []
    for (let i = 0; i < options.quantity; i++) {
      const selectedWords: string[] = []
      for (let j = 0; j < wordCount; j++) {
        const word = words[Math.floor(Math.random() * words.length)]
        const capitalizedWord = word.charAt(0).toUpperCase() + word.slice(1)
        selectedWords.push(capitalizedWord)
      }

      let password = selectedWords.join(wordSeparator)

      // Add random number at the end
      if (options.include_numbers) {
        password += Math.floor(Math.random() * 100)
      }

      // Add random symbol at the end
      if (options.include_symbols) {
        const symbols = '!@#$%^&*'
        password += symbols[Math.floor(Math.random() * symbols.length)]
      }

      passwords.push(password)
    }
    return passwords
  }

  // Generate PIN
  const generatePIN = () => {
    const passwords: string[] = []
    for (let i = 0; i < options.quantity; i++) {
      let pin = ''
      for (let j = 0; j < pinLength; j++) {
        pin += Math.floor(Math.random() * 10)
      }
      passwords.push(pin)
    }
    return passwords
  }

  // Generate custom charset password
  const generateCustomPassword = () => {
    if (!customCharset) return []

    const passwords: string[] = []
    for (let i = 0; i < options.quantity; i++) {
      let password = ''
      for (let j = 0; j < options.length; j++) {
        password += customCharset[Math.floor(Math.random() * customCharset.length)]
      }
      passwords.push(password)
    }
    return passwords
  }

  const handleGenerate = async () => {
    setLoading(true)
    setError('')
    setPasswords([])
    setStrengthScores([])

    try {
      let generatedPasswords: string[] = []

      if (mode === 'memorable') {
        generatedPasswords = generateMemorablePassword()
      } else if (mode === 'pin') {
        generatedPasswords = generatePIN()
      } else if (mode === 'custom') {
        if (!customCharset) {
          setError('Please enter a custom character set')
          setLoading(false)
          return
        }
        generatedPasswords = generateCustomPassword()
      } else {
        // Random mode - use API
        const result = await generatePassword(options)
        if (result.success) {
          generatedPasswords = result.passwords
        } else {
          setError(result.error || 'An error occurred')
          setLoading(false)
          return
        }
      }

      setPasswords(generatedPasswords)

      // Calculate strength for each password
      const strengths = generatedPasswords.map(pwd => calculateStrength(pwd))
      setStrengthScores(strengths)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate passwords')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    const content = passwords.join('\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'passwords.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const copyAllPasswords = () => {
    navigator.clipboard.writeText(passwords.join('\n'))
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 items-center justify-between bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <div className="flex flex-wrap gap-2">
          {passwords.length > 0 && (
            <>
              <button
                onClick={copyAllPasswords}
                className="btn btn-secondary text-sm"
                title="Copy all passwords"
              >
                📋 Copy All
              </button>
              <button
                onClick={handleDownload}
                className="btn btn-secondary text-sm"
                title="Download passwords"
              >
                💾 Download
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mode Selection */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Password Mode:
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="random"
              checked={mode === 'random'}
              onChange={(e) => setMode(e.target.value as PasswordMode)}
              className="w-4 h-4 text-primary-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              🎲 Random
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="memorable"
              checked={mode === 'memorable'}
              onChange={(e) => setMode(e.target.value as PasswordMode)}
              className="w-4 h-4 text-primary-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              💭 Memorable
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="pin"
              checked={mode === 'pin'}
              onChange={(e) => setMode(e.target.value as PasswordMode)}
              className="w-4 h-4 text-primary-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              🔢 PIN
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="custom"
              checked={mode === 'custom'}
              onChange={(e) => setMode(e.target.value as PasswordMode)}
              className="w-4 h-4 text-primary-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              ⚙️ Custom
            </span>
          </label>
        </div>
      </div>

      {/* Presets for Random Mode */}
      {mode === 'random' && (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Quick Presets:
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => applyPreset('weak')}
              className="px-3 py-1 text-sm bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100 rounded hover:bg-red-200 dark:hover:bg-red-800"
            >
              Weak (8 chars)
            </button>
            <button
              onClick={() => applyPreset('medium')}
              className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-100 rounded hover:bg-yellow-200 dark:hover:bg-yellow-800"
            >
              Medium (12 chars)
            </button>
            <button
              onClick={() => applyPreset('strong')}
              className="px-3 py-1 text-sm bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100 rounded hover:bg-green-200 dark:hover:bg-green-800"
            >
              Strong (16 chars)
            </button>
            <button
              onClick={() => applyPreset('ultra')}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
            >
              Ultra (32 chars)
            </button>
          </div>
        </div>
      )}

      {/* Random Mode Options */}
      {mode === 'random' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password Length: <span className="font-bold text-primary-600">{options.length}</span>
              </label>
              <input
                type="range"
                min="4"
                max="128"
                value={options.length}
                onChange={(e) => setOptions({ ...options, length: Number(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>4</span>
                <span>128</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quantity: <span className="font-bold text-primary-600">{options.quantity}</span>
              </label>
              <input
                type="range"
                min="1"
                max="50"
                value={options.quantity}
                onChange={(e) => setOptions({ ...options, quantity: Number(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1</span>
                <span>50</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Character Types:
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.include_uppercase}
                  onChange={(e) => setOptions({ ...options, include_uppercase: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Uppercase <code className="text-xs">(A-Z)</code>
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.include_lowercase}
                  onChange={(e) => setOptions({ ...options, include_lowercase: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Lowercase <code className="text-xs">(a-z)</code>
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.include_numbers}
                  onChange={(e) => setOptions({ ...options, include_numbers: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Numbers <code className="text-xs">(0-9)</code>
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.include_symbols}
                  onChange={(e) => setOptions({ ...options, include_symbols: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Symbols <code className="text-xs">(!@#$%^&*)</code>
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.exclude_ambiguous}
                  onChange={(e) => setOptions({ ...options, exclude_ambiguous: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Exclude ambiguous <code className="text-xs">(il1Lo0O)</code>
                </span>
              </label>
            </div>
          </div>
        </>
      )}

      {/* Memorable Mode Options */}
      {mode === 'memorable' && (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Word Count: <span className="font-bold text-primary-600">{wordCount}</span>
              </label>
              <input
                type="range"
                min="2"
                max="8"
                value={wordCount}
                onChange={(e) => setWordCount(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Word Separator:
              </label>
              <input
                type="text"
                value={wordSeparator}
                onChange={(e) => setWordSeparator(e.target.value)}
                maxLength={3}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quantity: <span className="font-bold text-primary-600">{options.quantity}</span>
              </label>
              <input
                type="range"
                min="1"
                max="20"
                value={options.quantity}
                onChange={(e) => setOptions({ ...options, quantity: Number(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={options.include_numbers}
                onChange={(e) => setOptions({ ...options, include_numbers: e.target.checked })}
                className="w-4 h-4 text-primary-600 rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Add numbers at end
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={options.include_symbols}
                onChange={(e) => setOptions({ ...options, include_symbols: e.target.checked })}
                className="w-4 h-4 text-primary-600 rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Add symbol at end
              </span>
            </label>
          </div>

          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-blue-800 dark:text-blue-200">
            <strong>Example:</strong> Dragon-Eagle-Harbor-Ninja42!
          </div>
        </div>
      )}

      {/* PIN Mode Options */}
      {mode === 'pin' && (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                PIN Length: <span className="font-bold text-primary-600">{pinLength}</span>
              </label>
              <input
                type="range"
                min="4"
                max="12"
                value={pinLength}
                onChange={(e) => setPinLength(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>4</span>
                <span>12</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quantity: <span className="font-bold text-primary-600">{options.quantity}</span>
              </label>
              <input
                type="range"
                min="1"
                max="20"
                value={options.quantity}
                onChange={(e) => setOptions({ ...options, quantity: Number(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* Custom Mode Options */}
      {mode === 'custom' && (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Custom Character Set:
            </label>
            <input
              type="text"
              value={customCharset}
              onChange={(e) => setCustomCharset(e.target.value)}
              placeholder="Enter characters to use (e.g., abc123!@#)"
              className="w-full px-3 py-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono"
            />
            <p className="text-xs text-gray-500 mt-1">
              {customCharset.length} unique characters available
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password Length: <span className="font-bold text-primary-600">{options.length}</span>
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
                Quantity: <span className="font-bold text-primary-600">{options.quantity}</span>
              </label>
              <input
                type="range"
                min="1"
                max="20"
                value={options.quantity}
                onChange={(e) => setOptions({ ...options, quantity: Number(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* Generate Button */}
      <div className="flex justify-center">
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="btn btn-primary px-8"
        >
          {loading ? 'Generating...' : '🔐 Generate Passwords'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-red-900 dark:text-red-100 mb-2">
            ❌ Error
          </h3>
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      {/* Generated Passwords */}
      {passwords.length > 0 && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Generated Passwords ({passwords.length})
            </h3>
          </div>
          {passwords.map((password, index) => (
            <div key={index} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <code className="text-sm text-gray-800 dark:text-gray-200 font-mono flex-1 break-all">
                  {password}
                </code>
                <CopyButton text={password} />
              </div>

              {/* Strength Indicator */}
              {strengthScores[index] && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Strength:</span>
                    <span className={`text-xs font-semibold ${
                      strengthScores[index].color === 'green' ? 'text-green-600 dark:text-green-400' :
                      strengthScores[index].color === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-red-600 dark:text-red-400'
                    }`}>
                      {strengthScores[index].label}
                    </span>
                  </div>

                  {/* Strength Bar */}
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        strengthScores[index].color === 'green' ? 'bg-green-500' :
                        strengthScores[index].color === 'yellow' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${(strengthScores[index].score / 8) * 100}%` }}
                    />
                  </div>

                  {/* Feedback */}
                  {strengthScores[index].feedback.length > 0 && (
                    <div className="text-xs text-gray-500 space-y-1">
                      {strengthScores[index].feedback.map((fb, i) => (
                        <div key={i}>• {fb}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

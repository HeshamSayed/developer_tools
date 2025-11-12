import { useState, useRef } from 'react'
import { generateHash } from '@/services/api'
import CopyButton from '@/components/Common/CopyButton'

type InputMode = 'text' | 'file'
type HashMode = 'standard' | 'hmac'

export default function HashGenerator() {
  const [inputMode, setInputMode] = useState<InputMode>('text')
  const [hashMode, setHashMode] = useState<HashMode>('standard')
  const [input, setInput] = useState('')
  const [hashes, setHashes] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedAlgorithms, setSelectedAlgorithms] = useState({
    md5: true,
    sha1: true,
    sha256: true,
    sha512: true,
    sha224: false,
    sha384: false,
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [hmacKey, setHmacKey] = useState('')
  const [uppercase, setUppercase] = useState(false)
  const [salt, setSalt] = useState('')
  const [verifyHash, setVerifyHash] = useState('')
  const [verifyAlgorithm, setVerifyAlgorithm] = useState('sha256')
  const [verificationResult, setVerificationResult] = useState<boolean | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    setError('')

    // Read file content for text files (< 1MB)
    if (file.size < 1024 * 1024 && file.type.startsWith('text/')) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setInput(event.target?.result as string)
      }
      reader.readAsText(file)
    } else {
      // For larger files or binary files, we'll hash directly
      const reader = new FileReader()
      reader.onload = async (event) => {
        const content = event.target?.result as string
        setInput(content)
      }
      reader.readAsText(file)
    }
  }

  const handleGenerate = async () => {
    setLoading(true)
    setError('')
    setHashes({})
    setVerificationResult(null)

    const algorithms = Object.entries(selectedAlgorithms)
      .filter(([_, selected]) => selected)
      .map(([algo]) => algo)

    if (algorithms.length === 0) {
      setError('Please select at least one algorithm')
      setLoading(false)
      return
    }

    if (hashMode === 'hmac' && !hmacKey) {
      setError('HMAC mode requires a secret key')
      setLoading(false)
      return
    }

    try {
      let textToHash = input

      // Add salt if specified
      if (salt) {
        textToHash = salt + textToHash
      }

      // Add HMAC key if in HMAC mode
      if (hashMode === 'hmac') {
        textToHash = hmacKey + textToHash
      }

      const result = await generateHash(textToHash, algorithms)
      if (result.success) {
        let processedHashes = result.hashes

        // Apply uppercase formatting if needed
        if (uppercase) {
          processedHashes = Object.fromEntries(
            Object.entries(processedHashes).map(([algo, hash]) => [algo, String(hash as string).toUpperCase()])
          )
        }

        setHashes(processedHashes)

        // If verify hash is set, check if it matches
        if (verifyHash) {
          const generatedHash = processedHashes[verifyAlgorithm]
          const matchesVerify = generatedHash?.toLowerCase() === verifyHash.toLowerCase()
          setVerificationResult(matchesVerify)
        }
      } else {
        setError(result.error || 'An error occurred')
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate hashes')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    const content = Object.entries(hashes)
      .map(([algo, hash]) => `${algo.toUpperCase()}: ${hash}`)
      .join('\n')

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'hashes.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleClear = () => {
    setInput('')
    setHashes({})
    setError('')
    setSelectedFile(null)
    setSalt('')
    setHmacKey('')
    setVerifyHash('')
    setVerificationResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const loadSample = () => {
    setInputMode('text')
    setInput('Hello, World! This is a sample text for hash generation.')
  }

  const selectAllAlgorithms = () => {
    setSelectedAlgorithms({
      md5: true,
      sha1: true,
      sha256: true,
      sha512: true,
      sha224: true,
      sha384: true,
    })
  }

  const deselectAllAlgorithms = () => {
    setSelectedAlgorithms({
      md5: false,
      sha1: false,
      sha256: false,
      sha512: false,
      sha224: false,
      sha384: false,
    })
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 items-center justify-between bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={loadSample}
            className="btn btn-secondary text-sm"
            title="Load sample text"
          >
            📋 Sample
          </button>
          <button
            onClick={handleClear}
            className="btn btn-secondary text-sm"
            title="Clear all"
          >
            🗑️ Clear
          </button>
          {Object.keys(hashes).length > 0 && (
            <button
              onClick={handleDownload}
              className="btn btn-secondary text-sm"
              title="Download hashes"
            >
              💾 Download
            </button>
          )}
        </div>
      </div>

      {/* Mode Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Input Mode */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Input Mode:
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="text"
                checked={inputMode === 'text'}
                onChange={(e) => setInputMode(e.target.value as InputMode)}
                className="w-4 h-4 text-primary-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                📝 Text
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="file"
                checked={inputMode === 'file'}
                onChange={(e) => setInputMode(e.target.value as InputMode)}
                className="w-4 h-4 text-primary-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                📁 File
              </span>
            </label>
          </div>
        </div>

        {/* Hash Mode */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Hash Mode:
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="standard"
                checked={hashMode === 'standard'}
                onChange={(e) => setHashMode(e.target.value as HashMode)}
                className="w-4 h-4 text-primary-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Standard
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="hmac"
                checked={hashMode === 'hmac'}
                onChange={(e) => setHashMode(e.target.value as HashMode)}
                className="w-4 h-4 text-primary-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                HMAC (keyed hash)
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Algorithm Selection */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Hash Algorithms:
          </label>
          <div className="flex gap-2">
            <button
              onClick={selectAllAlgorithms}
              className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400"
            >
              Select All
            </button>
            <span className="text-gray-400">|</span>
            <button
              onClick={deselectAllAlgorithms}
              className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400"
            >
              Deselect All
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(selectedAlgorithms).map(([algo, selected]) => (
            <label key={algo} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selected}
                onChange={(e) =>
                  setSelectedAlgorithms({ ...selectedAlgorithms, [algo]: e.target.checked })
                }
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 uppercase font-mono">
                {algo}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Advanced Options */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Advanced Options:
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
              Salt (prepended to input):
            </label>
            <input
              type="text"
              value={salt}
              onChange={(e) => setSalt(e.target.value)}
              placeholder="Optional salt value"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          {hashMode === 'hmac' && (
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                HMAC Secret Key (required):
              </label>
              <input
                type="text"
                value={hmacKey}
                onChange={(e) => setHmacKey(e.target.value)}
                placeholder="Enter secret key"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          )}

          <div className="flex items-center">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={uppercase}
                onChange={(e) => setUppercase(e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Uppercase output
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Input Section */}
      {inputMode === 'text' ? (
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Text to Hash
            </label>
            <span className="text-xs text-gray-500">
              {input.length} characters
            </span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="textarea font-mono"
            rows={8}
            placeholder="Enter text to generate hashes..."
          />
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            File to Hash
          </label>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="w-full"
            />
            {selectedFile && (
              <div className="mt-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Selected:</strong> {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  Size: {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
                <p className="text-xs text-gray-500">
                  Type: {selectedFile.type || 'Unknown'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hash Verification */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Verify Hash (Optional):
        </label>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <select
            value={verifyAlgorithm}
            onChange={(e) => setVerifyAlgorithm(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            {Object.keys(selectedAlgorithms).map((algo) => (
              <option key={algo} value={algo}>
                {algo.toUpperCase()}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={verifyHash}
            onChange={(e) => setVerifyHash(e.target.value)}
            placeholder="Enter hash to verify"
            className="md:col-span-3 px-3 py-2 text-sm font-mono border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
      </div>

      {/* Process Button */}
      <div className="flex justify-center">
        <button
          onClick={handleGenerate}
          disabled={loading || !input}
          className="btn btn-primary px-8"
        >
          {loading ? 'Generating...' : '🔐 Generate Hashes'}
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

      {/* Verification Result */}
      {verificationResult !== null && (
        <div className={`border-2 rounded-lg p-4 ${
          verificationResult
            ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
            : 'bg-red-50 dark:bg-red-900/20 border-red-500'
        }`}>
          <p className={`text-sm font-semibold ${
            verificationResult
              ? 'text-green-900 dark:text-green-100'
              : 'text-red-900 dark:text-red-100'
          }`}>
            {verificationResult ? '✅ Hash Match!' : '❌ Hash Mismatch!'}
          </p>
          <p className={`text-xs mt-1 ${
            verificationResult
              ? 'text-green-700 dark:text-green-200'
              : 'text-red-700 dark:text-red-200'
          }`}>
            {verificationResult
              ? 'The generated hash matches the verification hash.'
              : 'The generated hash does NOT match the verification hash.'}
          </p>
        </div>
      )}

      {/* Output Section */}
      {Object.keys(hashes).length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Generated Hashes:
          </h3>
          {Object.entries(hashes).map(([algo, hash]) => (
            <div key={algo} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white uppercase font-mono bg-primary-100 dark:bg-primary-900 px-2 py-1 rounded">
                    {algo}
                  </span>
                  <span className="text-xs text-gray-500">
                    {hash.length * 4} bits
                  </span>
                </div>
                <CopyButton text={hash} />
              </div>
              <code className="block text-xs text-gray-800 dark:text-gray-200 font-mono break-all bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700">
                {hash}
              </code>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

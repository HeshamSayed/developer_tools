import { useState } from 'react'
import { generateQRCode } from '@/services/api'

export default function QRGenerator() {
  const [text, setText] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [size, setSize] = useState(10)
  const [errorCorrection, setErrorCorrection] = useState('M')

  const handleGenerate = async () => {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await generateQRCode(text, size, errorCorrection)
      if (response.success) {
        setResult(response)
      } else {
        setError(response.error || 'An error occurred')
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate QR code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Text / URL
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="textarea"
          rows={4}
          placeholder="Enter text or URL to encode in QR code..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Error Correction
          </label>
          <select
            value={errorCorrection}
            onChange={(e) => setErrorCorrection(e.target.value)}
            className="input"
          >
            <option value="L">Low (7%)</option>
            <option value="M">Medium (15%)</option>
            <option value="Q">Quartile (25%)</option>
            <option value="H">High (30%)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Size: {size}
          </label>
          <input
            type="range"
            min="5"
            max="20"
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleGenerate}
          disabled={loading || !text}
          className="btn btn-primary px-8"
        >
          {loading ? 'Generating...' : 'Generate QR Code'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      {result && (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
            QR Code (ASCII Preview)
          </h3>
          <pre className="text-xs leading-tight overflow-x-auto">
            {result.ascii_qr}
          </pre>
          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            Size: {result.size}x{result.size} modules
          </p>
        </div>
      )}
    </div>
  )
}

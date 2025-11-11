import { useState } from 'react'
import { convertBinaryHex } from '@/services/api'
import CopyButton from '@/components/Common/CopyButton'
import { useNotification } from '@/contexts/NotificationContext'

export default function BinaryHexConverter() {
  const { showSuccess } = useNotification()
  const [input, setInput] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [inputType, setInputType] = useState<'decimal' | 'binary' | 'hex' | 'text'>('decimal')

  const handleConvert = async () => {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await convertBinaryHex(input, inputType)

      if (response.success) {
        setResult(response.result)
        showSuccess('Conversion completed successfully!')
      } else {
        setError(response.error || 'Failed to convert')
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to convert')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey && input && !loading) {
      handleConvert()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Input Type
        </label>
        <div className="flex flex-wrap gap-4">
          {['decimal', 'binary', 'hex', 'text'].map((type) => (
            <label key={type} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value={type}
                checked={inputType === type}
                onChange={(e) => setInputType(e.target.value as any)}
                className="w-4 h-4 text-primary-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                {type}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Input Value
        </label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          className="input"
          placeholder={
            inputType === 'decimal' ? '123' :
            inputType === 'binary' ? '1111011' :
            inputType === 'hex' ? '7B' :
            'Hello'
          }
        />
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleConvert}
          disabled={loading || !input}
          className="btn btn-primary px-8"
        >
          {loading ? 'Converting...' : 'Convert (Ctrl+Enter)'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          {result.decimal !== undefined && (
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">Decimal</h4>
                <CopyButton text={result.decimal.toString()} />
              </div>
              <p className="text-gray-900 dark:text-gray-100 font-mono break-all">
                {result.decimal}
              </p>
            </div>
          )}

          {result.binary && (
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">Binary</h4>
                <CopyButton text={result.binary} />
              </div>
              <p className="text-gray-900 dark:text-gray-100 font-mono break-all">
                {result.binary}
              </p>
            </div>
          )}

          {result.hexadecimal && (
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">Hexadecimal</h4>
                <CopyButton text={result.hexadecimal} />
              </div>
              <p className="text-gray-900 dark:text-gray-100 font-mono break-all">
                {result.hexadecimal}
              </p>
            </div>
          )}

          {result.octal && (
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">Octal</h4>
                <CopyButton text={result.octal} />
              </div>
              <p className="text-gray-900 dark:text-gray-100 font-mono break-all">
                {result.octal}
              </p>
            </div>
          )}

          {result.text && (
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">Text</h4>
                <CopyButton text={result.text} />
              </div>
              <p className="text-gray-900 dark:text-gray-100 font-mono break-all">
                {result.text}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

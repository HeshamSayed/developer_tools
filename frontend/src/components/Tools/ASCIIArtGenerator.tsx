import { useState } from 'react'
import { generateASCIIArt } from '@/services/api'
import CopyButton from '@/components/Common/CopyButton'

export default function ASCIIArtGenerator() {
  const [text, setText] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [font, setFont] = useState('standard')
  const [availableFonts, setAvailableFonts] = useState<string[]>([])

  const handleGenerate = async () => {
    setLoading(true)
    setError('')
    setOutput('')

    try {
      const result = await generateASCIIArt(text, font)

      if (result.success) {
        setOutput(result.result)
        if (result.available_fonts && availableFonts.length === 0) {
          setAvailableFonts(result.available_fonts)
        }
      } else {
        setError(result.error || 'Failed to generate ASCII art')
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate ASCII art')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey && text && !loading) {
      handleGenerate()
    }
  }

  const popularFonts = [
    'standard', 'slant', 'banner', 'big', 'block', 'bubble', 'digital',
    'ivrit', 'lean', 'mini', 'script', 'shadow', 'small', 'smscript',
    'smshadow', 'smslant', 'speed', 'starwars', 'stop', 'straight'
  ]

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Text to Convert
        </label>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyPress}
          className="input"
          placeholder="Hello World"
          maxLength={100}
        />
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Maximum 100 characters
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Font Style
        </label>
        <select
          value={font}
          onChange={(e) => setFont(e.target.value)}
          className="input"
        >
          <optgroup label="Popular Fonts">
            {popularFonts.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </optgroup>
          {availableFonts.length > 0 && (
            <optgroup label="All Available Fonts">
              {availableFonts
                .filter(f => !popularFonts.includes(f))
                .map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
            </optgroup>
          )}
        </select>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleGenerate}
          disabled={loading || !text}
          className="btn btn-primary px-8"
        >
          {loading ? 'Generating...' : 'Generate ASCII Art (Ctrl+Enter)'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      {output && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              ASCII Art
            </label>
            <CopyButton text={output} />
          </div>
          <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-900 dark:bg-gray-950 overflow-x-auto">
            <pre className="text-green-400 font-mono text-xs leading-tight whitespace-pre">
              {output}
            </pre>
          </div>
        </div>
      )}

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">💡 Tips</h4>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
          <li>Shorter text works better for most fonts</li>
          <li>Try different fonts to see which style fits your needs</li>
          <li>Use ASCII art in comments, documentation, or terminal output</li>
          <li>Perfect for creating banners and headers</li>
        </ul>
      </div>
    </div>
  )
}

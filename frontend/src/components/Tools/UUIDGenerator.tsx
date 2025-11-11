import { useState } from 'react'
import { generateUUID } from '@/services/api'
import CopyButton from '@/components/Common/CopyButton'

export default function UUIDGenerator() {
  const [uuids, setUuids] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [version, setVersion] = useState(4)
  const [quantity, setQuantity] = useState(5)

  const handleGenerate = async () => {
    setLoading(true)

    try {
      const response = await generateUUID(version, quantity)
      if (response.success) {
        setUuids(response.uuids)
      }
    } catch (err) {
      console.error('Failed to generate UUIDs', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            UUID Version
          </label>
          <select
            value={version}
            onChange={(e) => setVersion(Number(e.target.value))}
            className="input"
          >
            <option value={1}>Version 1 (Timestamp)</option>
            <option value={4}>Version 4 (Random)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Quantity: {quantity}
          </label>
          <input
            type="range"
            min="1"
            max="100"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="btn btn-primary px-8"
        >
          {loading ? 'Generating...' : 'Generate UUIDs'}
        </button>
      </div>

      {uuids.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Generated UUIDs
          </h3>
          {uuids.map((uuid, index) => (
            <div key={index} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 flex justify-between items-center">
              <code className="text-sm text-gray-800 dark:text-gray-200 font-mono">
                {uuid}
              </code>
              <CopyButton text={uuid} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

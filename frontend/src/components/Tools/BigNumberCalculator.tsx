import { useState } from 'react'
import { utilityTools } from '@/services/backendApi'

export default function BigNumberCalculator() {
  const [num1, setNum1] = useState('')
  const [num2, setNum2] = useState('')
  const [operation, setOperation] = useState<'add' | 'subtract' | 'multiply' | 'divide' | 'power' | 'modulo'>('add')
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const calculate = async () => {
    setError('')
    setResult('')

    if (!num1.trim() || !num2.trim()) {
      setError('Please enter both numbers')
      return
    }

    try {
      setLoading(true)
      const response = await utilityTools.bigNumber({ num1, num2, operation })
      if (response.success) {
        setResult(response.result)
      } else {
        setError('Calculation failed')
      }
    } catch (err: any) {
      setError(err.message || 'Invalid input - please enter valid integers')
    } finally {
      setLoading(false)
    }
  }

  const loadSample = () => {
    setNum1('9999999999999999999999999999')
    setNum2('8888888888888888888888888888')
    setOperation('add')
  }

  const handleClear = () => {
    setNum1('')
    setNum2('')
    setResult('')
    setError('')
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <button onClick={loadSample} className="btn btn-secondary text-sm">Sample</button>
        <button onClick={handleClear} className="btn btn-secondary text-sm">Clear</button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">First Number</label>
        <input type="text" value={num1} onChange={(e) => setNum1(e.target.value)} className="input font-mono" placeholder="Enter large integer..." />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Operation</label>
        <select value={operation} onChange={(e) => setOperation(e.target.value as any)} className="input">
          <option value="add">Addition (+)</option>
          <option value="subtract">Subtraction (-)</option>
          <option value="multiply">Multiplication (×)</option>
          <option value="divide">Division (÷)</option>
          <option value="power">Power (^)</option>
          <option value="modulo">Modulo (%)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Second Number</label>
        <input type="text" value={num2} onChange={(e) => setNum2(e.target.value)} className="input font-mono" placeholder="Enter large integer..." />
      </div>

      <div className="flex justify-center">
        <button onClick={calculate} disabled={!num1.trim() || !num2.trim() || loading} className="btn btn-primary px-8">
          {loading ? 'Calculating...' : 'Calculate'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      {result && (
        <div className="card bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Result</label>
          <div className="font-mono text-2xl text-green-700 dark:text-green-300 break-all">{result}</div>
          <div className="text-xs text-gray-500 mt-2">{result.length} digits</div>
        </div>
      )}
    </div>
  )
}

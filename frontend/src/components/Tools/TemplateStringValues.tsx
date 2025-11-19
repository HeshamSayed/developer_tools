import { useState } from 'react'
import CopyButton from '@/components/Common/CopyButton'
import { utilityTools } from '@/services/backendApi'

export default function TemplateStringValues() {
  const [template, setTemplate] = useState('')
  const [values, setValues] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleReplace = async () => {
    setError('')
    setOutput('')

    if (!template.trim()) {
      setError('Please enter a template')
      return
    }

    if (!values.trim()) {
      setError('Please enter values (JSON object)')
      return
    }

    try {
      setLoading(true)
      const response = await utilityTools.templateString({ template, values })
      if (response.success) {
        setOutput(response.result)
      } else {
        setError('Replacement failed')
      }
    } catch (err: any) {
      setError(err.message || 'Invalid JSON values')
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setTemplate('')
    setValues('')
    setOutput('')
    setError('')
  }

  const loadSample = () => {
    setTemplate(`Hello {{name}}!

Your order #\${orderId} has been confirmed.
Total amount: \${amount}
Delivery to: {address}

Thank you for your purchase!`)
    setValues(`{
  "name": "John Doe",
  "orderId": "12345",
  "amount": "$99.99",
  "address": "123 Main St, New York"
}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <button onClick={loadSample} className="btn btn-secondary text-sm">Sample</button>
        <button onClick={handleClear} className="btn btn-secondary text-sm">Clear</button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Template (use <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">{'{{var}}'}</code>, <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">{'${var}'}</code>, or <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">{'{var}'}</code>)
        </label>
        <textarea value={template} onChange={(e) => setTemplate(e.target.value)} className="textarea font-mono" rows={8} placeholder="Enter template with placeholders..." />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Values (JSON Object)</label>
        <textarea value={values} onChange={(e) => setValues(e.target.value)} className="textarea font-mono" rows={6} placeholder='{"name": "John", "age": 30}' />
      </div>

      <div className="flex justify-center">
        <button onClick={handleReplace} disabled={!template.trim() || !values.trim() || loading} className="btn btn-primary px-8">
          {loading ? 'Processing...' : 'Replace Placeholders'}
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Result</label>
            <CopyButton text={output} />
          </div>
          <textarea value={output} readOnly className="textarea bg-gray-50 dark:bg-gray-900 font-mono" rows={10} />
        </div>
      )}
    </div>
  )
}

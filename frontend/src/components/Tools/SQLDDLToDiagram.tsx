import { useState } from 'react'
import { utilityTools } from '@/services/backendApi'

export default function SQLDDLToDiagram() {
  const [input, setInput] = useState('')
  const [tables, setTables] = useState<any[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleParse = async () => {
    setError('')
    setTables([])

    if (!input.trim()) {
      setError('Please enter SQL DDL')
      return
    }

    try {
      setLoading(true)
      const response = await utilityTools.sqlDdlDiagram({ input })
      if (response.success) {
        // Convert snake_case to camelCase for frontend
        const convertedTables = response.tables.map(table => ({
          name: table.name,
          columns: table.columns.map(col => ({
            name: col.name,
            type: col.type,
            isPrimary: col.is_primary,
            isNotNull: col.is_not_null,
            isUnique: col.is_unique,
          }))
        }))
        if (convertedTables.length === 0) {
          setError('No CREATE TABLE statements found')
          return
        }
        setTables(convertedTables)
      } else {
        setError('Parsing failed')
      }
    } catch (err: any) {
      setError(err.message || 'Error parsing DDL')
    } finally {
      setLoading(false)
    }
  }

  const loadSample = () => {
    setInput(`CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);`)
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <button onClick={loadSample} className="btn btn-secondary text-sm">Sample</button>
        <button onClick={() => { setInput(''); setTables([]); setError('') }} className="btn btn-secondary text-sm">Clear</button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">SQL DDL (CREATE TABLE statements)</label>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} className="textarea font-mono text-sm" rows={12} placeholder="Enter SQL DDL here..." />
      </div>

      <div className="flex justify-center">
        <button onClick={handleParse} disabled={!input.trim() || loading} className="btn btn-primary px-8">
          {loading ? 'Processing...' : 'Generate Diagram'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      {tables.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-4">Database Schema Diagram</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tables.map((table, i) => (
              <div key={i} className="card border-2 border-primary-200 dark:border-primary-800">
                <h4 className="text-lg font-bold text-primary-600 dark:text-primary-400 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                  {table.name}
                </h4>
                <div className="space-y-1">
                  {table.columns.map((col: any, j: number) => (
                    <div key={j} className={`text-sm font-mono p-2 rounded ${col.isPrimary ? 'bg-yellow-50 dark:bg-yellow-900/20 border-l-2 border-yellow-500' : 'bg-gray-50 dark:bg-gray-800'}`}>
                      <div className="flex items-center gap-2">
                        {col.isPrimary && <span className="text-yellow-600 dark:text-yellow-400 text-xs font-bold">PK</span>}
                        <span className="font-semibold text-gray-900 dark:text-gray-100">{col.name}</span>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {col.type}
                        {col.isNotNull && <span className="ml-2 text-red-600 dark:text-red-400">NOT NULL</span>}
                        {col.isUnique && <span className="ml-2 text-blue-600 dark:text-blue-400">UNIQUE</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

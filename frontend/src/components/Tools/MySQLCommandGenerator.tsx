import { useState } from 'react'
import CopyButton from '@/components/Common/CopyButton'
import { commandGenerators } from '@/services/backendApi'

export default function MySQLCommandGenerator() {
  const [commandType, setCommandType] = useState<'select' | 'insert' | 'update' | 'delete' | 'create'>('select')
  const [tableName, setTableName] = useState('users')
  const [columns, setColumns] = useState('id, name, email')
  const [whereClause, setWhereClause] = useState('id = 1')
  const [values, setValues] = useState("'John', 'john@example.com'")
  const [setClause, setSetClause] = useState("name = 'John Doe'")
  const [tableSchema, setTableSchema] = useState(`id INT AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(100),
email VARCHAR(100)`)
  const [command, setCommand] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const generateCommand = async () => {
    setError('')
    setCommand('')

    try {
      setLoading(true)
      const response = await commandGenerators.mysqlCommand({
        command_type: commandType,
        table_name: tableName,
        columns: columns || undefined,
        where_clause: whereClause || undefined,
        values: values || undefined,
        set_clause: setClause || undefined,
        table_schema: tableSchema || undefined
      })
      if (response.success) {
        setCommand(response.result)
      } else {
        setError('Command generation failed')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const loadSample = (type: typeof commandType) => {
    setCommandType(type)
    setTimeout(generateCommand, 100)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <button onClick={() => loadSample('select')} className="btn btn-secondary text-sm">SELECT</button>
        <button onClick={() => loadSample('insert')} className="btn btn-secondary text-sm">INSERT</button>
        <button onClick={() => loadSample('update')} className="btn btn-secondary text-sm">UPDATE</button>
        <button onClick={() => loadSample('delete')} className="btn btn-secondary text-sm">DELETE</button>
        <button onClick={() => loadSample('create')} className="btn btn-secondary text-sm">CREATE TABLE</button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Command Type</label>
        <select value={commandType} onChange={(e) => setCommandType(e.target.value as any)} className="input">
          <option value="select">SELECT</option>
          <option value="insert">INSERT</option>
          <option value="update">UPDATE</option>
          <option value="delete">DELETE</option>
          <option value="create">CREATE TABLE</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Table Name</label>
        <input type="text" value={tableName} onChange={(e) => setTableName(e.target.value)} className="input" placeholder="users" />
      </div>

      {(commandType === 'select' || commandType === 'insert') && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Columns (comma-separated)</label>
          <input type="text" value={columns} onChange={(e) => setColumns(e.target.value)} className="input" placeholder="id, name, email" />
        </div>
      )}

      {(commandType === 'select' || commandType === 'update' || commandType === 'delete') && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">WHERE Clause</label>
          <input type="text" value={whereClause} onChange={(e) => setWhereClause(e.target.value)} className="input" placeholder="id = 1" />
        </div>
      )}

      {commandType === 'insert' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">VALUES</label>
          <input type="text" value={values} onChange={(e) => setValues(e.target.value)} className="input" placeholder="'John', 'john@example.com'" />
        </div>
      )}

      {commandType === 'update' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">SET Clause</label>
          <input type="text" value={setClause} onChange={(e) => setSetClause(e.target.value)} className="input" placeholder="name = 'John Doe'" />
        </div>
      )}

      {commandType === 'create' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Table Schema</label>
          <textarea value={tableSchema} onChange={(e) => setTableSchema(e.target.value)} className="textarea font-mono" rows={6} placeholder="id INT AUTO_INCREMENT PRIMARY KEY..." />
        </div>
      )}

      <div className="flex justify-center">
        <button onClick={generateCommand} disabled={loading} className="btn btn-primary px-8">
          {loading ? 'Generating...' : 'Generate Command'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      {command && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Generated MySQL Command</label>
            <CopyButton text={command} />
          </div>
          <textarea value={command} readOnly className="textarea bg-gray-50 dark:bg-gray-900 font-mono" rows={8} />
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { pdfTools } from '@/services/backendApi'

interface Sheet {
  name: string
  data: string[][]
}

export default function ExcelGenerator() {
  const [sheets, setSheets] = useState<Sheet[]>([{
    name: 'Sheet1',
    data: [
      ['Column 1', 'Column 2', 'Column 3'],
      ['', '', ''],
      ['', '', ''],
    ]
  }])
  const [filename, setFilename] = useState<string>('spreadsheet')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string>('')

  const addSheet = () => {
    setSheets([...sheets, {
      name: `Sheet${sheets.length + 1}`,
      data: [['Column1', 'Column2', 'Column3'], ['', '', '']]
    }])
  }

  const removeSheet = (index: number) => {
    if (sheets.length === 1) {
      setError('At least one sheet is required')
      return
    }
    setSheets(sheets.filter((_, i) => i !== index))
  }

  const updateSheetName = (index: number, name: string) => {
    const newSheets = [...sheets]
    newSheets[index].name = name
    setSheets(newSheets)
  }

  const updateCell = (sheetIndex: number, rowIndex: number, colIndex: number, value: string) => {
    const newSheets = [...sheets]
    newSheets[sheetIndex].data[rowIndex][colIndex] = value
    setSheets(newSheets)
  }

  const addRow = (sheetIndex: number) => {
    const newSheets = [...sheets]
    const colCount = newSheets[sheetIndex].data[0]?.length || 3
    newSheets[sheetIndex].data.push(Array(colCount).fill(''))
    setSheets(newSheets)
  }

  const addColumn = (sheetIndex: number) => {
    const newSheets = [...sheets]
    newSheets[sheetIndex].data = newSheets[sheetIndex].data.map(row => [...row, ''])
    setSheets(newSheets)
  }

  const handleGenerate = async () => {
    setGenerating(true)
    setError('')

    try {
      const sheetsData = sheets.map(sheet => ({
        name: sheet.name,
        data: sheet.data,
        has_header: true
      }))

      const response = await pdfTools.createExcel({ sheets: sheetsData })

      if (response.success) {
        // Download the file
        const blob = new Blob([Uint8Array.from(atob(response.excel), c => c.charCodeAt(0))], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        const fileExtension = filename.toLowerCase().endsWith('.xlsx') ? '' : '.xlsx'
        a.download = `${filename}${fileExtension}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } else {
        setError('Failed to generate Excel file')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate Excel file')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
          Excel Generator
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Create professional Excel spreadsheets with multiple sheets, formatted headers, and custom data.
        </p>

        <div className="space-y-4">
          {/* Sheets Tabs */}
          <div className="flex items-center gap-2 flex-wrap border-b dark:border-gray-700 pb-2">
            {sheets.map((sheet, index) => (
              <div key={index} className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded">
                <input
                  type="text"
                  value={sheet.name}
                  onChange={(e) => updateSheetName(index, e.target.value)}
                  className="w-20 bg-transparent border-none text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none"
                />
                {sheets.length > 1 && (
                  <button
                    onClick={() => removeSheet(index)}
                    className="text-red-500 hover:text-red-700 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addSheet}
              className="px-3 py-1 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded text-sm hover:bg-green-100 dark:hover:bg-green-900/50"
            >
              + Add Sheet
            </button>
          </div>

          {/* Current Sheet Editor */}
          {sheets.map((sheet, sheetIndex) => (
            <div key={sheetIndex} className={sheetIndex === 0 ? '' : 'hidden'}>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 dark:border-gray-600">
                  <tbody>
                    {sheet.data.map((row, rowIndex) => (
                      <tr key={rowIndex} className={rowIndex === 0 ? 'bg-blue-50 dark:bg-blue-900/30' : ''}>
                        {row.map((cell, colIndex) => (
                          <td key={colIndex} className="border border-gray-300 dark:border-gray-600 p-0">
                            <input
                              type="text"
                              value={cell}
                              onChange={(e) => updateCell(sheetIndex, rowIndex, colIndex, e.target.value)}
                              className={`w-full px-2 py-1 min-w-[100px] bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                rowIndex === 0 ? 'font-semibold' : ''
                              }`}
                              placeholder={rowIndex === 0 ? 'Header' : 'Data'}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => addRow(sheetIndex)}
                  className="btn-secondary text-sm"
                >
                  + Add Row
                </button>
                <button
                  onClick={() => addColumn(sheetIndex)}
                  className="btn-secondary text-sm"
                >
                  + Add Column
                </button>
              </div>
            </div>
          ))}

          {/* Filename Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Output Filename
            </label>
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="Enter filename (without extension)"
              className="input w-full"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              File will be saved as: {filename}{filename.toLowerCase().endsWith('.xlsx') ? '' : '.xlsx'}
            </p>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="btn-primary w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              '📊 Generate Excel File'
            )}
          </button>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Features</h3>
        <ul className="space-y-2 text-gray-600 dark:text-gray-400">
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>Multiple sheets support</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>Professional formatting with headers</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>Automatic number formatting</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>Colored header backgrounds</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>Auto-sized columns</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>Cell borders and styling</span>
          </li>
        </ul>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { pdfTools, fileToBase64 } from '@/services/backendApi'
import { submitAndPoll, TaskStatus, getProgressPercentage } from '@/utils/asyncTasks'

export default function ExcelToPDF() {
  const [excelFile, setExcelFile] = useState<File | null>(null)
  const [filename, setFilename] = useState<string>('converted')
  const [converting, setConverting] = useState(false)
  const [result, setResult] = useState<{ pdf: string; filename: string; sheets_converted: number; size: number } | null>(null)
  const [error, setError] = useState<string>('')
  const [taskStatus, setTaskStatus] = useState<TaskStatus | null>(null)
  const [progress, setProgress] = useState<number>(0)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.name.endsWith('.xlsx')) {
        setError('Please select a valid XLSX file')
        return
      }
      setExcelFile(file)
      setError('')
      setResult(null)
      setTaskStatus(null)
    }
  }

  const handleConvert = async () => {
    if (!excelFile) {
      setError('Please select an Excel file')
      return
    }

    setConverting(true)
    setError('')
    setResult(null)
    setProgress(0)

    try {
      const excelBase64 = await fileToBase64(excelFile)

      // Submit async task and poll for completion
      const finalResult = await submitAndPoll<any>(
        () => pdfTools.excelToPdfAsync({ excel: excelBase64 }),
        {
          pollInterval: 2000, // Poll every 2 seconds
          onProgress: (status: TaskStatus) => {
            setTaskStatus(status)
            setProgress(getProgressPercentage(status))
          },
          onError: (errorMsg: string) => {
            setError(errorMsg)
          }
        }
      )

      if (finalResult.success) {
        setResult({
          pdf: finalResult.pdf,
          filename: finalResult.filename,
          sheets_converted: finalResult.sheets_converted,
          size: finalResult.size
        })
      } else {
        setError('Conversion failed')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to convert Excel to PDF')
    } finally {
      setConverting(false)
    }
  }

  const handleDownload = () => {
    if (!result) return

    const blob = new Blob([Uint8Array.from(atob(result.pdf), c => c.charCodeAt(0))], {
      type: 'application/pdf'
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const fileExtension = filename.toLowerCase().endsWith('.pdf') ? '' : '.pdf'
    a.download = `${filename}${fileExtension}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
          Excel to PDF Converter
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Convert Excel spreadsheets to professional PDF documents. All sheets are included.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Excel File
            </label>
            <input
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 dark:text-gray-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
                dark:file:bg-blue-900 dark:file:text-blue-300
                dark:hover:file:bg-blue-800
                cursor-pointer"
            />
            {excelFile && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Selected: {excelFile.name} ({formatFileSize(excelFile.size)})
              </p>
            )}
          </div>

          {/* Filename Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Output Filename
            </label>
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              disabled={converting}
              placeholder="Enter filename (without extension)"
              className="input w-full"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              File will be saved as: {filename}{filename.toLowerCase().endsWith('.pdf') ? '' : '.pdf'}
            </p>
          </div>

          {/* Progress Bar (shown during conversion) */}
          {converting && taskStatus && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center mb-2">
                <svg className="animate-spin h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-blue-800 dark:text-blue-300 font-medium">
                  {taskStatus.message}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-blue-200 dark:bg-blue-900 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-blue-600 dark:bg-blue-400 h-2.5 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 text-right">
                {progress}%
              </p>
            </div>
          )}

          <button
            onClick={handleConvert}
            disabled={!excelFile || converting}
            className="btn-primary w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {converting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Converting...
              </>
            ) : (
              '📄 Convert to PDF'
            )}
          </button>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {result && !converting && (
            <div className="p-6 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg animate-fade-in">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-2">
                    ✅ Conversion Complete!
                  </h3>
                  <p className="text-green-700 dark:text-green-400 text-sm mb-1">
                    Your file is ready to download
                  </p>
                  <p className="text-green-600 dark:text-green-500 text-xs mb-1">
                    Sheets converted: {result.sheets_converted}
                  </p>
                  <p className="text-green-600 dark:text-green-500 text-xs">
                    Size: {formatFileSize(result.size)}
                  </p>
                </div>
                <button
                  onClick={handleDownload}
                  className="btn-primary flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download PDF
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Features</h3>
        <ul className="space-y-2 text-gray-600 dark:text-gray-400">
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>Converts all sheets to PDF</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>Professional table formatting</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>Landscape orientation for wide sheets</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>Preserves data and formatting</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>Page breaks between sheets</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>100% secure - no file storage</span>
          </li>
        </ul>
      </div>
    </div>
  )
}

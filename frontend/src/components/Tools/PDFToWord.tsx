import { useState } from 'react'
import { pdfTools, fileToBase64 } from '@/services/backendApi'

export default function PDFToWord() {
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [filename, setFilename] = useState<string>('converted')
  const [converting, setConverting] = useState(false)
  const [result, setResult] = useState<{ docx: string; filename: string; size: number } | null>(null)
  const [error, setError] = useState<string>('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Please select a valid PDF file')
        return
      }
      setPdfFile(file)
      setError('')
      setResult(null)
    }
  }

  const handleConvert = async () => {
    if (!pdfFile) {
      setError('Please select a PDF file')
      return
    }

    setConverting(true)
    setError('')

    try {
      const pdfBase64 = await fileToBase64(pdfFile)
      const response = await pdfTools.pdfToWord({ pdf: pdfBase64 })

      if (response.success) {
        setResult({
          docx: response.docx,
          filename: response.filename,
          size: response.size
        })
      } else {
        setError('Conversion failed')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to convert PDF to Word')
    } finally {
      setConverting(false)
    }
  }

  const handleDownload = () => {
    if (!result) return

    const blob = new Blob([Uint8Array.from(atob(result.docx), c => c.charCodeAt(0))], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const fileExtension = filename.toLowerCase().endsWith('.docx') ? '' : '.docx'
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
          PDF to Word Converter
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Convert PDF documents to editable Word (DOCX) files. Preserves formatting, images, and tables.
        </p>

        <div className="space-y-4">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select PDF File
            </label>
            <input
              type="file"
              accept=".pdf,application/pdf"
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
            {pdfFile && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Selected: {pdfFile.name} ({formatFileSize(pdfFile.size)})
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
              placeholder="Enter filename (without extension)"
              className="input w-full"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              File will be saved as: {filename}{filename.toLowerCase().endsWith('.docx') ? '' : '.docx'}
            </p>
          </div>

          {/* Convert Button */}
          <button
            onClick={handleConvert}
            disabled={!pdfFile || converting}
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
              '📄 Convert to Word'
            )}
          </button>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Success Result */}
          {result && (
            <div className="p-6 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-2">
                    ✅ Conversion Successful!
                  </h3>
                  <p className="text-green-700 dark:text-green-400 text-sm mb-1">
                    Filename: {result.filename}
                  </p>
                  <p className="text-green-700 dark:text-green-400 text-sm">
                    Size: {formatFileSize(result.size)}
                  </p>
                </div>
                <button
                  onClick={handleDownload}
                  className="btn-primary"
                >
                  💾 Download DOCX
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Features */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Features</h3>
        <ul className="space-y-2 text-gray-600 dark:text-gray-400">
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>Preserves text formatting and structure</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>Maintains images and graphics</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>Converts tables accurately</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>Fully editable Word document output</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>No file size limits</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>100% secure - files are not stored</span>
          </li>
        </ul>
      </div>
    </div>
  )
}

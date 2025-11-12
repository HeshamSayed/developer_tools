import { useState } from 'react'
import { pdfTools } from '@/services/backendApi'
import { submitAndPoll, TaskStatus, getProgressPercentage } from '@/utils/asyncTasks'

type TemplateType = 'invoice' | 'report' | 'certificate'

interface InvoiceItem {
  description: string
  quantity: number
  price: number
}

export default function PDFGenerator() {
  const [templateType, setTemplateType] = useState<TemplateType>('invoice')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string>('')
  const [filename, setFilename] = useState<string>('document')
  const [result, setResult] = useState<{ pdf: string; filename: string; size: number } | null>(null)
  const [taskStatus, setTaskStatus] = useState<TaskStatus | null>(null)
  const [progress, setProgress] = useState<number>(0)

  // Invoice fields
  const [invoiceData, setInvoiceData] = useState({
    invoice_number: '',
    date: new Date().toISOString().split('T')[0],
    due_date: '',
    customer_name: '',
    customer_address: '',
    tax_rate: 0,
    items: [
      { description: '', quantity: 1, price: 0 },
    ] as InvoiceItem[]
  })

  // Report fields
  const [reportData, setReportData] = useState({
    title: '',
    author: '',
    sections: [
      { heading: '', content: '' },
    ]
  })

  // Certificate fields
  const [certificateData, setCertificateData] = useState({
    recipient_name: '',
    course_name: '',
  })

  const addInvoiceItem = () => {
    setInvoiceData({
      ...invoiceData,
      items: [...invoiceData.items, { description: '', quantity: 1, price: 0 }]
    })
  }

  const updateInvoiceItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...invoiceData.items]
    newItems[index] = { ...newItems[index], [field]: value }
    setInvoiceData({ ...invoiceData, items: newItems })
  }

  const removeInvoiceItem = (index: number) => {
    setInvoiceData({
      ...invoiceData,
      items: invoiceData.items.filter((_, i) => i !== index)
    })
  }

  const addReportSection = () => {
    setReportData({
      ...reportData,
      sections: [...reportData.sections, { heading: '', content: '' }]
    })
  }

  const updateReportSection = (index: number, field: 'heading' | 'content', value: string) => {
    const newSections = [...reportData.sections]
    newSections[index] = { ...newSections[index], [field]: value }
    setReportData({ ...reportData, sections: newSections })
  }

  const handleGenerate = async () => {
    setGenerating(true)
    setError('')
    setResult(null)
    setProgress(0)

    try {
      let data: any = {}

      if (templateType === 'invoice') {
        data = invoiceData
      } else if (templateType === 'report') {
        data = reportData
      } else if (templateType === 'certificate') {
        data = certificateData
      }

      // Submit async task and poll for completion
      const finalResult = await submitAndPoll<any>(
        () => pdfTools.generatePdfAsync({
          template_type: templateType,
          data
        }),
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
          size: finalResult.size
        })
      } else {
        setError('Failed to generate PDF')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate PDF')
    } finally {
      setGenerating(false)
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
          PDF Generator
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Generate professional PDF documents from templates: Invoices, Reports, Certificates.
        </p>

        {/* Template Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Template
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(['invoice', 'report', 'certificate'] as TemplateType[]).map((type) => (
              <button
                key={type}
                onClick={() => setTemplateType(type)}
                className={`p-4 border-2 rounded-lg text-center transition ${
                  templateType === type
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
                }`}
              >
                <div className="text-2xl mb-2">
                  {type === 'invoice' && '📝'}
                  {type === 'report' && '📊'}
                  {type === 'certificate' && '🎓'}
                </div>
                <div className="font-medium capitalize">{type}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Invoice Form */}
        {templateType === 'invoice' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Invoice Number</label>
                <input
                  type="text"
                  value={invoiceData.invoice_number}
                  onChange={(e) => setInvoiceData({ ...invoiceData, invoice_number: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  value={invoiceData.date}
                  onChange={(e) => setInvoiceData({ ...invoiceData, date: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Customer Name</label>
                <input
                  type="text"
                  value={invoiceData.customer_name}
                  onChange={(e) => setInvoiceData({ ...invoiceData, customer_name: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tax Rate (%)</label>
                <input
                  type="number"
                  value={invoiceData.tax_rate}
                  onChange={(e) => setInvoiceData({ ...invoiceData, tax_rate: Number(e.target.value) })}
                  className="input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Customer Address</label>
              <textarea
                value={invoiceData.customer_address}
                onChange={(e) => setInvoiceData({ ...invoiceData, customer_address: e.target.value })}
                className="input"
                rows={2}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium">Items</label>
                <button onClick={addInvoiceItem} className="btn-secondary text-sm">+ Add Item</button>
              </div>
              {invoiceData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => updateInvoiceItem(index, 'description', e.target.value)}
                    className="input col-span-5"
                  />
                  <input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => updateInvoiceItem(index, 'quantity', Number(e.target.value))}
                    className="input col-span-2"
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    value={item.price}
                    onChange={(e) => updateInvoiceItem(index, 'price', Number(e.target.value))}
                    className="input col-span-3"
                  />
                  <div className="col-span-2 flex items-center">
                    <span className="text-sm font-medium">${(item.quantity * item.price).toFixed(2)}</span>
                    {invoiceData.items.length > 1 && (
                      <button
                        onClick={() => removeInvoiceItem(index)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Report Form */}
        {templateType === 'report' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Report Title</label>
              <input
                type="text"
                value={reportData.title}
                onChange={(e) => setReportData({ ...reportData, title: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Author</label>
              <input
                type="text"
                value={reportData.author}
                onChange={(e) => setReportData({ ...reportData, author: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium">Sections</label>
                <button onClick={addReportSection} className="btn-secondary text-sm">+ Add Section</button>
              </div>
              {reportData.sections.map((section, index) => (
                <div key={index} className="mb-4 p-4 border rounded dark:border-gray-600">
                  <input
                    type="text"
                    placeholder="Section Heading"
                    value={section.heading}
                    onChange={(e) => updateReportSection(index, 'heading', e.target.value)}
                    className="input mb-2"
                  />
                  <textarea
                    placeholder="Section Content"
                    value={section.content}
                    onChange={(e) => updateReportSection(index, 'content', e.target.value)}
                    className="input"
                    rows={3}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certificate Form */}
        {templateType === 'certificate' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Recipient Name</label>
              <input
                type="text"
                value={certificateData.recipient_name}
                onChange={(e) => setCertificateData({ ...certificateData, recipient_name: e.target.value })}
                className="input"
                placeholder="Enter recipient name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Course/Achievement Name</label>
              <input
                type="text"
                value={certificateData.course_name}
                onChange={(e) => setCertificateData({ ...certificateData, course_name: e.target.value })}
                className="input"
                placeholder="Enter course or achievement name"
              />
            </div>
          </div>
        )}

        {/* Filename Input */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Output Filename
          </label>
          <input
            type="text"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            disabled={generating}
            placeholder="Enter filename (without extension)"
            className="input w-full"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            File will be saved as: {filename}{filename.toLowerCase().endsWith('.pdf') ? '' : '.pdf'}
          </p>
        </div>

        {/* Progress Bar (shown during generation) */}
        {generating && taskStatus && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg mt-6">
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

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="btn-primary w-full mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {generating ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating PDF...
            </>
          ) : (
            '📄 Generate PDF'
          )}
        </button>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg mt-4">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Success Result */}
        {result && !generating && (
          <div className="p-6 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg mt-4 animate-fade-in">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-2">
                  ✅ PDF Generated!
                </h3>
                <p className="text-green-700 dark:text-green-400 text-sm mb-1">
                  Your PDF is ready to download
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

      <div className="card">
        <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Features</h3>
        <ul className="space-y-2 text-gray-600 dark:text-gray-400">
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>Professional templates (Invoice, Report, Certificate)</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>Customizable fields and data</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>Automatic calculations (invoice totals, tax)</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>Professional styling and formatting</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>Instant PDF generation and download</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">✓</span>
            <span>No watermarks or limitations</span>
          </li>
        </ul>
      </div>
    </div>
  )
}

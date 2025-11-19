/**
 * Backend API Service
 * Provides methods to interact with Python-powered Django backend
 */

// Remove /api suffix if present since endpoints include it
const getBackendUrl = () => {
  const url = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'
  return url.replace(/\/api$/, '')
}

const BACKEND_URL = getBackendUrl()

// Helper function to handle API requests
async function apiRequest<T>(endpoint: string, data: any): Promise<T> {
  try {
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Required for CORS with credentials
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      // Try to parse as JSON first, fall back to text if it fails
      try {
        const error = await response.json()
        throw new Error(error.error || error.message || 'API request failed')
      } catch (jsonError) {
        // If JSON parsing fails, get the text (likely HTML error page)
        const text = await response.text()
        // Check if it's HTML
        if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
          throw new Error(`Server error (${response.status}): The server encountered an error. Please try again later.`)
        }
        throw new Error('Server error: Unable to process your request. Please try again.')
      }
    }

    // Try to parse response as JSON
    try {
      return await response.json()
    } catch (parseError) {
      console.error('Failed to parse server response')
      throw new Error('Invalid response from server. Please try again.')
    }
  } catch (error: any) {
    // Handle network errors (fetch failed before getting a response)
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw new Error('Unable to connect to the server. Please check your internet connection and try again.')
    }
    // Re-throw other errors
    throw error
  }
}

// Helper to convert File to base64
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = error => reject(error)
  })
}

// ============================================
// IMAGE TOOLS API
// ============================================

export interface ImageResizeRequest {
  image: string // base64
  width: number
  height: number
  algorithm?: 'LANCZOS' | 'BICUBIC' | 'BILINEAR' | 'NEAREST'
  maintain_aspect?: boolean
}

export interface ImageResizeResponse {
  success: boolean
  image: string
  width: number
  height: number
}

export const imageTools = {
  resize: (data: ImageResizeRequest) =>
    apiRequest<ImageResizeResponse>('/api/image-tools/resize/', data),

  compress: (data: {
    image: string
    quality: number
    format: 'JPEG' | 'PNG' | 'WEBP'
    optimize?: boolean
  }) =>
    apiRequest<{
      success: boolean
      image: string
      size: number
      format: string
    }>('/api/image-tools/compress/', data),

  enhance: (data: {
    image: string
    brightness?: number
    contrast?: number
    color?: number
    sharpness?: number
    auto_enhance?: boolean
  }) =>
    apiRequest<{
      success: boolean
      image: string
    }>('/api/image-tools/enhance/', data),

  applyFilter: (data: {
    image: string
    filter: 'blur' | 'sharpen' | 'edge_detect' | 'emboss' | 'contour' | 'grayscale' | 'sepia' | 'vintage'
    intensity?: number
  }) =>
    apiRequest<{
      success: boolean
      image: string
      filter: string
    }>('/api/image-tools/filter/', data),

  removeBackground: (data: { image: string }) =>
    apiRequest<{
      success: boolean
      image: string
    }>('/api/image-tools/remove-background/', data),

  detectFaces: (data: { image: string }) =>
    apiRequest<{
      success: boolean
      image: string
      faces_detected: number
      faces: Array<{ x: number; y: number; width: number; height: number }>
    }>('/api/image-tools/detect-faces/', data),

  toSketch: (data: { image: string }) =>
    apiRequest<{
      success: boolean
      image: string
    }>('/api/image-tools/sketch/', data),

  rotate: (data: { image: string; angle: number; expand?: boolean }) =>
    apiRequest<{
      success: boolean
      image: string
      angle: number
    }>('/api/image-tools/rotate/', data),

  watermark: (data: {
    image: string
    watermark_text: string
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'
    opacity?: number
  }) =>
    apiRequest<{
      success: boolean
      image: string
    }>('/api/image-tools/watermark/', data),
}

// ============================================
// PDF TOOLS API
// ============================================

export const pdfTools = {
  merge: (data: { pdfs: string[] }) =>
    apiRequest<{
      success: boolean
      pdf: string
      pages: number | string
    }>('/api/pdf-tools/merge/', data),

  split: (data: {
    pdf: string
    split_type: 'all' | 'range'
    page_ranges?: number[][]
  }) =>
    apiRequest<{
      success: boolean
      total_pages: number
      results: Array<{ page_number?: number; range?: string; pdf: string }>
    }>('/api/pdf-tools/split/', data),

  extractText: (data: { pdf: string; pages?: number[] }) =>
    apiRequest<{
      success: boolean
      total_pages: number
      pages: Array<{ page_number: number; text: string }>
    }>('/api/pdf-tools/extract-text/', data),

  extractTables: (data: { pdf: string }) =>
    apiRequest<{
      success: boolean
      total_tables: number
      pages: Array<{ page_number: number; tables: any[][]; table_count: number }>
    }>('/api/pdf-tools/extract-tables/', data),

  rotate: (data: { pdf: string; angle: number; pages?: 'all' | number[] }) =>
    apiRequest<{
      success: boolean
      pdf: string
      angle: number
    }>('/api/pdf-tools/rotate/', data),

  compress: (data: { pdf: string; quality: number }) =>
    apiRequest<{
      success: boolean
      pdf: string
      original_size: number
      compressed_size: number
      compression_ratio: string
    }>('/api/pdf-tools/compress/', data),

  addWatermark: (data: {
    pdf: string
    watermark_text: string
    position?: 'center' | 'top' | 'bottom'
  }) =>
    apiRequest<{
      success: boolean
      pdf: string
    }>('/api/pdf-tools/watermark/', data),

  getInfo: (data: { pdf: string }) =>
    apiRequest<{
      success: boolean
      info: {
        pages: number
        title: string
        author: string
        subject: string
        creator: string
        producer: string
        creation_date: string
      }
    }>('/api/pdf-tools/info/', data),

  createFromText: (data: {
    text: string
    title?: string
    page_size?: 'letter' | 'a4'
  }) =>
    apiRequest<{
      success: boolean
      pdf: string
    }>('/api/pdf-tools/create-from-text/', data),

  // Document Conversion APIs
  pdfToWord: (data: { pdf: string }) =>
    apiRequest<{
      success: boolean
      docx: string
      filename: string
      size: number
    }>('/api/pdf-tools/pdf-to-word/', data),

  wordToPdf: (data: { docx: string }) =>
    apiRequest<{
      success: boolean
      pdf: string
      filename: string
      size: number
    }>('/api/pdf-tools/word-to-pdf/', data),

  pdfToExcel: (data: { pdf: string }) =>
    apiRequest<{
      success: boolean
      excel: string
      filename: string
      sheets: number
      size: number
      error?: string
    }>('/api/pdf-tools/pdf-to-excel/', data),

  excelToPdf: (data: { excel: string }) =>
    apiRequest<{
      success: boolean
      pdf: string
      filename: string
      sheets_converted: number
      size: number
    }>('/api/pdf-tools/excel-to-pdf/', data),

  generatePdf: (data: {
    template_type: 'invoice' | 'report' | 'certificate'
    data: any
  }) =>
    apiRequest<{
      success: boolean
      pdf: string
      filename: string
      template: string
      size: number
    }>('/api/pdf-tools/generate-pdf/', data),

  createExcel: (data: {
    sheets: Array<{
      name: string
      data: any[][]
      has_header?: boolean
    }>
  }) =>
    apiRequest<{
      success: boolean
      excel: string
      filename: string
      sheets: number
      size: number
    }>('/api/pdf-tools/create-excel/', data),

  // ============================================
  // ASYNC ENDPOINTS (Celery-powered)
  // ============================================

  // Async PDF to Word
  pdfToWordAsync: (data: { pdf: string }) =>
    apiRequest<{
      success: boolean
      task_id: string
      status: string
      message: string
      status_url: string
    }>('/api/pdf-tools/async/pdf-to-word/', data),

  // Async Word to PDF
  wordToPdfAsync: (data: { docx: string }) =>
    apiRequest<{
      success: boolean
      task_id: string
      status: string
      message: string
      status_url: string
    }>('/api/pdf-tools/async/word-to-pdf/', data),

  // Async PDF to Excel
  pdfToExcelAsync: (data: { pdf: string }) =>
    apiRequest<{
      success: boolean
      task_id: string
      status: string
      message: string
      status_url: string
    }>('/api/pdf-tools/async/pdf-to-excel/', data),

  // Async Excel to PDF
  excelToPdfAsync: (data: { excel: string }) =>
    apiRequest<{
      success: boolean
      task_id: string
      status: string
      message: string
      status_url: string
    }>('/api/pdf-tools/async/excel-to-pdf/', data),

  // Async PDF Generation
  generatePdfAsync: (data: {
    template_type: 'invoice' | 'report' | 'certificate'
    data: any
  }) =>
    apiRequest<{
      success: boolean
      task_id: string
      status: string
      message: string
      status_url: string
    }>('/api/pdf-tools/async/generate-pdf/', data),

  // Async Excel Creation
  createExcelAsync: (data: {
    sheets: Array<{
      name: string
      data: any[][]
      has_header?: boolean
    }>
  }) =>
    apiRequest<{
      success: boolean
      task_id: string
      status: string
      message: string
      status_url: string
    }>('/api/pdf-tools/async/create-excel/', data),

  // Task Status Check
  getTaskStatus: async (taskId: string) => {
    const response = await fetch(`${BACKEND_URL}/api/pdf-tools/task-status/${taskId}/`, {
      credentials: 'include'
    })
    if (!response.ok) {
      throw new Error('Failed to fetch task status')
    }
    return response.json()
  },

  // Cancel Task
  cancelTask: async (taskId: string) => {
    const response = await fetch(`${BACKEND_URL}/api/pdf-tools/cancel-task/${taskId}/`, {
      method: 'DELETE',
      credentials: 'include'
    })
    if (!response.ok) {
      throw new Error('Failed to cancel task')
    }
    return response.json()
  },

  // Queue Status
  getQueueStatus: async () => {
    const response = await fetch(`${BACKEND_URL}/api/pdf-tools/queue-status/`, {
      credentials: 'include'
    })
    if (!response.ok) {
      throw new Error('Failed to fetch queue status')
    }
    return response.json()
  },
}

// ============================================
// DATA TOOLS API
// ============================================

export const dataTools = {
  analyzeCSV: (data: { csv: string }) =>
    apiRequest<{
      success: boolean
      rows: number
      columns: number
      column_names: string[]
      dtypes: Record<string, string>
      missing_values: Record<string, number>
      memory_usage: number
      numeric_summary: Record<string, any>
      categorical_summary: Record<string, any>
    }>('/api/data-tools/analyze-csv/', data),

  csvToJson: (data: {
    csv: string
    orient?: 'records' | 'split' | 'index' | 'columns' | 'values'
  }) =>
    apiRequest<{
      success: boolean
      json: any
      rows: number
    }>('/api/data-tools/csv-to-json/', data),

  jsonToCsv: (data: { json: any }) =>
    apiRequest<{
      success: boolean
      csv: string
      rows: number
      columns: number
    }>('/api/data-tools/json-to-csv/', data),

  statistics: (data: { data: number[] }) =>
    apiRequest<{
      success: boolean
      count: number
      mean: number
      median: number
      mode: number
      std: number
      variance: number
      min: number
      max: number
      range: number
      q1: number
      q2: number
      q3: number
      iqr: number
      skewness: number
      kurtosis: number
      sum: number
    }>('/api/data-tools/statistics/', data),

  correlation: (data: {
    csv: string
    method?: 'pearson' | 'spearman' | 'kendall'
  }) =>
    apiRequest<{
      success: boolean
      correlation_matrix: Record<string, Record<string, number>>
      method: string
      columns: string[]
    }>('/api/data-tools/correlation/', data),

  detectOutliers: (data: { data: number[]; column?: string }) =>
    apiRequest<{
      success: boolean
      outliers: number[]
      outlier_indices: number[]
      outlier_count: number
      lower_bound: number
      upper_bound: number
      iqr: number
    }>('/api/data-tools/detect-outliers/', data),

  normalize: (data: {
    data: number[]
    method?: 'minmax' | 'zscore' | 'robust'
  }) =>
    apiRequest<{
      success: boolean
      normalized_data: number[]
      method: string
      original_count: number
    }>('/api/data-tools/normalize/', data),

  clean: (data: {
    csv: string
    remove_duplicates?: boolean
    fill_method?: 'drop' | 'mean' | 'median' | 'mode' | 'forward' | 'backward'
  }) =>
    apiRequest<{
      success: boolean
      csv: string
      original_rows: number
      cleaned_rows: number
      rows_removed: number
      fill_method: string
    }>('/api/data-tools/clean/', data),

  groupAggregate: (data: {
    csv: string
    group_by: string[]
    agg_columns: Record<string, string>
  }) =>
    apiRequest<{
      success: boolean
      csv: string
      rows: number
      columns: number
    }>('/api/data-tools/group-aggregate/', data),

  pivot: (data: {
    csv: string
    index: string
    columns: string
    values: string
    aggfunc?: string
  }) =>
    apiRequest<{
      success: boolean
      csv: string
      pivot_table: any
    }>('/api/data-tools/pivot/', data),
}

// ============================================
// CODE TOOLS API
// ============================================

export const codeTools = {
  formatPython: (data: { code: string; formatter?: 'black' | 'autopep8' }) =>
    apiRequest<{
      success: boolean
      formatted_code: string
      formatter: string
    }>('/api/code-tools/format-python/', data),

  analyzeComplexity: (data: { code: string }) =>
    apiRequest<{
      success: boolean
      cyclomatic_complexity: Array<{
        name: string
        type: string
        complexity: number
        rank: string
        lineno: number
      }>
      halstead_metrics: any
      maintainability_index: number
    }>('/api/code-tools/analyze-complexity/', data),

  countLOC: (data: { code: string }) =>
    apiRequest<{
      success: boolean
      loc: number
      lloc: number
      sloc: number
      comments: number
      multi: number
      blank: number
      single_comments: number
    }>('/api/code-tools/count-loc/', data),

  securityScan: (data: { code: string }) =>
    apiRequest<{
      success: boolean
      issues: Array<{
        severity: string
        confidence: string
        text: string
        line_number: number
        test_id: string
      }>
      issue_count: number
    }>('/api/code-tools/security-scan/', data),

  minify: (data: { code: string; type: 'javascript' | 'css' }) =>
    apiRequest<{
      success: boolean
      minified_code: string
      original_size: number
      minified_size: number
      size_reduction: string
    }>('/api/code-tools/minify/', data),

  beautify: (data: { code: string; type: 'javascript' | 'css' }) =>
    apiRequest<{
      success: boolean
      beautified_code: string
      type: string
    }>('/api/code-tools/beautify/', data),

  syntaxCheck: (data: { code: string }) =>
    apiRequest<{
      success: boolean
      valid: boolean
      message?: string
      error?: string
      line?: number
      offset?: number
    }>('/api/code-tools/syntax-check/', data),
}

// ============================================
// CONVERTER TOOLS API
// ============================================

export const converterTools = {
  jsonToYaml: (data: { input: string }) =>
    apiRequest<{
      success: boolean
      result: string
      metadata: { processing_time_ms: number }
    }>('/api/tools/convert/json-to-yaml', data),

  yamlToJson: (data: { input: string; formatted?: boolean }) =>
    apiRequest<{
      success: boolean
      result: string
      metadata: { processing_time_ms: number }
    }>('/api/tools/convert/yaml-to-json', data),

  tomlToJson: (data: { input: string; formatted?: boolean }) =>
    apiRequest<{
      success: boolean
      result: string
      metadata: { processing_time_ms: number }
    }>('/api/tools/convert/toml-to-json', data),

  jsonToToml: (data: { input: string }) =>
    apiRequest<{
      success: boolean
      result: string
      metadata: { processing_time_ms: number }
    }>('/api/tools/convert/json-to-toml', data),

  jsonToSql: (data: { input: string; table_name: string }) =>
    apiRequest<{
      success: boolean
      result: string
      metadata: { processing_time_ms: number; statement_count: number }
    }>('/api/tools/convert/json-to-sql', data),

  jsonToJsonSchema: (data: { input: string; title?: string }) =>
    apiRequest<{
      success: boolean
      result: string
      metadata: { processing_time_ms: number }
    }>('/api/tools/convert/json-to-json-schema', data),
}

// ============================================
// UTILITY TOOLS API
// ============================================

export const utilityTools = {
  stringLength: (data: { input: string }) =>
    apiRequest<{
      success: boolean
      result: {
        characters: number
        characters_no_spaces: number
        words: number
        lines: number
        paragraphs: number
        bytes: number
        sentences: number
        kilobytes: number
      }
      metadata: { processing_time_ms: number }
    }>('/api/tools/utility/string-length', data),

  bigNumber: (data: { num1: string; num2: string; operation: string }) =>
    apiRequest<{
      success: boolean
      result: string
      metadata: { processing_time_ms: number; digits: number }
    }>('/api/tools/utility/big-number', data),

  jsonDiff: (data: { json1: string; json2: string }) =>
    apiRequest<{
      success: boolean
      differences: Array<{
        path: string
        type: 'added' | 'removed' | 'modified'
        value?: any
        old?: any
        new?: any
      }>
      metadata: { processing_time_ms: number; difference_count: number }
    }>('/api/tools/utility/json-diff', data),

  goStacktrace: (data: { input: string }) =>
    apiRequest<{
      success: boolean
      frames: Array<{
        type: 'error' | 'goroutine' | 'frame'
        message?: string
        function?: string
        location?: string
      }>
      metadata: { processing_time_ms: number; frame_count: number }
    }>('/api/tools/utility/go-stacktrace', data),

  templateString: (data: { template: string; values: string }) =>
    apiRequest<{
      success: boolean
      result: string
      metadata: { processing_time_ms: number }
    }>('/api/tools/utility/template-string', data),

  sqlDdlDiagram: (data: { input: string }) =>
    apiRequest<{
      success: boolean
      tables: Array<{
        name: string
        columns: Array<{
          name: string
          type: string
          is_primary: boolean
          is_not_null: boolean
          is_unique: boolean
        }>
      }>
      metadata: { processing_time_ms: number; table_count: number }
    }>('/api/tools/utility/sql-ddl-diagram', data),
}

// ============================================
// COMMAND GENERATOR TOOLS API
// ============================================

export const commandGenerators = {
  mysqlCommand: (data: {
    command_type: string
    table_name: string
    columns?: string
    where_clause?: string
    values?: string
    set_clause?: string
    table_schema?: string
  }) =>
    apiRequest<{
      success: boolean
      result: string
      metadata: { processing_time_ms: number }
    }>('/api/tools/generate/mysql-command', data),

  tarCommand: (data: {
    operation: string
    compression: string
    archive_name: string
    files?: string
    verbose?: boolean
  }) =>
    apiRequest<{
      success: boolean
      result: string
      explanation: string[]
      metadata: { processing_time_ms: number }
    }>('/api/tools/generate/tar-command', data),

  curlCommand: (data: {
    url: string
    method: string
    headers?: string
    body?: string
    query_params?: string
  }) =>
    apiRequest<{
      success: boolean
      result: string
      metadata: { processing_time_ms: number }
    }>('/api/tools/generate/curl-command', data),
}

// ============================================
// GENERAL API CLIENT
// ============================================

export const backendApi = {
  get: async (endpoint: string, options?: { params?: Record<string, any> }) => {
    const url = new URL(`${BACKEND_URL}${endpoint}`)

    if (options?.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value))
        }
      })
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      credentials: 'include',
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }))
      throw new Error(error.error || 'Request failed')
    }

    return response.json()
  },

  post: async (endpoint: string, data?: any) => {
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }))
      throw new Error(error.error || 'Request failed')
    }

    return response.json()
  },
}

// Export all APIs
export default {
  imageTools,
  pdfTools,
  dataTools,
  codeTools,
  converterTools,
  utilityTools,
  commandGenerators,
  backendApi,
}

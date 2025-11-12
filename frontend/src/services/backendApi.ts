/**
 * Backend API Service
 * Provides methods to interact with Python-powered Django backend
 */

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

// Helper function to handle API requests
async function apiRequest<T>(endpoint: string, data: any): Promise<T> {
  const response = await fetch(`${BACKEND_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'API request failed')
  }

  return response.json()
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

// Export all APIs
export default {
  imageTools,
  pdfTools,
  dataTools,
  codeTools,
}

import axios from 'axios'
import { ApiResponse } from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// JSON Tools
export const formatJSON = async (input: string, indent: number = 2): Promise<ApiResponse> => {
  const response = await api.post('/tools/json/format', { input, indent })
  return response.data
}

export const validateJSON = async (input: string): Promise<ApiResponse> => {
  const response = await api.post('/tools/json/validate', { input })
  return response.data
}

export const minifyJSON = async (input: string): Promise<ApiResponse> => {
  const response = await api.post('/tools/json/minify', { input })
  return response.data
}

// Base64 Tools
export const base64Encode = async (input: string): Promise<ApiResponse> => {
  const response = await api.post('/tools/base64/encode', { input })
  return response.data
}

export const base64Decode = async (input: string): Promise<ApiResponse> => {
  const response = await api.post('/tools/base64/decode', { input })
  return response.data
}

// Hash Tools
export const generateHash = async (input: string, algorithms: string[]): Promise<ApiResponse> => {
  const response = await api.post('/tools/hash/generate', { input, algorithms })
  return response.data
}

// Password Tools
export const generatePassword = async (options: {
  length?: number
  include_uppercase?: boolean
  include_lowercase?: boolean
  include_numbers?: boolean
  include_symbols?: boolean
  exclude_ambiguous?: boolean
  quantity?: number
}): Promise<ApiResponse> => {
  const response = await api.post('/tools/password/generate', options)
  return response.data
}

export const checkPasswordStrength = async (password: string): Promise<ApiResponse> => {
  const response = await api.post('/tools/password/strength', { password })
  return response.data
}

// Timestamp Tools
export const convertTimestamp = async (
  input: string,
  inputType: 'timestamp' | 'datetime',
  timezone: string = 'UTC'
): Promise<ApiResponse> => {
  const response = await api.post('/tools/timestamp/convert', {
    input,
    input_type: inputType,
    timezone,
  })
  return response.data
}

// JWT Tools
export const decodeJWT = async (token: string): Promise<ApiResponse> => {
  const response = await api.post('/tools/jwt/decode', { token })
  return response.data
}

// Text Tools
export const textDiff = async (text1: string, text2: string, diffType: string = 'unified'): Promise<ApiResponse> => {
  const response = await api.post('/tools/text/diff', { text1, text2, diff_type: diffType })
  return response.data
}

export const regexTest = async (pattern: string, text: string, flags: string[] = []): Promise<ApiResponse> => {
  const response = await api.post('/tools/text/regex', { pattern, text, flags })
  return response.data
}

// Conversion Tools
export const csvToJSON = async (input: string, delimiter: string = ','): Promise<ApiResponse> => {
  const response = await api.post('/tools/convert/csv-to-json', { input, delimiter })
  return response.data
}

export const jsonToCSV = async (input: string): Promise<ApiResponse> => {
  const response = await api.post('/tools/convert/json-to-csv', { input })
  return response.data
}

// Encoding Tools
export const urlEncode = async (input: string): Promise<ApiResponse> => {
  const response = await api.post('/tools/encode/url', { input })
  return response.data
}

export const urlDecode = async (input: string): Promise<ApiResponse> => {
  const response = await api.post('/tools/decode/url', { input })
  return response.data
}

export const htmlEncode = async (input: string): Promise<ApiResponse> => {
  const response = await api.post('/tools/encode/html', { input })
  return response.data
}

export const htmlDecode = async (input: string): Promise<ApiResponse> => {
  const response = await api.post('/tools/decode/html', { input })
  return response.data
}

// Generator Tools
export const generateUUID = async (version: number = 4, quantity: number = 1): Promise<ApiResponse> => {
  const response = await api.post('/tools/generate/uuid', { version, quantity })
  return response.data
}

export const generateQRCode = async (text: string, size: number = 10, errorCorrection: string = 'M'): Promise<ApiResponse> => {
  const response = await api.post('/tools/generate/qrcode', { text, size, error_correction: errorCorrection })
  return response.data
}

// Advanced Tools
export const formatSQL = async (input: string, keywordCase: string = 'upper', reindent: boolean = true): Promise<ApiResponse> => {
  const response = await api.post('/tools/sql/format', { input, keyword_case: keywordCase, reindent })
  return response.data
}

export const formatXML = async (input: string, indent: number = 2): Promise<ApiResponse> => {
  const response = await api.post('/tools/xml/format', { input, indent })
  return response.data
}

export const validateXML = async (input: string): Promise<ApiResponse> => {
  const response = await api.post('/tools/xml/validate', { input })
  return response.data
}

export const formatYAML = async (input: string): Promise<ApiResponse> => {
  const response = await api.post('/tools/yaml/format', { input })
  return response.data
}

export const previewMarkdown = async (input: string): Promise<ApiResponse> => {
  const response = await api.post('/tools/markdown/preview', { input })
  return response.data
}

// Utility Tools
export const formatCSS = async (input: string, indentSize: number = 2): Promise<ApiResponse> => {
  const response = await api.post('/tools/css/format', { input, indent_size: indentSize })
  return response.data
}

export const minifyCSS = async (input: string): Promise<ApiResponse> => {
  const response = await api.post('/tools/css/minify', { input })
  return response.data
}

export const formatJavaScript = async (input: string, indentSize: number = 2): Promise<ApiResponse> => {
  const response = await api.post('/tools/js/format', { input, indent_size: indentSize })
  return response.data
}

export const minifyJavaScript = async (input: string): Promise<ApiResponse> => {
  const response = await api.post('/tools/js/minify', { input })
  return response.data
}

export const convertImage = async (image: string, format: string, quality: number = 90): Promise<ApiResponse> => {
  const response = await api.post('/tools/image/convert', { image, format, quality })
  return response.data
}

export const generateLoremIpsum = async (count: number, unit: string, startWithLorem: boolean = true): Promise<ApiResponse> => {
  const response = await api.post('/tools/lorem/generate', { count, unit, start_with_lorem: startWithLorem })
  return response.data
}

export const convertBinaryHex = async (input: string, inputType: string): Promise<ApiResponse> => {
  const response = await api.post('/tools/binary/convert', { input, input_type: inputType })
  return response.data
}

export const generateASCIIArt = async (text: string, font: string = 'standard'): Promise<ApiResponse> => {
  const response = await api.post('/tools/ascii/generate', { text, font })
  return response.data
}

// SSL Checker
export const checkSSL = async (domain: string, port: number = 443): Promise<ApiResponse> => {
  const response = await api.post('/tools/ssl/check', { domain, port })
  return response.data
}

export default api

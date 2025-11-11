import axios from 'axios'
import { ApiResponse } from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

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

export default api

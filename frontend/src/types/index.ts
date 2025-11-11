export interface Tool {
  slug: string
  name: string
  description: string
  category: string
  icon?: string
}

export interface ToolCategory {
  slug: string
  name: string
  description: string
  icon?: string
  tools: Tool[]
}

export interface ApiResponse<T = any> {
  success: boolean
  result?: T
  error?: string
  metadata?: {
    processing_time_ms?: number
    [key: string]: any
  }
  // Allow additional properties for various API responses
  [key: string]: any
}

export interface AdPlacement {
  position: 'top_banner' | 'sidebar_top' | 'sidebar_sticky' | 'in_content' | 'below_results' | 'footer'
  adCode: string
  isActive: boolean
}

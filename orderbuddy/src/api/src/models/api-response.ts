export interface ApiResponse<T> {
  data: T | null
  meta?: {
    message?: string
    pagination?: {
      page: number
      pageSize: number
      pageCount: number
      total: number
    }
    links?: {
      self?: string
      next?: string
      prev?: string
      related?: string
    }
    [key: string]: any
  }
  error?: ApiError
}

export interface ApiError {
  code: string
  message: string
  details?: any
}

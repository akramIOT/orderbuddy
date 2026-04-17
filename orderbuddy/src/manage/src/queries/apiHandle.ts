import { ApiResponse } from './api-response'

export async function handleApiResponse<T>(response: ApiResponse<T>): Promise<T> {
  if (response.error) {
    throw new Error(response.error.message)
  }

  if (!response.data) {
    throw new Error('No data received')
  }

  return response.data
}

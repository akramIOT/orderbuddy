import { AxiosResponse } from 'axios';
import { ApiResponse } from './api-response';

export function handleApiResponse<T>(response: AxiosResponse<ApiResponse<T>>): T {
  if (!response.data.data) {
    throw new Error(response.data?.error?.message || 'Failed to load data');
  }

  return response.data.data;
}

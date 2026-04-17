import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { logApiError } from '../utils/errorLogger';

// Create axios instance with default configuration
const apiService = axios.create({
  baseURL: import.meta.env.VITE_API_ENDPOINT as string,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth tokens or other request modifications
apiService.interceptors.request.use(
  (config) => {
    // Add any request transformations here
    return config;
  },
  (error) => {
    logApiError(error, 'requestInterceptor', {
      message: 'Request interceptor error'
    });
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiService.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    const url = error.config?.url || 'unknown';
    const method = error.config?.method?.toUpperCase() || 'unknown';
    
    logApiError(error, `${method}:${url}`, {
      status: error.response?.status,
      url,
      method,
      data: error.response?.data ? JSON.stringify(error.response.data).substring(0, 1000) : undefined
    });
    
    return Promise.reject(error);
  }
);

// Set up global error handlers
window.addEventListener('error', (event) => {
  logApiError(event.error || new Error(event.message), 'windowErrorEvent', {
    source: event.filename,
    line: event.lineno,
    column: event.colno
  });
});

window.addEventListener('unhandledrejection', (event) => {
  logApiError(
    event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
    'unhandledRejection',
    { reason: String(event.reason) }
  );
});

export default apiService;

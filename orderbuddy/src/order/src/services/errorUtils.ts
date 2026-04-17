import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { logException } from './appInsightsService';

/**
 * Utility function to handle API errors and log them to Application Insights
 * @param error - The error object from axios or any other source
 * @param context - Additional context about where the error occurred
 * @returns The error message for display
 */
export const handleApiError = (error: unknown, context: string = 'API Request'): string => {
  let errorMessage = 'An unexpected error occurred';
  
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    
    // Extract response data for better error reporting
    const status = axiosError.response?.status;
    const responseData = axiosError.response?.data as any;
    const url = axiosError.config?.url;
    const method = axiosError.config?.method?.toUpperCase();
    
    // Customize error message based on status code
    if (status === 401 || status === 403) {
      errorMessage = 'You do not have permission to perform this action';
    } else if (status === 404) {
      errorMessage = 'The requested resource was not found';
    } else if (status === 429) {
      errorMessage = 'Too many requests, please try again later';
    } else if (status && status >= 500) {
      errorMessage = 'A server error occurred, please try again later';
    } else if (responseData?.message) {
      errorMessage = responseData.message;
    } else if (axiosError.message) {
      errorMessage = axiosError.message;
    }
    
    // Log detailed error to Application Insights
    logException(error as Error, {
      context,
      status,
      url,
      method,
      responseData: JSON.stringify(responseData).substring(0, 1000), // Truncate to avoid size limits
      path: window.location.pathname,
      timestamp: new Date().toISOString()
    });
  } else if (error instanceof Error) {
    errorMessage = error.message || errorMessage;
    
    // Log non-axios errors
    logException(error, {
      context,
      type: error.name,
      path: window.location.pathname,
      timestamp: new Date().toISOString()
    });
  } else {
    // Handle non-standard errors
    const unknownError = new Error('Unknown error object received');
    logException(unknownError, {
      context,
      originalError: String(error),
      path: window.location.pathname,
      timestamp: new Date().toISOString()
    });
  }
  
  return errorMessage;
};

/**
 * Create an axios interceptor that logs errors to Application Insights
 * @param axiosInstance - The axios instance to add the interceptor to
 */
export const setupAxiosErrorLogging = (axiosInstance: AxiosInstance): void => {
  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: any) => {
      handleApiError(error, 'Axios Interceptor');
      return Promise.reject(error);
    }
  );
};

// Optional: Add global unhandled error handlers if not using ErrorBoundary
export const setupGlobalErrorHandlers = (): void => {
  window.addEventListener('error', (event) => {
    logException(event.error || new Error(event.message), {
      context: 'Window Error Event',
      source: event.filename,
      line: event.lineno,
      column: event.colno,
      path: window.location.pathname,
      timestamp: new Date().toISOString()
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    logException(event.reason instanceof Error ? event.reason : new Error(String(event.reason)), {
      context: 'Unhandled Promise Rejection',
      path: window.location.pathname,
      timestamp: new Date().toISOString()
    });
  });
};

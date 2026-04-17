import { logException } from '../services/appInsightsService';

// Application identifier to differentiate between apps in App Insights
const APP_ID = 'manage-app';

/**
 * Utility function to log errors to Application Insights with additional context
 * 
 * @param error The error object caught in the catch block
 * @param source Source information about where the error occurred (e.g., component/function name)
 * @param metadata Additional metadata about the error context
 */
export const logError = (
  error: unknown, 
  source: string,
  metadata: Record<string, unknown> = {}
): void => {
  if (error instanceof Error) {
    // Import dynamically to avoid issues with circular dependencies
    // and to ensure the app can load even if Application Insights fails
    try {
      logException(error, {
        source,
        appId: APP_ID, // Add app identifier to all errors
        ...metadata,
        timestamp: new Date().toISOString(),
        path: window.location.pathname
      });
    } catch (loggingError) {
      // Fallback in case Application Insights logging itself fails
      console.error('Failed to log error to Application Insights:', loggingError);
      console.error('Original error:', error);
    }
  } else {
    // Handle non-Error objects
    logException(new Error('Unknown error type'), {
      source,
      appId: APP_ID, // Add app identifier to all errors
      originalError: String(error),
      ...metadata,
      timestamp: new Date().toISOString(),
      path: window.location.pathname
    });
  }
};

// Export specific aliases for different error types
export const logApiError = (error: unknown, endpoint: string, metadata: Record<string, unknown> = {}): void => {
  logError(error, `API:${endpoint}`, { errorType: 'api', ...metadata });
};

export const logExceptionError = (error: unknown, operation: string, metadata: Record<string, unknown> = {}): void => {
  logError(error, `Exception:${operation}`, { errorType: 'exception', ...metadata });
};

export const logAuthError = (error: unknown, action: string, metadata: Record<string, unknown> = {}): void => {
  logError(error, `Auth:${action}`, { errorType: 'auth', ...metadata });
};

export const logUiError = (error: unknown, component: string, metadata: Record<string, unknown> = {}): void => {
  logError(error, `UI:${component}`, { errorType: 'ui', ...metadata });
};
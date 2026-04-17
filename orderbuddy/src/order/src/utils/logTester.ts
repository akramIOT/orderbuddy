import { logApiError, logExceptionError, logAuthError, logUiError } from './errorLogger';

/**
 * Utility for testing Application Insights logging
 * This can be called from any component to trigger test logs
 */
export const testLogging = (): void => {
  // Only allow testing in development mode
  if (!import.meta.env.DEV) {
    console.warn('Logging tests are only available in development mode');
    return;
  }

  console.log('Testing Application Insights logging...');

  // Test API error logging
  try {
    throw new Error('Test API Error');
  } catch (error) {
    logApiError(error, 'test-endpoint', {
      testProperty: 'API Error Test',
      testId: Date.now(),
    });
  }

  // Test Exception error logging
  try {
    throw new Error('Test Exception Error');
  } catch (error) {
    logExceptionError(error, 'TestOperation', {
      testProperty: 'Exception Test',
      testId: Date.now(),
    });
  }

  // Test Auth error logging
  try {
    throw new Error('Test Auth Error');
  } catch (error) {
    logAuthError(error, 'TestLogin', {
      testProperty: 'Auth Test',
      testId: Date.now(),
    });
  }

  // Test UI error logging
  try {
    throw new Error('Test UI Error');
  } catch (error) {
    logUiError(error, 'TestComponent', {
      testProperty: 'UI Test',
      testId: Date.now(),
    });
  }

  // Test non-Error object logging
  logApiError('This is a string, not an Error object', 'test-string-error', {
    testProperty: 'Non-Error Test',
    testId: Date.now(),
  });

  console.log('Completed sending test logs to Application Insights');
};

/**
 * Simulates a network error that would occur in a real API call
 */
export const simulateNetworkError = async (): Promise<void> => {
  // Only allow testing in development mode
  if (!import.meta.env.DEV) {
    console.warn('Logging tests are only available in development mode');
    return;
  }

  try {
    // Simulate a network request that fails
    const response = await fetch('https://non-existent-endpoint-for-testing.example');
    const data = await response.json();
    return data;
  } catch (error) {
    logApiError(error, 'simulated-network-error', {
      testProperty: 'Network Error Simulation',
      testId: Date.now(),
      isMock: true,
    });
    throw error;
  }
};

/**
 * Generates an uncaught error to test global error handling
 */
export const generateUncaughtError = (): void => {
  // Only allow testing in development mode
  if (!import.meta.env.DEV) {
    console.warn('Logging tests are only available in development mode');
    return;
  }

  // This will trigger the window.onerror handler
  setTimeout(() => {
    // @ts-ignore - Intentionally causing an error
    const nonExistentObject = null;
    //nonExistentObject.someProperty = 'This will cause an error';
  }, 100);
};

/**
 * Generates an unhandled promise rejection to test promise error handling
 */
export const generateUnhandledPromiseRejection = (): void => {
  // Only allow testing in development mode
  if (!import.meta.env.DEV) {
    console.warn('Logging tests are only available in development mode');
    return;
  }

  // This will trigger the unhandledrejection handler
  Promise.reject(new Error('Test unhandled promise rejection'));
};

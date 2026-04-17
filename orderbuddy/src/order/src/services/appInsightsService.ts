import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { ReactPlugin } from '@microsoft/applicationinsights-react-js';
import { createBrowserHistory } from 'history';

/**
 * This service initializes the Application Insights SDK with the instrumentation key
 * and provides methods to track exceptions, page views, and custom events.
 */

const browserHistory = createBrowserHistory();
const reactPlugin = new ReactPlugin();

// Get instrumentation key from environment variable
const instrumentationKey = import.meta.env.VITE_APPINSIGHTS_INSTRUMENTATIONKEY;

// App-specific configuration
const APP_NAME = 'OrderBuddy-OrderApp';
const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';

// Create Application Insights instance
const appInsights = new ApplicationInsights({
  config: {
    connectionString: instrumentationKey ? `InstrumentationKey=${instrumentationKey}` : '',
    extensions: [reactPlugin],
    extensionConfig: {
      [reactPlugin.identifier]: { history: browserHistory }
    },
    enableAutoRouteTracking: true,
    enableCorsCorrelation: true,
    enableRequestHeaderTracking: true,
    enableResponseHeaderTracking: true,
    // Send telemetry in all environments (dev, test, production)
    disableFetchTracking: false,
    disableTelemetry: !instrumentationKey, // Only disable if no key is provided
    // Add retry logic for transient failures
    maxBatchSizeInBytes: 64000,
    maxBatchInterval: 15000,
    disableExceptionTracking: false,
    autoTrackPageVisitTime: true,
    enableAjaxPerfTracking: true,
    // Add session management
    enableSessionStorageBuffer: true,
    isCookieUseDisabled: false,
    isStorageUseDisabled: false
  }
});

/**
 * Initialize Application Insights
 */
export const initAppInsights = (): void => {
  if (instrumentationKey) {
    appInsights.loadAppInsights();
    
    // Add application context to all telemetry
    appInsights.addTelemetryInitializer((envelope) => {
      envelope.tags = envelope.tags || {};
      envelope.tags['ai.cloud.role'] = APP_NAME;
      envelope.tags['ai.application.ver'] = APP_VERSION;
    });
    
    appInsights.trackPageView(); // Track initial page view
    
    // Set up global error handler
    const originalOnError = window.onerror;
    window.onerror = (message, url, line, column, error) => {
      logException(error || new Error(message as string), { 
        url, 
        line, 
        column,
        appName: APP_NAME
      });
      if (originalOnError) {
        return originalOnError(message, url, line, column, error);
      }
      return false;
    };
    
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      logException(event.reason || new Error('Unhandled Promise rejection'), { 
        status: 'unhandled promise rejection',
        appName: APP_NAME
      });
    });
    
    console.log(`Azure Application Insights initialized in ${import.meta.env.MODE} environment for ${APP_NAME}`);
  } else {
    console.warn('Application Insights instrumentation key not found');
  }
};

/**
 * Log an exception to Application Insights
 * @param error - The error object
 * @param properties - Additional properties to include with the error
 */
export const logException = (error: Error, properties?: Record<string, any>): void => {
  if (instrumentationKey) {
    appInsights.trackException({
      exception: error,
      properties: {
        ...properties,
        appName: APP_NAME,
        environment: import.meta.env.MODE,
        timestamp: new Date().toISOString()
      }
    });
  }
  // Always log to console for debugging purposes
  console.error(`[${APP_NAME}] [${import.meta.env.MODE}] Error tracked:`, error, properties);
};

/**
 * Log a custom event to Application Insights
 * @param name - Event name
 * @param properties - Event properties
 */
export const logEvent = (name: string, properties?: Record<string, any>): void => {
  if (instrumentationKey) {
    appInsights.trackEvent({ 
      name, 
      properties: {
        ...properties,
        appName: APP_NAME,
        environment: import.meta.env.MODE
      }
    });
  }
  // Always log to console for debugging purposes
  console.log(`[${APP_NAME}] [${import.meta.env.MODE}] Event tracked: ${name}`, properties);
};

/**
 * Log a page view to Application Insights
 * @param name - Page name
 * @param uri - Page URI
 * @param properties - Additional properties
 */
export const logPageView = (name?: string, uri?: string, properties?: Record<string, any>): void => {
  if (instrumentationKey) {
    appInsights.trackPageView({ 
      name, 
      uri, 
      properties: {
        ...properties,
        appName: APP_NAME,
        environment: import.meta.env.MODE
      }
    });
  }
  // Always log to console for debugging purposes
  console.log(`[${APP_NAME}] [${import.meta.env.MODE}] Page view tracked: ${name || 'unnamed page'}`, { uri, properties });
};

/**
 * Track a metric to Application Insights
 * @param name - Metric name
 * @param value - Metric value
 * @param properties - Additional properties
 */
export const logMetric = (name: string, value: number, properties?: Record<string, any>): void => {
  if (instrumentationKey) {
    appInsights.trackMetric({ 
      name, 
      average: value, 
      properties: {
        ...properties,
        appName: APP_NAME,
        environment: import.meta.env.MODE
      }
    });
  }
  console.log(`[${APP_NAME}] [${import.meta.env.MODE}] Metric tracked: ${name} = ${value}`, properties);
};

// Export Application Insights instance
export const appInsightsInstance = appInsights;
export const reactPluginInstance = reactPlugin;

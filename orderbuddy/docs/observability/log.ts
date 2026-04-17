// orderbuddy-logger.ts
// Unified logging setup for backend (NestJS) and frontend (Ionic + React) using Pino + Azure App Insights

import pino from 'pino';
import * as appInsights from 'applicationinsights';
import { v4 as uuid } from 'uuid';
import { Request, Response, NextFunction } from 'express';

// Step 1: Pino logger instance (Backend)
export const logger = pino({
  transport: process.env.NODE_ENV === 'development' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard'
    }
  } : undefined,
  level: process.env.LOG_LEVEL || 'info',
  base: undefined  // omit pid, hostname
});

// Step 2: Attach request ID and correlation ID to all incoming requests
export function attachCorrelationId(req: Request, res: Response, next: NextFunction) {
  req['requestId'] = uuid();
  req['correlationId'] = req.headers['x-correlation-id'] || uuid();
  next();
}

// Step 3: Azure App Insights setup (Backend)
if (process.env.APPINSIGHTS_CONNECTION_STRING) {
  appInsights.setup().start();
  appInsights.defaultClient.context.tags[
    appInsights.defaultClient.context.keys.cloudRole
  ] = 'OrderBuddy API';
}

const ai = appInsights.defaultClient;

// Step 4: Helper to log structured events
export function logEvent(name: string, data: Record<string, any>) {
  logger.info({ event: name, ...data });
  ai?.trackEvent({ name, properties: data });
}

// Step 5: Helper to log traces
export function logTrace(message: string, data?: Record<string, any>) {
  logger.debug({ msg: message, ...data });
  ai?.trackTrace({ message, severity: 1, properties: data });
}

// Step 6: Helper to log errors
export function logError(error: Error, context?: Record<string, any>) {
  logger.error({ err: error, ...context });
  ai?.trackException({ exception: error, properties: context });
}

// Step 7: Correlation strategy
// - Generate correlationId (UUID) on the Order App when order session starts
// - Pass x-correlation-id in all API requests
// - Backend middleware captures and attaches correlationId to request
// - logger and App Insights include correlationId for traceability
// - Reuse correlationId across Manage App, Display, etc.

// Example usage:
// logger.info({ correlationId: req.correlationId, orderId: 'xyz' }, 'Order created');
// logEvent('order.placed', { correlationId: req.correlationId, amountCents: 1895 });
// Azure query: traces | where customDimensions.correlationId == 'abc-123'

// ------------------------------
// Frontend Logging (Ionic + React)
// ------------------------------

// Step 8: Pino logger for frontend
// Place in a shared file like `logClient.ts`

import pinoBrowser from 'pino';

export const frontendLog = pinoBrowser({
  browser: {
    asObject: true
  },
  level: import.meta.env.MODE === 'development' ? 'debug' : 'info'
});

// Optional: Forward to App Insights (via browser SDK)
import { ApplicationInsights } from '@microsoft/applicationinsights-web';

export const appInsights = new ApplicationInsights({
  config: {
    connectionString: import.meta.env.VITE_APPINSIGHTS_CONNECTION_STRING,
    enableAutoRouteTracking: true
  }
});

appInsights.loadAppInsights();

frontendLog.info = (...args) => {
  appInsights.trackTrace({ message: JSON.stringify(args), severity: 1 });
  console.info(...args);
};

frontendLog.error = (...args) => {
  appInsights.trackException({ exception: args[0] instanceof Error ? args[0] : new Error(String(args[0])) });
  console.error(...args);
};

// Step 9: Global error handler (Ionic + React)
// Add to a top-level hook or useEffect in App.tsx

window.onerror = function (message, source, lineno, colno, error) {
  frontendLog.error(error || new Error(String(message)), {
    source, lineno, colno
  });
};

window.onunhandledrejection = function (event) {
  frontendLog.error(event.reason instanceof Error ? event.reason : new Error(String(event.reason)), {
    type: 'unhandledrejection'
  });
};

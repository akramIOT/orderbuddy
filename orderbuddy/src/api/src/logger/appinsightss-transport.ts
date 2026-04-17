// src/logger/appinsights-transport.ts
import * as appInsights from 'applicationinsights';
let client: appInsights.TelemetryClient;
require('dotenv').config();

if (!appInsights.defaultClient) {
  try {
    if (!process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
      console.error('Application Insights connection string is not set in environment variables');
      process.exit(1);
    }

    appInsights.setup(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING).setAutoCollectConsole(false).start();

    client = appInsights.defaultClient;

    if (!client) {
      throw new Error('Failed to initialize Application Insights client');
    }
  } catch (error) {
    console.error('Failed to initialize Application Insights:', error);
    process.exit(1);
  }
} else {
  client = appInsights.defaultClient;
}
export const appInsightsStream = {
  write: (message: string) => {
    try {
      if (!client) {
        console.warn('Application Insights client is not initialized.');
        return;
      }
      const log = JSON.parse(message);
      const { msg, correlationId, module, event, error, stack, level, status, ...rest } = log;

      client.trackTrace({
        message: msg || message,
        properties: {
          module,
          event,
          error,
          correlationId,
          status,
          ...rest,
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV || 'development',
        },
      });
    } catch {
      client.trackTrace({ message });
    }
  },
};
export const appInsightsClient = client;
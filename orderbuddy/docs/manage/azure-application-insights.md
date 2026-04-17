# Azure Application Insights Integration

This document describes how to use the Azure Application Insights integration in the OrderBuddy Manage app.

## Configuration

1. Add your Application Insights instrumentation key to the `.env` file:

```
VITE_APPINSIGHTS_INSTRUMENTATIONKEY=your-instrumentation-key
```

> **Note:** Telemetry is sent in all environments (development, test, production) as long as the instrumentation key is provided.

## Testing Locally

To test Application Insights integration in your local development environment:

1. Ensure you have a valid instrumentation key in your `.env` file:
   ```
   VITE_APPINSIGHTS_INSTRUMENTATIONKEY=your-instrumentation-key
   ```

2. Start your development server:
   ```bash
   npm run dev
   ```

3. Verify initialization in the browser console:
   - Open your browser's developer tools (F12)
   - Check for the message: "Azure Application Insights initialized in development environment"
   
4. Test error logging:
   - Intentionally trigger an error in your application
   - Verify that the error appears in both the console and in the Azure Portal

5. Test custom events:
   - Add a temporary button that triggers a custom event:
   ```tsx
   <button onClick={() => logEvent('TestEvent', { source: 'LocalTesting' })}>
     Test Event
   </button>
   ```

6. Use the included test component:
   - Import and add the AppInsightsTester component to a page:
   ```tsx
   import AppInsightsTester from '../components/AppInsightsTester';
   
   // Inside your component's render function:
   <AppInsightsTester />
   ```
   - Use the provided buttons to trigger different types of telemetry

7. Verify in Azure Portal:
   - Log in to the Azure Portal
   - Navigate to your Application Insights resource
   - Check the "Live Metrics" section to see real-time telemetry
   - Look for your test events and errors in the "Search" section (may take a few minutes to appear)

8. Monitoring your Application Insights resource:
   - Set the time range in the Azure Portal to show recent data
   - If you don't see data right away, wait a few minutes as there can be delay
   - Use Kusto Query Language (KQL) to search for your test events:
   ```kql
   customEvents
   | where name == "TestEvent"
   | project timestamp, name, customDimensions
   | order by timestamp desc
   ```

## Usage

The Application Insights integration provides several methods to log errors and events:

### Automatic Error Logging

- React component errors are automatically logged via ErrorBoundary
- API errors are automatically logged via axios interceptors
- Unhandled exceptions and promise rejections are automatically logged

### Manual Error Logging

You can manually log exceptions using the `logException` function:

```tsx
import { logException } from './services/appInsightsService';

try {
  // Your code here
} catch (error) {
  logException(error as Error, {
    context: 'Component Name',
    additionalInfo: 'Extra information about the error'
  });
  // Handle the error appropriately
}
```

### Logging Custom Events

You can log custom events using the `logEvent` function:

```tsx
import { logEvent } from './services/appInsightsService';

// Track user actions
logEvent('UserAction', {
  action: 'ButtonClick',
  component: 'LoginForm'
});

// Track business events
logEvent('OrderPlaced', {
  orderId: '12345',
  amount: 42.99,
  items: 3
});
```

### Logging Page Views

Page views are automatically tracked for route changes, but you can manually log them:

```tsx
import { logPageView } from './services/appInsightsService';

// Log a page view
logPageView(
  'Page Title',
  '/custom-path',
  { referrer: document.referrer }
);
```

### Error Handling in API Calls

Use the `handleApiError` utility to handle and log API errors:

```tsx
import { handleApiError } from './services/errorUtils';
import apiService from './services/apiService';

const fetchData = async () => {
  try {
    const response = await apiService.get('/some-endpoint');
    return response.data;
  } catch (error) {
    const errorMessage = handleApiError(error, 'FetchData');
    // Display error to user or handle it appropriately
    return null;
  }
};
```

## Monitoring in Azure Portal

To view logs and monitor your application:

1. Sign in to the Azure Portal
2. Navigate to your Application Insights resource
3. Use the following sections:
   - Live Metrics: Real-time monitoring
   - Failures: View exceptions and failed requests
   - Performance: See response times and slow operations
   - Usage: User behavior analytics
   - Logs: Custom query logs using Kusto Query Language

## Best Practices

- Log meaningful context with errors
- Don't include personally identifiable information (PII)
- Use custom events to track business metrics
- Set up alerts for critical errors
- Review logs regularly to identify issues

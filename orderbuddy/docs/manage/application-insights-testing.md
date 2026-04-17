# Azure Application Insights Integration Testing

This document explains how to test the Azure Application Insights integration in the Manage app.

## Prerequisites

1. Make sure you have set up the Application Insights instrumentation key in your `.env` file:
   ```
   VITE_APPINSIGHTS_INSTRUMENTATIONKEY=your-instrumentation-key
   ```

2. Make sure all the required packages are installed:
   ```bash
   cd src/manage
   npm install
   ```

## Testing the Integration

### Option 1: Using the AppInsightsTester Component

We've created a dedicated testing component for Azure Application Insights:

1. Import and add the `AppInsightsTester` component to a page you're working on:
   ```tsx
   import AppInsightsTester from '../components/AppInsightsTester';
   
   // Inside your component's render function:
   <AppInsightsTester />
   ```

2. The component provides buttons to test different types of telemetry:
   - **Test Custom Event**: Logs a custom event with metadata
   - **Test Error Logging**: Logs a caught error
   - **Test Page View**: Logs a page view
   - **Test Uncaught Error**: Triggers an uncaught error (will be caught by global handlers)

3. Run the application locally:
   ```bash
   cd src/manage
   npm run dev
   ```

4. Navigate to the page with the tester component and click the buttons

### Option 2: Using the Browser Console

You can also test the Application Insights integration directly from the browser console:

1. Open the browser console (F12 or right-click -> Inspect -> Console)
2. Run the following commands:

   ```javascript
   // Log a custom event
   window.appInsightsInstance.trackEvent({name: "ConsoleTestEvent", properties: {source: "BrowserConsole"}});
   
   // Log an error
   window.appInsightsInstance.trackException({exception: new Error("Console Test Error")});
   
   // Log a page view
   window.appInsightsInstance.trackPageView({name: "ConsoleTestPageView"});
   ```

## Verifying in Azure Portal

1. Log in to the Azure Portal
2. Navigate to your Application Insights resource
3. Check "Live Metrics" to see real-time telemetry
4. Look for your test events in the "Search" section (may take a few minutes to appear)

## Useful Kusto Queries

Once in the Azure Portal, you can use these Kusto Query Language (KQL) queries to find your test data:

```sql
// Find custom events
customEvents
| where name == "TestEvent"
| project timestamp, name, customDimensions
| order by timestamp desc

// Find exceptions
exceptions
| project timestamp, problemId, outerType, outerMessage, customDimensions
| order by timestamp desc

// Find page views
pageViews
| project timestamp, name, url, customDimensions
| order by timestamp desc
```

## Troubleshooting

If telemetry isn't appearing in Azure Portal:

1. Check the browser console for any errors
2. Verify your instrumentation key is correctly set in the `.env` file
3. Make sure the Application Insights service is properly initialized in your app
4. Remember that telemetry can take a few minutes to appear in the portal
5. Try using "Live Metrics" in the Azure Portal for immediate feedback

For more information, refer to the [Azure Application Insights documentation](https://docs.microsoft.com/en-us/azure/azure-monitor/app/javascript).

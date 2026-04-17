# Adding Error Logging to Catch Blocks

This document explains how to add Azure Application Insights error logging to catch blocks in your React Query functions.

## Quick Guide

For any catch block in your query functions, add the following pattern:

```typescript
try {
  // Your code
} catch (error) {
  // Log error to Application Insights
  logExceptionError(
    error, 
    'ContextName',  // The name of the query/component
    {
      // Additional metadata about the error
      endpoint: `/your-api-endpoint/${params}`,
      // Add any relevant context variables
      param1: param1,
      param2: param2
    }
  );
  
  // Your existing error handling
  console.error('Your error message:', error);
  throw error;  // Or handle as needed
}
```

## Setup Instructions

1. Import the helper at the top of your file:

```typescript
import { logError } from '../utils/errorLogger';
```

2. Update your catch blocks to use the helper.

## Example: Validation Errors

For validation errors (like Zod errors), you can do the following:

```typescript
try {
  const validatedData = mySchema.parse(data);
  return validatedData;
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('Validation failed:', error.errors);
    
    // Log validation error to Application Insights
    logExceptionError(
      new Error('Invalid data format'),
      'YourQueryName',
      {
        zodError: JSON.stringify(error.errors),
        endpoint: '/your-endpoint'
      }
    );
    
    throw new Error('Invalid data format');
  }
  
  // Log other errors to Application Insights
  logExceptionError(error, 'YourQueryName', { endpoint: '/your-endpoint' });
  throw error;
}
```

## Benefits

- Consistent error logging across the application
- Rich error context sent to Application Insights
- Automatic tracking of error metadata (timestamp, page path)
- Error logging works even in production builds where console.logs are stripped

## Best Practices

1. Always provide meaningful context names
2. Include relevant parameters in the metadata
3. Don't include sensitive data like passwords or tokens
4. For validation errors, include the validation details but avoid including full request/response data
5. Use the error logging alongside (not instead of) your normal error handling

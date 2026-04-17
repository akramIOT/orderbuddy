import axios from 'axios';
import { setupAxiosErrorLogging, setupGlobalErrorHandlers } from './errorUtils';

// Create axios instance with default configuration
const apiService = axios.create({
  baseURL: import.meta.env.VITE_API_ENDPOINT as string,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Set up error logging for API calls
setupAxiosErrorLogging(apiService);

// Set up global error handlers
setupGlobalErrorHandlers();

export default apiService;

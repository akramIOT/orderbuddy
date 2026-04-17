import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { initAppInsights } from './services/appInsightsService';

// Initialize Application Insights before rendering the app
initAppInsights();

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
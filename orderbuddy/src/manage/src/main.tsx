import React from 'react';
import { createRoot } from 'react-dom/client';
import Provider from './_provider';
import App from './App';

// Initialize API client with error logging
import './services/apiService';

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <Provider>
      <App />
    </Provider>
  </React.StrictMode>
);

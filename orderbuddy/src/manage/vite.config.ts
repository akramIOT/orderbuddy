/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  define: {
    global: {},
  },
  server: {
    port: 5174,
  },
  plugins: [
    // replace({
    //   __FIREBASE_API_KEY__: JSON.stringify(process.env.VITE_FIREBASE_API_KEY),
    //   __FIREBASE_AUTH_DOMAIN__: JSON.stringify(process.env.VITE_FIREBASE_AUTH_DOMAIN),
    //   __FIREBASE_PROJECT_ID__: JSON.stringify(process.env.VITE_FIREBASE_PROJECT_ID),
    //   __FIREBASE_STORAGE_BUCKET__: JSON.stringify(process.env.VITE_FIREBASE_STORAGE_BUCKET),
    //   __FIREBASE_MESSAGING_SENDER_ID__: JSON.stringify(process.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
    //   __FIREBASE_APP_ID__: JSON.stringify(process.env.VITE_FIREBASE_APP_ID),
    //   __FIREBASE_MEASUREMENT_ID__: JSON.stringify(process.env.VITE_FIREBASE_MEASUREMENT_ID),
    //   delimiters: ['__', '__'],
    // }),
    react(),
    legacy(),
    VitePWA({
      // devOptions: {
      //   enabled: true, // Enables manifest.json during `npm run dev`
      // }, // have to disable for production

      registerType: 'autoUpdate', // Change from autoUpdate to prompt
      manifest: {
        short_name: process.env.NODE_ENV === 'dev' ? 'OrderBuddy Manage-dev' : 'OrderBuddy Manage',
        name: 'OrderBuddy Manage',
        start_url: '/',
        display: 'standalone',
        theme_color: '#5a199b',
        background_color: '#5a199b',

        icons: [
          {
            src: 'assets/icon/orderbuddy-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'assets/icon/orderbuddy-512.png',
            type: 'image/png',
            sizes: '512x512',
            purpose: 'any',
          },
        ],
        screenshots: [
          {
            src: 'assets/screenshots/orderBuddyLanding.png',
            sizes: '1080x1920',
            type: 'image/png',
            form_factor: 'wide',
          },
          {
            src: 'assets/screenshots/orderBuddyLanding.png',
            sizes: '1080x1920',
            type: 'image/png',
          },
        ],
      },
      manifestFilename: 'manifest.json',

      workbox: {
        maximumFileSizeToCacheInBytes: 5000000,
      },
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },
});

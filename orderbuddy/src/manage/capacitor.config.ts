import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
  android: {
    allowMixedContent: true,
  },
  appId: 'com.orderbuddy.app',
  appName: 'manage',
  webDir: 'dist',
  //todo change to prod url for android build read from env
  server: {
    androidScheme: 'https',
    //dev
    url: 'https://manage.dev.orderbuddyapp.com',
    //staging
    //url: 'https://manage.staging.orderbuddyapp.com',
    //prod
    //url: 'https://manage.orderbuddyapp.com',
    
    //url: 'https://6f8a-50-35-91-91.ngrok-free.app',
    cleartext: true,
  },
};

export default config;

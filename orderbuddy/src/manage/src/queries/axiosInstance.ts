import { Device } from '@capacitor/device';
import { isPlatform } from '@ionic/react';
import axios from 'axios';
import app from '../firebase/firebase';
import { appStore } from '../store';

const apiBaseUrl = import.meta.env.VITE_API_ENDPOINT;
const getBaseUrl = async () => {
  // const info = await Device.getInfo();
  // // Android emulator uses 10.0.2.2 to access host's localhost
  // if (
  //   info.platform === 'android' &&
  //   (info.isVirtual || info.model?.toLowerCase().includes('sdk') || info.manufacturer?.toLowerCase().includes('google'))
  // ) {
  //   return import.meta.env.VITE_EMULATOR_HOST_API; // Use your API port
  // }
  return import.meta.env.VITE_API_ENDPOINT;
};
export const axiosInstance = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});
axiosInstance.interceptors.request.use(
  (config) => {
    const authToken = appStore.getState().authToken;
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Set base URL after initialization
getBaseUrl().then((baseUrl) => {
  axiosInstance.defaults.baseURL = baseUrl;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

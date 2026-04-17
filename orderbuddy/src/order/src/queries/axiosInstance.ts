import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_ENDPOINT
export const axiosInstance = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

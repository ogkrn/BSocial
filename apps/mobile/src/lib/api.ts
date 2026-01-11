import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Use your computer's IP address for physical device testing
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.32:5000';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await axios.post(`${API_URL}/api/auth/refresh`);
        const { accessToken } = response.data.data;
        
        await SecureStore.setItemAsync('accessToken', accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        
        return api(originalRequest);
      } catch (refreshError) {
        await SecureStore.deleteItemAsync('user');
        await SecureStore.deleteItemAsync('accessToken');
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

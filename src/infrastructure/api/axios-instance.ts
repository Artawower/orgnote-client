import axios, { type AxiosInstance } from 'axios';

export const createAxiosInstance = (
  getToken: () => string,
  getBaseUrl?: () => string,
): AxiosInstance => {
  const instance = axios.create({
    baseURL: process.env.API_URL || '/v1',
  });

  instance.interceptors.request.use((config) => {
    const baseUrl = getBaseUrl?.();
    if (baseUrl) {
      config.baseURL = baseUrl;
    }

    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return instance;
};

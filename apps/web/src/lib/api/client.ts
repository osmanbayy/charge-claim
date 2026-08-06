import axios from 'axios';
import { env } from '@/lib/config/env';
import { getAccessToken } from '../auth/access-token';

export const apiClient = axios.create({
  baseURL: env.apiUrl,
  timeout: 10_000,
});

apiClient.interceptors.request.use((config) => {
  const accessToken = getAccessToken();
  if (accessToken)
    config.headers.set("Authorization", `Bearer ${accessToken}`);

  return config;
})
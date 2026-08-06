import axios from 'axios';
import { env } from '@/lib/config/env';

export const apiClient = axios.create({
  baseURL: env.apiUrl,
  timeout: 10_000,
});
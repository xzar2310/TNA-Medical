import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getSession } from 'next-auth/react';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Accept-Language': 'th', // overridden per-request when needed
  },
  timeout: 10_000,
});

// ── Request interceptor: attach JWT access token ──────────────────────────────
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Only in browser context
    if (typeof window !== 'undefined') {
      const session = await getSession() as any;
      if (session?.accessToken) {
        config.headers['Authorization'] = `Bearer ${session.accessToken}`;
      }
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// ── Response interceptor: normalize errors ────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Never expose raw stack traces to callers
    const message =
      (error.response?.data as { detail?: string })?.detail ??
      error.message ??
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export default api;

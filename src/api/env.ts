/// <reference types="vite/client" />

// Dynamic host resolution for API & WebSocket
const getApiBaseUrl = (): string => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  // When running in the browser, relative path '/api/v1' routes through Vite's proxy seamlessly
  // for both localhost and mobile / remote devices on the same Wi-Fi network.
  if (typeof window !== 'undefined') {
    return '/api/v1';
  }
  return 'http://localhost:8000/api/v1';
};

const getWsBaseUrl = (): string => {
  if (import.meta.env.VITE_WS_BASE_URL) {
    return import.meta.env.VITE_WS_BASE_URL;
  }
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}/api/v1/ws/live`;
  }
  return 'ws://localhost:8000/ws';
};

// Environment Configuration
export const env = {
  API_BASE_URL: getApiBaseUrl(),
  WS_BASE_URL: getWsBaseUrl(),
  APP_NAME: 'MoneyTrace',
  APP_VERSION: '1.0.0',
  TOKEN_KEY: 'moneytrace_access_token',
  REFRESH_TOKEN_KEY: 'moneytrace_refresh_token',
  USER_KEY: 'moneytrace_user',
} as const;

export type EnvConfig = typeof env;
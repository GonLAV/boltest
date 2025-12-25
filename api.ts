import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_BASE } from './apiClient';
import { toast } from 'react-toastify';

// Axios instance with health check & offline handling
const apiBase = API_BASE || process.env.REACT_APP_API_BASE || 'http://localhost:5000';

export const api: AxiosInstance = axios.create({
  baseURL: apiBase,
  timeout: 10000,
  withCredentials: true,
});

let isOffline = false;
let retryQueue: Array<() => void> = [];

// Health check - verify backend is alive
export async function checkHealth(): Promise<boolean> {
  const healthUrl = `${apiBase || ''}`.replace(/\/$/, '') + '/api/health';
  try {
    const res = await axios.get(healthUrl || '/api/health', { timeout: 3000 });
    return res.status === 200;
  } catch {
    return false;
  }
}

// Global response interceptor for offline handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Network error = connection refused, no response from server
    if (!error.response) {
      isOffline = true;
      
      // Show offline banner once
      if (!sessionStorage.getItem('offline-banner-shown')) {
        toast.error('⚠️ API offline. Retrying...', {
          autoClose: false,
          closeButton: true,
        });
        sessionStorage.setItem('offline-banner-shown', 'true');
      }

      // Queue the retry
      retryQueue.push(() => {
        // Retry this request after server is back
        return api(error.config!);
      });

      // Poll for recovery
      pollHealthCheck();
    }

    return Promise.reject(error);
  }
);

// Poll backend health & retry queued requests
let healthCheckTimer: NodeJS.Timeout | null = null;

export function pollHealthCheck() {
  if (healthCheckTimer) return; // Already polling

  healthCheckTimer = setInterval(async () => {
    const isHealthy = await checkHealth();
    
    if (isHealthy && isOffline) {
      isOffline = false;
      sessionStorage.removeItem('offline-banner-shown');
      toast.success('✅ API back online!');

      // Flush queued retries
      const queue = retryQueue;
      retryQueue = [];
      queue.forEach(fn => fn());

      // Stop polling
      if (healthCheckTimer) {
        clearInterval(healthCheckTimer);
        healthCheckTimer = null;
      }
    }
  }, 2000); // Check every 2 seconds
}

export function getOfflineStatus() {
  return isOffline;
}

export default api;

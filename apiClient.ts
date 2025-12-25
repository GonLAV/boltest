import axios from 'axios';

export const determineApiBase = () => {
  if ((process.env as any).REACT_APP_API_URL) return (process.env as any).REACT_APP_API_URL;
  if (typeof window === 'undefined') return '';

  // Use explicit backend URL for local development
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  }

  try {
    const host = window.location.hostname; // e.g. bug-free-pancake-...-3000.app.github.dev
    const match = host.match(/^(.*)-(\d+)\.app\.github\.dev$/);
    if (match) {
      // Keep backend and frontend ports aligned (see backend PORT)
      const baseHost = `${match[1]}-5001.app.github.dev`;
      const protocol = window.location.protocol;
      return `${protocol}//${baseHost}`;
    }
  } catch (e) {
    // fallthrough
  }

  // fallback to empty -> relative requests
  return '';
};

export const API_BASE = determineApiBase();

// Axios instance configured once for the app
export const apiClient = axios.create({ baseURL: API_BASE || '' });

// Debug logging only in development to avoid noisy consoles and leaking headers
const isDev = process.env.NODE_ENV === 'development';
if (isDev) {
  console.log('[DEBUG] axios baseURL =', apiClient.defaults.baseURL || '(relative)');
}

// Interceptors to add auth header and (optionally) log outbound requests
apiClient.interceptors.request.use((req) => {
  try {
    // Attach Authorization header from localStorage token if present
    const token = typeof window !== 'undefined' ? localStorage.getItem('boltest:token') : null;
    if (token) {
      if (!req.headers) req.headers = {} as any;
      req.headers['Authorization'] = `Bearer ${token}`;
    }

    // Attach TFS/ADO targeting headers for backend API calls
    // (keeps data sync aligned with the org/project/PAT selected at login)
    const url = (req.url || '').toString();
    const isBackendApiCall = url.startsWith('/api/');
    if (isBackendApiCall) {
      const orgUrl = localStorage.getItem('boltest:orgUrl');
      const pat = localStorage.getItem('boltest:pat');
      const project = localStorage.getItem('boltest:project');
      if (!req.headers) req.headers = {} as any;
      if (orgUrl && !req.headers['X-OrgUrl'] && !req.headers['x-orgurl']) {
        req.headers['X-OrgUrl'] = orgUrl;
      }
      if (pat && !req.headers['X-PAT'] && !req.headers['x-pat']) {
        req.headers['X-PAT'] = pat;
      }
      if (project && !req.headers['X-Project'] && !req.headers['x-project']) {
        req.headers['X-Project'] = project;
      }
    }

    if (isDev) {
      console.log(`[DEBUG] ${req.method?.toUpperCase()} ${req.baseURL || ''}${req.url}`, {
        headers: req.headers,
        data: req.data
      });
    }
  } catch (e) { /* ignore */ }
  return req;
});

apiClient.interceptors.response.use((res) => {
  try {
    if (isDev) {
      console.log('[DEBUG] response', res.status, res.config.url, res.data?.success);
    }
  } catch (e) { /* ignore */ }
  return res;
}, (err) => {
  try {
    if (isDev) {
      console.warn('[DEBUG] response error', err?.response?.status, err?.config?.url, err?.response?.data);
    }
  } catch (e) { /* ignore */ }
  return Promise.reject(err);
});

export default apiClient;

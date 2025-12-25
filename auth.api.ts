import { apiClient } from '../../shared/services/apiClient';
import { LoginPayload, TestConnectionPayload } from './auth.types';

export const authApi = {
  testConnection: (payload: TestConnectionPayload) => apiClient.post('/api/auth/test-connection', payload),
  login: (payload: LoginPayload) => apiClient.post('/api/auth/login', payload),
  logout: () => apiClient.post('/api/auth/logout')
};

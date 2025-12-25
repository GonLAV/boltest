import { apiClient } from '../../shared/services/apiClient';
import { Step } from './testCase.types';

export const testCaseApi = {
  uploadAttachment: (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return apiClient.post('/api/attachments', fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  createTestCase: (payload: {
    title: string;
    description?: string;
    steps: Step[];
    tags?: string;
    priority?: number;
    state?: string;
    area?: string;
    iteration?: string;
    userStoryId?: number | null;
    attachmentIds?: string[];
  }) => apiClient.post('/api/testcases/create', payload),
  
  createTestCaseWithFiles: (formData: FormData) => apiClient.post('/api/testcases/create-with-files', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  getTestCases: () => apiClient.get('/api/testcases'),
  
  getTestCaseById: (testCaseId: number) => apiClient.get(`/api/testcases/${testCaseId}`),
  
  updateTestCase: (testCaseId: number, payload: {
    title: string;
    description?: string;
    steps: Step[];
    tags?: string;
    priority?: number;
    state?: string;
    area?: string;
    iteration?: string;
  }) => apiClient.patch(`/api/testcases/${testCaseId}`, payload)
};

export const wikiAttachmentApi = {
  uploadAttachment: (file: File, wikiIdentifier: string = 'wiki') => {
    const fd = new FormData();
    fd.append('attachment', file);
    fd.append('wikiIdentifier', wikiIdentifier);
    return apiClient.post('/api/wiki-attachments/upload', fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  getAttachment: (wikiIdentifier: string, attachmentPath: string) =>
    apiClient.get(`/api/wiki-attachments/${wikiIdentifier}/attachments?path=${encodeURIComponent(attachmentPath)}`),
  
  deleteAttachment: (wikiIdentifier: string, attachmentPath: string) =>
    apiClient.delete(`/api/wiki-attachments/${wikiIdentifier}/attachments?path=${encodeURIComponent(attachmentPath)}`)
};

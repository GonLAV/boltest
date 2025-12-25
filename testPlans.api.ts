import { apiClient } from '../../shared/services/apiClient';

export type TestPlan = {
  id: number;
  name: string;
  state?: string;
  startDate?: string;
  endDate?: string;
  rootSuiteId?: number;
  revision?: number;
};

export type TestSuite = {
  id: number;
  name: string;
  suiteType?: string;
  parentSuite?: { id: number; name?: string } | null;
  testCaseCount?: number;
  children?: TestSuite[];
};

export type GetPlansRequest = {
  org: string;
  project: string;
  backendKey?: string;
};

export type GetSuitesRequest = {
  org: string;
  project: string;
  planId: number;
  backendKey?: string;
};

const withBackendKey = (backendKey?: string) =>
  backendKey
    ? {
        headers: { 'x-backend-key': backendKey }
      }
    : {};

export const testPlansApi = {
  getPlans: ({ org, project, backendKey }: GetPlansRequest) =>
    apiClient.get('/api/ado/testplans', {
      params: { org, project },
      ...withBackendKey(backendKey)
    }),
  getSuites: ({ org, project, planId, backendKey }: GetSuitesRequest) =>
    apiClient.get('/api/ado/testsuites', {
      params: { org, project, planId },
      ...withBackendKey(backendKey)
    })
};

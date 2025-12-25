import { apiClient } from '../../shared/services/apiClient';

export type UserStory = {
  id: number;
  title: string;
  state: string;
  assignedTo: string;
  areaPath: string;
  url: string;
  relatedTestCases: any[];
};

export const storiesApi = {
  // Fetch all user stories from Azure DevOps
  getUserStories: (orgUrl: string, project: string, areaPath?: string) => {
    const params = new URLSearchParams({ project });
    if (areaPath) params.append('areaPath', areaPath);
    const pat = localStorage.getItem('boltest:pat') || '';
    const org = orgUrl || localStorage.getItem('boltest:orgUrl') || '';
    return apiClient.get(`/api/ado/userstories?${params.toString()}`, {
      headers: { 'X-PAT': pat, 'X-OrgUrl': org }
    });
  },

  // Get user stories WITHOUT test cases
  getStoriesWithoutTests: (orgUrl: string, project: string, areaPath?: string) => {
    const params = new URLSearchParams({ project });
    if (areaPath) params.append('areaPath', areaPath);
    const pat = localStorage.getItem('boltest:pat') || '';
    const org = orgUrl || localStorage.getItem('boltest:orgUrl') || '';
    return apiClient.get(`/api/ado/userstories/notests?${params.toString()}`, {
      headers: { 'X-PAT': pat, 'X-OrgUrl': org }
    });
  },

  // Get user stories WITH test cases
  getStoriesWithTests: (orgUrl: string, project: string, areaPath?: string) => {
    const params = new URLSearchParams({ project });
    if (areaPath) params.append('areaPath', areaPath);
    const pat = localStorage.getItem('boltest:pat') || '';
    const org = orgUrl || localStorage.getItem('boltest:orgUrl') || '';
    return apiClient.get(`/api/ado/userstories/hastests?${params.toString()}`, {
      headers: { 'X-PAT': pat, 'X-OrgUrl': org }
    });
  },

  // Get test cases linked to a user story
  getTestCasesForStory: (userStoryId: number) =>
    apiClient.get(`/api/ado/userstories/${userStoryId}/testcases`)
};

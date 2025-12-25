import React, { useEffect, useMemo, useState, useRef, useCallback, useDeferredValue } from 'react';
import './UserStoriesView.css';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { storiesApi, UserStory } from '../stories.api';

const UserStoriesView: React.FC = () => {
  const navigate = useNavigate();
  const [allStories, setAllStories] = useState<UserStory[]>([]);
  const [storiesNoTests, setStoriesNoTests] = useState<UserStory[]>([]);
  const [storiesWithTests, setStoriesWithTests] = useState<UserStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'hasTests' | 'noTests'>('all');
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [areaPath, setAreaPath] = useState(
    localStorage.getItem('boltest:areaPath') || "Epos\\RnD\\Abigail's Team"
  );
  const didInitFetch = useRef(false);

  const fetchUserStories = useCallback(async () => {
    try {
      setLoading(true);
      localStorage.setItem('boltest:areaPath', areaPath.trim());
      const orgUrl = localStorage.getItem('boltest:orgUrl') || 'https://tlvtfs03.ciosus.com/tfs/BoltCollection';
      const project = localStorage.getItem('boltest:project') || 'Epos';

      // Wrap request with a timeout to avoid hanging UI
      const withTimeout = <T,>(p: Promise<T>, ms = 12000): Promise<T> => {
        return Promise.race([
          p,
          new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Request timed out')), ms))
        ]);
      };

      // Single round-trip: fetch once and derive the subsets client-side
      const resp = await withTimeout(
        storiesApi.getUserStories(orgUrl, project, areaPath.trim() || undefined)
      );

      const userStories: UserStory[] = resp?.data?.data?.userStories || [];
      setAllStories(userStories);

      const withTestsList = userStories.filter((story: UserStory) => (story.relatedTestCases || []).length > 0);
      const noTestsList = userStories.filter((story: UserStory) => (story.relatedTestCases || []).length === 0);
      setStoriesWithTests(withTestsList);
      setStoriesNoTests(noTestsList);

      toast.success(`Loaded ${userStories.length} stories: ${withTestsList.length} with tests, ${noTestsList.length} without`);
    } catch (err: any) {
      console.error('Error fetching user stories:', err);
      toast.error('Error loading user stories from Azure DevOps');
      setAllStories([]);
      setStoriesNoTests([]);
      setStoriesWithTests([]);
    } finally {
      setLoading(false);
    }
  }, [areaPath]);

  // Fetch on mount once
  useEffect(() => {
    if (didInitFetch.current) return;
    didInitFetch.current = true;
    fetchUserStories();
  }, [fetchUserStories]);

  // Get the appropriate stories list based on current filter
  const stories = useMemo(() => {
    switch (filter) {
      case 'noTests':
        return storiesNoTests;
      case 'hasTests':
        return storiesWithTests;
      default:
        return allStories;
    }
  }, [filter, allStories, storiesNoTests, storiesWithTests]);

  const filtered = useMemo(() => {
    return stories.filter((story) => {
      const q = deferredSearch.trim().toLowerCase();
      const matchSearch = q
        ? story.title.toLowerCase().includes(q) || story.id.toString().includes(q)
        : true;
      return matchSearch;
    });
  }, [deferredSearch, stories]);

  const handleAddTest = (storyId: number, storyTitle: string) => {
    // Navigate to create test case with pre-filled user story (state keeps form data intact)
    navigate('/app/create', { state: { userStoryId: storyId, userStoryTitle: storyTitle } });
  };

  const handleViewTests = (testCases: any[], storyId: number) => {
    const tests = (testCases || []).filter((tc) => tc && tc.id);
    if (!tests.length) {
      toast.info(`No tests linked to story ${storyId} yet.`);
      return;
    }

    if (tests.length > 1) {
      toast.info(`Opening first of ${tests.length} tests for story ${storyId}.`);
    }

    navigate(`/app/edit-test/${tests[0].id}`);
  };

  if (loading) {
    return (
      <div id="myStoriesView">
        <div className="filter-bar">
          <span>⏳ Loading user stories...</span>
        </div>
      </div>
    );
  }

  return (
    <div id="myStoriesView">
      <div className="filter-bar">
        <input
          type="text"
          className="search-box area-path-box"
          placeholder="Area path (e.g. Epos\\RnD\\Team)"
          value={areaPath}
          onChange={(e) => setAreaPath(e.target.value)}
        />
        <button className="filter-btn" onClick={fetchUserStories}>
          <span>🔁</span> <span>Apply Team Filter</span>
        </button>
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`} 
          onClick={() => setFilter('all')}
        >
          <span>📋</span> <span>All Stories ({allStories.length})</span>
        </button>
        <button 
          className={`filter-btn ${filter === 'noTests' ? 'active' : ''}`} 
          onClick={() => setFilter('noTests')}
        >
          <span>❌</span> <span>No Tests ({storiesNoTests.length})</span>
        </button>
        <button 
          className={`filter-btn ${filter === 'hasTests' ? 'active' : ''}`} 
          onClick={() => setFilter('hasTests')}
        >
          <span>✅</span> <span>Has Tests ({storiesWithTests.length})</span>
        </button>
        <input
          type="text"
          className="search-box"
          placeholder="🔍 Search user stories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="user-stories-grid" id="storiesGrid">
        {filtered.length === 0 ? (
          <div className="empty-full"><p>No user stories found</p></div>
        ) : (
          filtered.map((story) => {
            const tests = (story.relatedTestCases || []).filter((tc) => tc && tc.id);
            const hasTests = tests.length > 0;
            const testCount = tests.length;
            return (
              <div
                key={story.id}
                className={`story-card ${hasTests ? 'has-tests' : 'no-tests'}`}
                data-has-tests={hasTests}
              >
                <div className="story-header">
                  <span className="story-id">{story.id}</span>
                  <span className={`story-status`}>{story.state}</span>
                </div>
                <h3 className="story-title">{story.title}</h3>
                <div className="story-meta">
                  <span className="story-badge">🧪 <span>{hasTests ? `${testCount} Tests` : 'No Tests'}</span></span>
                  <span className="story-badge">👤 <span>{story.assignedTo}</span></span>
                  {story.areaPath && <span className="story-badge">📁 <span>{story.areaPath.split('\\').pop()}</span></span>}
                </div>
                <div className="story-actions">
                  <button
                    className="btn-story-action primary"
                    onClick={() => handleAddTest(story.id, story.title)}
                  >
                    ➕ <span>Add Test</span>
                  </button>
                  {hasTests && (
                    <button
                      className="btn-story-action"
                      onClick={() => handleViewTests(story.relatedTestCases || [], story.id)}
                    >
                      👁️ <span>View {testCount} Tests</span>
                    </button>
                  )}
                </div>
                {hasTests && (
                  <div className="story-tests">
                    {tests.map((tc) => (
                      <button
                        key={tc.id}
                        className="btn-story-action"
                        
                        onClick={() => navigate(`/app/edit-test/${tc.id}`)}
                      >
                        ✏️ {tc.title || `Test #${tc.id}`}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default UserStoriesView;

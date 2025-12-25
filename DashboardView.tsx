import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { storiesApi, UserStory } from '../../stories/stories.api';
import './DashboardView.css';

type StoryInsight = {
  requiredTests: number;
  missingCoverage: number;
  riskScore: number;
  explanation: string;
};

type StoryViewModel = UserStory & StoryInsight;

type Summary = {
  totalTests: number;
  testsWithoutStory: number;
  storiesWithoutTests: number;
  testsNeverExecuted: number;
  riskyStories: number;
};

const computeInsight = (story: UserStory): StoryInsight => {
  const tests = (story.relatedTestCases || []).filter(Boolean);
  const testCount = tests.length;

  const priorityHint = tests.reduce((acc, t: any) => {
    const p = Number(t.priority) || 3;
    return Math.min(acc, p);
  }, 5);

  const stateHint = (story.state || '').toLowerCase();
  const stateRisk = ['new', 'active', 'proposed'].includes(stateHint) ? 15 : 0;

  const titleComplexity = Math.min(3, Math.ceil((story.title || '').split(' ').length / 4));
  const requiredTests = Math.max(2, titleComplexity + (priorityHint === 1 ? 3 : priorityHint === 2 ? 2 : 1));
  const missingCoverage = Math.max(requiredTests - testCount, 0);

  const riskScore = Math.min(100, Math.round(
    missingCoverage * 18 + (priorityHint === 1 ? 25 : priorityHint === 2 ? 18 : 10) + stateRisk
  ));

  const reasons: string[] = [];
  if (missingCoverage > 0) reasons.push(`${missingCoverage} test gap`);
  if (priorityHint <= 2) reasons.push(`priority ${priorityHint}`);
  if (stateRisk) reasons.push(`state ${story.state || 'Unknown'}`);
  if (!reasons.length) reasons.push('steady coverage');

  const explanation = `Risk driven by ${reasons.join(', ')}; target ${requiredTests} tests.`;

  return { requiredTests, missingCoverage, riskScore, explanation };
};

const computeSummary = (stories: StoryViewModel[]): Summary => {
  const uniqueTests = new Map<number, any>();
  const neverExecuted = new Set<number>();

  stories.forEach((story) => {
    (story.relatedTestCases || []).forEach((tc: any) => {
      if (!tc || !tc.id) return;
      uniqueTests.set(tc.id, tc);
      const state = (tc.state || '').toLowerCase();
      if (!state || state === 'design' || state === 'new' || state === 'proposed') {
        neverExecuted.add(tc.id);
      }
    });
  });

  const totalTests = uniqueTests.size;
  const storiesWithoutTests = stories.filter((s) => (s.relatedTestCases || []).length === 0).length;

  // Without a global test index we can only estimate "tests without story" from what we see.
  const testsWithoutStory = 0;
  const riskyStories = stories.filter((s) => s.riskScore >= 60).length;

  return { totalTests, testsWithoutStory, storiesWithoutTests, testsNeverExecuted: neverExecuted.size, riskyStories };
};

const DashboardView: React.FC = () => {
  const navigate = useNavigate();
  const [stories, setStories] = useState<StoryViewModel[]>([]);
  const [summary, setSummary] = useState<Summary>({ totalTests: 0, testsWithoutStory: 0, storiesWithoutTests: 0, testsNeverExecuted: 0, riskyStories: 0 });
  const [loading, setLoading] = useState(false);
  const [areaPath, setAreaPath] = useState(
    localStorage.getItem('boltest:areaPath') || "Epos\\RnD\\Abigail's Team"
  );
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const loadStories = useCallback(async () => {
    try {
      setLoading(true);
      localStorage.setItem('boltest:areaPath', areaPath.trim());
      const orgUrl = localStorage.getItem('boltest:orgUrl') || 'https://tlvtfs03.ciosus.com/tfs/BoltCollection';
      const project = localStorage.getItem('boltest:project') || 'Epos';
      const resp = await storiesApi.getUserStories(orgUrl, project, areaPath.trim() || undefined);
      const userStories: UserStory[] = resp?.data?.data?.userStories || [];
      const withInsights = userStories.map((s) => ({ ...s, ...computeInsight(s) }));
      setStories(withInsights);
      setSummary(computeSummary(withInsights));
      toast.success(`Loaded ${withInsights.length} stories for team filter`);
    } catch (err: any) {
      console.error('dashboard fetch failed', err);
      toast.error('Failed to load user stories for dashboard');
      setStories([]);
      setSummary({ totalTests: 0, testsWithoutStory: 0, storiesWithoutTests: 0, testsNeverExecuted: 0, riskyStories: 0 });
    } finally {
      setLoading(false);
    }
  }, [areaPath]);

  useEffect(() => {
    loadStories();
  }, [loadStories]);

  const filteredStories = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return stories;
    return stories.filter((s) =>
      s.title.toLowerCase().includes(q) || s.id.toString().includes(q) || (s.assignedTo || '').toLowerCase().includes(q)
    );
  }, [search, stories]);

  const headline = useMemo(() => {
    return `Found ${stories.length} stories · ${summary.totalTests} tests · ${summary.riskyStories} risks`;
  }, [stories.length, summary.totalTests, summary.riskyStories]);

  const selectedStory = selectedId ? stories.find((s) => s.id === selectedId) || null : null;

  return (
    <div id="dashboardView">
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Area path (team)"
          value={areaPath}
          onChange={(e) => setAreaPath(e.target.value)}
          className="search-box dash-area-input"
        />
        <button className="filter-btn" onClick={loadStories} disabled={loading}>
          <span>{loading ? '⏳' : '🔁'}</span> <span>Apply Team Filter</span>
        </button>
        <input
          type="text"
          className="search-box"
          placeholder="🔍 Search stories or owner"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="stats-grid">
        {[{
          icon: '🧪',
          label: 'Total tests',
          value: summary.totalTests
        }, {
          icon: '🔗',
          label: 'Tests with no linked story',
          value: summary.testsWithoutStory
        }, {
          icon: '❌',
          label: 'Stories with no tests',
          value: summary.storiesWithoutTests
        }, {
          icon: '⏳',
          label: 'Tests never executed (est.)',
          value: summary.testsNeverExecuted
        }].map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-label">{stat.label}</div>
            <div className="stat-value">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="recent-section dash-mt-16">
        <div className="section-title dash-section-title-row">
          <span>📌 Team User Stories</span>
          <span className="dash-headline">{headline}</span>
        </div>
        {loading ? (
          <div className="dash-loading">Loading stories...</div>
        ) : (
          <div className="user-stories-grid" id="dashboardStoriesGrid">
            {filteredStories.length === 0 ? (
              <div className="dash-empty">
                <p>No user stories match your filter</p>
              </div>
            ) : (
              filteredStories.map((story) => (
                <div
                  key={story.id}
                  className={`story-card dash-clickable ${story.missingCoverage > 0 ? 'no-tests' : 'has-tests'}`}
                  onClick={() => setSelectedId(story.id)}
                >
                  <div className="story-header">
                    <span className="story-id">{story.id}</span>
                    <span className="story-badge">{story.state}</span>
                  </div>
                  <h3 className="story-title">{story.title}</h3>
                  <div className="story-meta">
                    <span className="story-badge">👤 <span>{story.assignedTo || 'Unassigned'}</span></span>
                    {story.areaPath && <span className="story-badge">📁 <span>{story.areaPath.split('\\').pop()}</span></span>}
                    <span className="story-badge">🧪 <span>{(story.relatedTestCases || []).length} tests</span></span>
                  </div>
                  <div className="story-meta dash-meta-top">
                    <span className="story-badge">📏 Required: {story.requiredTests}</span>
                    <span className="story-badge">❌ Missing: {story.missingCoverage}</span>
                    <span className="story-badge">⚠️ Risk: {story.riskScore}</span>
                  </div>
                  <div className="dash-explanation">
                    🧠 {story.explanation}
                  </div>
                  <div className="story-actions dash-actions">
                    <button className="btn-story-action primary" onClick={(e) => { e.stopPropagation(); navigate('/app/create', { state: { userStoryId: story.id, userStoryTitle: story.title } }); }}>
                      ➕ Add Test
                    </button>
                    {(story.relatedTestCases || []).length > 0 && (
                      <button className="btn-story-action" onClick={(e) => { e.stopPropagation(); navigate(`/app/edit-test/${story.relatedTestCases[0].id}`); }}>
                        👁️ View Tests
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {selectedStory && (
        <div className="recent-section dash-mt-20">
          <div className="section-title">🔎 Selected Story</div>
          <div className="stat-card dash-stat-card-start">
            <div className="dash-selected-header">
              <div>
                <div className="recent-item-title">{selectedStory.title}</div>
                <div className="recent-item-meta">Owner: {selectedStory.assignedTo || 'Unassigned'} · State: {selectedStory.state}</div>
              </div>
              <div className="story-badge">Risk {selectedStory.riskScore}</div>
            </div>
            <div className="dash-mt-12">
              <strong>Required tests:</strong> {selectedStory.requiredTests} | <strong>Missing coverage:</strong> {selectedStory.missingCoverage}
            </div>
            <div className="dash-mt-8">🧠 {selectedStory.explanation}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardView;

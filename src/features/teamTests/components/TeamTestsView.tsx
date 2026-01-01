import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { testCaseApi, tagSuggestionApi } from '../../testCases/testCase.api';
import './TeamTestsView.css';
import { getTagSuggestions, saveTagHistory } from '../../testCases/utils/tagSuggestions';

interface TestCase {
  id: number;
  title: string;
  state: string;
  assignedTo: string;
  createdBy?: string;
  createdDate?: string;
  stepsCount?: number;
  url?: string;
  tags?: string | string[];
}

type SortField = 'id' | 'title' | 'state' | 'createdDate' | 'stepsCount';
type SortDirection = 'asc' | 'desc';
type ViewMode = 'grid' | 'list' | 'compact';

const TeamTestsView: React.FC = () => {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterState, setFilterState] = useState<string>('');
  const [tagFilter, setTagFilter] = useState<string>('');
  const [tagQuery, setTagQuery] = useState<string>('');
  const [showTagSuggest, setShowTagSuggest] = useState<boolean>(false);
  const [serverTagSuggestions, setServerTagSuggestions] = useState<string[]>([]);
  
  // New state for improvements
  const [selectedTests, setSelectedTests] = useState<Set<number>>(new Set());
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showStats, setShowStats] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [quickViewId, setQuickViewId] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<Set<number>>(
    new Set(JSON.parse(localStorage.getItem('boltest:favorites') || '[]'))
  );
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  useEffect(() => {
    const fetchTestCases = async () => {
      try {
        setLoading(true);
        const resp = await testCaseApi.getTestCases();
        
        if (resp?.data?.success && resp.data.data?.testCases) {
          setTestCases(resp.data.data.testCases);
          toast.success(`Loaded ${resp.data.data.testCases.length} test cases`);
        } else {
          setTestCases([]);
        }
      } catch (err: any) {
        console.error('Error fetching test cases:', err);
        toast.error('Failed to load test cases');
        setTestCases([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTestCases();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K for keyboard help
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowKeyboardHelp(true);
      }
      // Ctrl/Cmd + A to select all
      if ((e.ctrlKey || e.metaKey) && e.key === 'a' && e.target instanceof HTMLInputElement === false) {
        e.preventDefault();
        if (selectedTests.size === filtered.length) {
          setSelectedTests(new Set());
        } else {
          setSelectedTests(new Set(filtered.map(tc => tc.id)));
        }
      }
      // Escape to clear selection
      if (e.key === 'Escape') {
        setSelectedTests(new Set());
        setQuickViewId(null);
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [selectedTests, filtered]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    testCases.forEach((tc) => {
      const t = tc.tags;
      const list = Array.isArray(t)
        ? t
        : (t || '')
            .split(/[;,]/)
            .map((s) => s.trim())
            .filter(Boolean);
      list.forEach((x) => set.add(x));
    });
    return Array.from(set).sort();
  }, [testCases]);

  const tagSuggestions = useMemo(() => getTagSuggestions(allTags), [allTags]);
  const combinedTagSuggestions = useMemo(() => {
    const set = new Set<string>();
    tagSuggestions.forEach((t) => set.add(t));
    serverTagSuggestions.forEach((t) => set.add(t));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [tagSuggestions, serverTagSuggestions]);

  useEffect(() => {
    if (!loading) {
      const fetchTags = async () => {
        try {
          const resp = await tagSuggestionApi.getSuggestions({ top: 500 });
          const tags = resp?.data?.data?.tags || [];
          if (Array.isArray(tags) && tags.length) {
            setServerTagSuggestions(tags);
          }
        } catch (e) {
          // silent
        }
      };
      fetchTags();
    }
  }, [loading]);

  const filtered = useMemo(() => {
    let result = testCases.filter((tc) => {
      const matchSearch = search.trim()
        ? tc.title.toLowerCase().includes(search.toLowerCase()) || tc.id.toString().includes(search)
        : true;
      const matchState = filterState ? tc.state === filterState : true;
      const list = Array.isArray(tc.tags)
        ? tc.tags
        : (tc.tags || '')
            .split(/[;,]/)
            .map((s) => s.trim())
            .filter(Boolean);
      const matchTag = tagFilter ? list.includes(tagFilter) : true;
      const matchFavorite = showFavoritesOnly ? favorites.has(tc.id) : true;
      return matchSearch && matchState && matchTag && matchFavorite;
    });

    // Apply sorting
    result.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === 'createdDate') {
        aVal = new Date(aVal || 0).getTime();
        bVal = new Date(bVal || 0).getTime();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [testCases, search, filterState, tagFilter, showFavoritesOnly, favorites, sortField, sortDirection]);

  const stats = useMemo(() => {
    return {
      total: testCases.length,
      design: testCases.filter(tc => tc.state === 'Design').length,
      ready: testCases.filter(tc => tc.state === 'Ready').length,
      active: testCases.filter(tc => tc.state === 'Active').length,
      closed: testCases.filter(tc => tc.state === 'Closed').length,
      favorites: favorites.size,
      selected: selectedTests.size,
    };
  }, [testCases, favorites, selectedTests]);

  const handleEditTest = (testCaseId: number) => {
    window.location.href = `/app/edit-test/${testCaseId}`;
  };

  const handleCopyTest = async (testCaseId: number) => {
    try {
      const resp = await testCaseApi.cloneTestCase(testCaseId);
      if (resp?.data?.success) {
        const newId = resp?.data?.data?.id;
        toast.success(`✅ Copied test case #${testCaseId} → #${newId}`);
        if (newId) {
          window.location.href = `/app/edit-test/${newId}`;
        }
      } else {
        toast.error(resp?.data?.message || 'Failed to copy test case');
      }
    } catch (err: any) {
      console.error('Copy failed', err);
      toast.error(err?.response?.data?.message || 'Failed to copy test case');
    }
  };

  const toggleFavorite = (testCaseId: number) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(testCaseId)) {
      newFavorites.delete(testCaseId);
      toast.info(`Removed from favorites`);
    } else {
      newFavorites.add(testCaseId);
      toast.success(`Added to favorites`);
    }
    setFavorites(newFavorites);
    localStorage.setItem('boltest:favorites', JSON.stringify(Array.from(newFavorites)));
  };

  const toggleSelection = (testCaseId: number) => {
    const newSelected = new Set(selectedTests);
    if (newSelected.has(testCaseId)) {
      newSelected.delete(testCaseId);
    } else {
      newSelected.add(testCaseId);
    }
    setSelectedTests(newSelected);
  };

  const handleBulkCopy = async () => {
    if (selectedTests.size === 0) {
      toast.warning('No test cases selected');
      return;
    }

    const confirmed = window.confirm(`Clone ${selectedTests.size} test case(s)?`);
    if (!confirmed) return;

    toast.info(`Cloning ${selectedTests.size} test cases...`);
    let successCount = 0;

    for (const id of Array.from(selectedTests)) {
      try {
        await testCaseApi.cloneTestCase(id);
        successCount++;
      } catch (err) {
        console.error(`Failed to clone ${id}`, err);
      }
    }

    toast.success(`✅ Cloned ${successCount} of ${selectedTests.size} test cases`);
    setSelectedTests(new Set());
    
    // Reload
    window.location.reload();
  };

  const exportToCSV = () => {
    const data = filtered.map(tc => ({
      ID: tc.id,
      Title: tc.title,
      State: tc.state,
      'Assigned To': tc.assignedTo,
      'Created Date': tc.createdDate || '',
      'Steps Count': tc.stepsCount || 0,
      Tags: Array.isArray(tc.tags) ? tc.tags.join('; ') : (tc.tags || '')
    }));

    const headers = Object.keys(data[0] || {});
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(h => `"${(row as any)[h]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-cases-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${data.length} test cases to CSV`);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="page-card tc-shell tc-wide tt-root" id="teamTestsView">
      <div className="tt-header">
        <h2 className="tt-title">
          🧪 Team Test Cases
        </h2>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button className="btn-secondary" onClick={() => setShowStats(!showStats)} title="Toggle Statistics">
            📊 Stats
          </button>
          <button className="btn-secondary" onClick={() => setShowKeyboardHelp(true)} title="Keyboard Shortcuts (Ctrl+K)">
            ⌨️
          </button>
          <button className="btn-secondary" onClick={exportToCSV} title="Export to CSV">
            📥 Export
          </button>
        </div>
      </div>

      {/* Statistics Panel */}
      {showStats && (
        <div className="tc-banner info" style={{ marginBottom: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
            <div><strong>Total:</strong> {stats.total}</div>
            <div><strong>Design:</strong> {stats.design}</div>
            <div><strong>Ready:</strong> {stats.ready}</div>
            <div><strong>Active:</strong> {stats.active}</div>
            <div><strong>Closed:</strong> {stats.closed}</div>
            <div><strong>Favorites:</strong> {stats.favorites}</div>
            <div><strong>Selected:</strong> {stats.selected}</div>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedTests.size > 0 && (
        <div className="tc-banner success" style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong>{selectedTests.size} test case(s) selected</strong>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn-secondary" onClick={handleBulkCopy}>
                📄 Clone Selected
              </button>
              <button className="btn-secondary danger" onClick={() => setSelectedTests(new Set())}>
                ✕ Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      <p className="tt-subtitle">
        {search || filterState || tagFilter ? (
          <>
            Found <span className="tt-accent">{filtered.length}</span> of{' '}
            <span className="tt-strong">{testCases.length}</span> test cases
            {search && ` matching "${search}"`}
            {filterState && ` with state "${filterState}"`}
            {tagFilter && ` tagged "${tagFilter}"`}
          </>
        ) : (
          <>
            Total: <span className="tt-accent">{testCases.length}</span> test cases
          </>
        )}
      </p>

      {/* Filters */}
      <div className="tt-filters">
        <div className="tt-search-wrap">
          <input
            type="text"
            placeholder="🔍 Search by title or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="tt-search-input"
          />
          <span className="tt-search-icon">
            🔍
          </span>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="tt-clear-btn"
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <select
          value={filterState}
          onChange={(e) => setFilterState(e.target.value)}
          className="tt-state-select"
          aria-label="Filter by state"
        >
          <option value="">All States</option>
          <option value="Design">Design</option>
          <option value="Ready">Ready</option>
          <option value="Active">Active</option>
          <option value="Closed">Closed</option>
        </select>

        <div className="tt-tag-typeahead" onBlur={() => setTimeout(() => setShowTagSuggest(false), 120)}>
          <input
            value={tagQuery}
            onFocus={() => setShowTagSuggest(true)}
            onChange={(e) => {
              setTagQuery(e.target.value);
              setShowTagSuggest(true);
            }}
            placeholder="Filter by tag..."
            aria-label="Filter by tag"
            className="tt-state-select"
          />
          {showTagSuggest && (
            <div className="tt-suggest-list">
              <div
                className={`tt-suggest-item ${tagFilter === '' ? 'active' : ''}`}
                onMouseDown={() => {
                  setTagFilter('');
                  setTagQuery('');
                }}
              >
                All Tags
              </div>
              {combinedTagSuggestions
                .filter((t) => t.toLowerCase().includes(tagQuery.toLowerCase()))
                .slice(0, 20)
                .map((t) => (
                  <div
                    key={t}
                    className={`tt-suggest-item ${tagFilter === t ? 'active' : ''}`}
                    onMouseDown={() => {
                      setTagFilter(t);
                      setTagQuery(t);
                      saveTagHistory(t);
                    }}
                  >
                    #{t}
                  </div>
                ))}
            </div>
          )}
        </div>

        <button
          className={`btn-secondary ${showFavoritesOnly ? 'active' : ''}`}
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          title="Show favorites only"
        >
          ⭐ Favorites
        </button>

        {(search || filterState || tagFilter) && (
          <button
            onClick={() => {
              setSearch('');
              setFilterState('');
              setTagFilter('');
              setTagQuery('');
            }}
            className="tt-reset-btn"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* View Mode & Sort Controls */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            className={`btn-secondary ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Grid view"
          >
            ▦
          </button>
          <button
            className={`btn-secondary ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            title="List view"
          >
            ☰
          </button>
          <button
            className={`btn-secondary ${viewMode === 'compact' ? 'active' : ''}`}
            onClick={() => setViewMode('compact')}
            title="Compact view"
          >
            ▤
          </button>
        </div>

        <select
          value={sortField}
          onChange={(e) => handleSort(e.target.value as SortField)}
          className="tt-state-select"
          style={{ width: 'auto' }}
        >
          <option value="id">Sort by ID</option>
          <option value="title">Sort by Title</option>
          <option value="state">Sort by State</option>
          <option value="createdDate">Sort by Date</option>
          <option value="stepsCount">Sort by Steps</option>
        </select>

        <button
          className="btn-secondary"
          onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
          title={`Sort ${sortDirection === 'asc' ? 'descending' : 'ascending'}`}
        >
          {sortDirection === 'asc' ? '↑' : '↓'}
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="tt-state-text">
          Loading test cases...
        </div>
      )}

      {/* Test Cases Grid/List */}
      {!loading && filtered.length === 0 && (
        <div className="tt-state-text">
          No test cases found
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className={`tt-grid ${viewMode === 'list' ? 'tt-list' : viewMode === 'compact' ? 'tt-compact' : ''}`}>
          {filtered.map((tc) => (
            <div
              key={tc.id}
              className={`tt-card ${selectedTests.has(tc.id) ? 'selected' : ''}`}
            >
              {/* Selection Checkbox */}
              <div style={{ position: 'absolute', top: '8px', left: '8px' }}>
                <input
                  type="checkbox"
                  checked={selectedTests.has(tc.id)}
                  onChange={() => toggleSelection(tc.id)}
                  onClick={(e) => e.stopPropagation()}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </div>

              {/* Favorite Star */}
              <div style={{ position: 'absolute', top: '8px', right: '8px' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(tc.id);
                  }}
                  className="btn-secondary"
                  style={{ padding: '4px 8px', fontSize: '16px' }}
                  title={favorites.has(tc.id) ? 'Remove from favorites' : 'Add to favorites'}
                >
                  {favorites.has(tc.id) ? '⭐' : '☆'}
                </button>
              </div>

              {/* Header */}
              <div className="tt-card-header" style={{ marginTop: '24px' }}>
                <div>
                  <h4 className="tt-card-id">
                    #{tc.id}
                  </h4>
                  <p className="tt-card-title">
                    {tc.title}
                  </p>
                </div>
                <span
                  className={`tt-state-badge ${tc.state === 'Design' ? 'design' : tc.state === 'Ready' ? 'ready' : 'other'}`}
                >
                  {tc.state}
                </span>
              </div>

              {/* Meta */}
              <div className="tt-meta">
                <div>👤 {tc.assignedTo || 'Unassigned'}</div>
                {tc.stepsCount && <div>📋 {tc.stepsCount} steps</div>}
                {tc.createdDate && <div>📅 {new Date(tc.createdDate).toLocaleDateString()}</div>}
              </div>

              {/* Tags */}
              {(() => {
                const list = Array.isArray(tc.tags)
                  ? tc.tags
                  : (tc.tags || '')
                      .split(/[;,]/)
                      .map((s) => s.trim())
                      .filter(Boolean);
                return list.length ? (
                  <div className="tt-tags">
                    {list.map((tag) => (
                      <span key={tag} className="tt-tag-badge">#{tag}</span>
                    ))}
                  </div>
                ) : null;
              })()}

              {/* Actions */}
              <div className="tt-actions">
                <button
                  onClick={() => handleEditTest(tc.id)}
                  className="tt-edit-btn"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleCopyTest(tc.id)}
                  className="tt-copy-btn"
                >
                  📄 Copy
                </button>
                <button
                  onClick={() => setQuickViewId(tc.id)}
                  className="btn-secondary"
                >
                  👁️ Quick View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Keyboard Shortcuts Modal */}
      {showKeyboardHelp && (
        <div className="re-modal" onClick={() => setShowKeyboardHelp(false)}>
          <div className="re-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="re-modal-title">⌨️ Keyboard Shortcuts</div>
            <div style={{ padding: '16px' }}>
              <div style={{ marginBottom: '12px' }}>
                <strong>Ctrl/Cmd + A</strong> - Select all test cases
              </div>
              <div style={{ marginBottom: '12px' }}>
                <strong>Ctrl/Cmd + K</strong> - Show keyboard shortcuts
              </div>
              <div style={{ marginBottom: '12px' }}>
                <strong>Escape</strong> - Clear selection / Close quick view
              </div>
            </div>
            <div className="re-modal-actions">
              <button className="re-btn azure" onClick={() => setShowKeyboardHelp(false)}>Got it!</button>
            </div>
          </div>
        </div>
      )}

      {/* Quick View Modal */}
      {quickViewId && (
        <div className="re-modal" onClick={() => setQuickViewId(null)}>
          <div className="re-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="re-modal-title">Quick View - Test Case #{quickViewId}</div>
            <div style={{ padding: '16px' }}>
              {(() => {
                const tc = testCases.find(t => t.id === quickViewId);
                if (!tc) return <p>Test case not found</p>;
                return (
                  <div>
                    <h3>{tc.title}</h3>
                    <p><strong>State:</strong> {tc.state}</p>
                    <p><strong>Assigned To:</strong> {tc.assignedTo || 'Unassigned'}</p>
                    <p><strong>Steps:</strong> {tc.stepsCount || 0}</p>
                    <p><strong>Created:</strong> {tc.createdDate ? new Date(tc.createdDate).toLocaleDateString() : 'N/A'}</p>
                    {tc.tags && (
                      <p><strong>Tags:</strong> {Array.isArray(tc.tags) ? tc.tags.join(', ') : tc.tags}</p>
                    )}
                  </div>
                );
              })()}
            </div>
            <div className="re-modal-actions">
              <button className="re-btn azure" onClick={() => handleEditTest(quickViewId)}>Open Full Editor</button>
              <button className="re-btn ghost" onClick={() => setQuickViewId(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamTestsView;

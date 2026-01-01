import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import StepsEditor from './StepsEditor';
import TemplatesModal from './TemplatesModal';
import { RichEditor } from './RichEditor';
import { Step } from '../testCase.types';
import { testCaseApi } from '../testCase.api';
import './EditTestCasePage.css';

interface LocationState {
  userStoryId?: number;
  userStoryTitle?: string;
  cloneFromId?: number;
}

interface DraftData {
  title: string;
  description: string;
  stateField: string;
  priority: string;
  area: string;
  iteration: string;
  tags: string;
  reason: string;
  steps: Step[];
  sharedParameterName: string;
  timestamp: number;
}

const DRAFT_KEY = 'boltest:createTestCaseDraft';
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

const CreateTestCasePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userStoryId = undefined, userStoryTitle = '', cloneFromId = undefined } = (location.state as LocationState) || {};

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [useRichEditor, setUseRichEditor] = useState(false);
  const [stateField, setStateField] = useState('Design');
  const [priority, setPriority] = useState('2');
  const [area, setArea] = useState('Epos');
  const [iteration, setIteration] = useState('Epos');
  const [tags, setTags] = useState('');
  const [reason, setReason] = useState('New');
  const [steps, setSteps] = useState<Step[]>([]);
  const [sharedParameterName, setSharedParameterName] = useState('');
  
  // UI state
  const [openTemplatesModal, setOpenTemplatesModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const [hasDraft, setHasDraft] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [similarTestCases, setSimilarTestCases] = useState<any[]>([]);
  const [checkingSimilar, setCheckingSimilar] = useState(false);

  // Load draft on mount
  useEffect(() => {
    const loadDraft = () => {
      try {
        const draftStr = localStorage.getItem(DRAFT_KEY);
        if (draftStr) {
          const draft: DraftData = JSON.parse(draftStr);
          // Check if draft is less than 7 days old
          const daysSinceDraft = (Date.now() - draft.timestamp) / (1000 * 60 * 60 * 24);
          if (daysSinceDraft < 7) {
            setHasDraft(true);
          } else {
            localStorage.removeItem(DRAFT_KEY);
          }
        }
      } catch (e) {
        console.error('Failed to load draft', e);
      }
    };
    loadDraft();
  }, []);

  // Load from clone if specified
  useEffect(() => {
    if (cloneFromId) {
      loadTestCaseForClone(cloneFromId);
    }
  }, [cloneFromId]);

  const loadTestCaseForClone = async (testCaseId: number) => {
    try {
      const resp = await testCaseApi.getTestCaseById(testCaseId);
      if (resp?.data?.success && resp.data.data) {
        const tc = resp.data.data;
        setTitle(`${tc.title} (Copy)`);
        setDescription(tc.description || '');
        setStateField(tc.state || 'Design');
        setPriority(String(tc.priority || 2));
        setArea(tc.area || 'Epos');
        setIteration(tc.iteration || 'Epos');
        setTags(tc.tags || '');
        setSteps(tc.steps || []);
        toast.success('✅ Loaded test case for cloning');
      }
    } catch (err) {
      console.error('Failed to load test case', err);
      toast.error('Failed to load test case for cloning');
    }
  };

  const restoreDraft = () => {
    try {
      const draftStr = localStorage.getItem(DRAFT_KEY);
      if (draftStr) {
        const draft: DraftData = JSON.parse(draftStr);
        setTitle(draft.title);
        setDescription(draft.description);
        setStateField(draft.stateField);
        setPriority(draft.priority);
        setArea(draft.area);
        setIteration(draft.iteration);
        setTags(draft.tags);
        setReason(draft.reason);
        setSteps(draft.steps);
        setSharedParameterName(draft.sharedParameterName);
        setHasDraft(false);
        toast.success('📝 Draft restored');
      }
    } catch (e) {
      console.error('Failed to restore draft', e);
      toast.error('Failed to restore draft');
    }
  };

  const discardDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setHasDraft(false);
    toast.info('Draft discarded');
  };

  // Auto-save draft
  useEffect(() => {
    if (!autoSaveEnabled) return;

    const timer = setInterval(() => {
      saveDraft();
    }, AUTO_SAVE_INTERVAL);

    return () => clearInterval(timer);
  }, [autoSaveEnabled, title, description, stateField, priority, area, iteration, tags, reason, steps, sharedParameterName]);

  const saveDraft = useCallback(() => {
    if (!title && steps.length === 0) return; // Don't save empty drafts

    try {
      const draft: DraftData = {
        title,
        description,
        stateField,
        priority,
        area,
        iteration,
        tags,
        reason,
        steps,
        sharedParameterName,
        timestamp: Date.now()
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      setLastSaved(Date.now());
    } catch (e) {
      console.error('Failed to save draft', e);
    }
  }, [title, description, stateField, priority, area, iteration, tags, reason, steps, sharedParameterName]);

  // Check for similar test cases when title changes
  useEffect(() => {
    const checkSimilar = async () => {
      if (!title || title.length < 5) {
        setSimilarTestCases([]);
        return;
      }

      setCheckingSimilar(true);
      try {
        // Simple similarity check - in production you'd want fuzzy matching
        const resp = await testCaseApi.getTestCases();
        if (resp?.data?.success && resp.data.data) {
          const similar = resp.data.data.filter((tc: any) => 
            tc.title.toLowerCase().includes(title.toLowerCase()) ||
            title.toLowerCase().includes(tc.title.toLowerCase())
          ).slice(0, 3);
          setSimilarTestCases(similar);
        }
      } catch (e) {
        console.error('Failed to check similar test cases', e);
      } finally {
        setCheckingSimilar(false);
      }
    };

    const debounce = setTimeout(checkSimilar, 1000);
    return () => clearTimeout(debounce);
  }, [title]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      // Ctrl/Cmd + S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      // Ctrl/Cmd + K to show shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowKeyboardShortcuts(true);
      }
      // Escape to cancel
      if (e.key === 'Escape' && !openTemplatesModal && !showKeyboardShortcuts) {
        handleCancel();
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [openTemplatesModal, showKeyboardShortcuts]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDescriptionExpanded(false);
    setStateField('Design');
    setPriority('2');
    setArea('Epos');
    setIteration('Epos');
    setTags('');
    setReason('New');
    setSteps([]);
    setSharedParameterName('');
    localStorage.removeItem(DRAFT_KEY);
  };

  const handleCancel = () => {
    if (title || description || steps.length > 0) {
      const confirmCancel = window.confirm('You have unsaved changes. Are you sure you want to cancel?');
      if (!confirmCancel) return;
    }
    navigate('/app/team-tests');
  };

  const handleSave = async () => {
    if (saving) return; // prevent double-submits
    try {
      if (!title.trim()) {
        toast.error('Title is required');
        return;
      }

      setSaving(true);
      const filteredSteps = steps.filter((s) => (s.action?.trim() || s.expectedResult?.trim()));

      // STEP 1: Upload all attachments first and collect IDs
      const attachmentIds: string[] = [];
      const nextSteps = [...filteredSteps];
      for (let i = 0; i < nextSteps.length; i++) {
        const step = nextSteps[i];
        if (step.attachment && step.attachment instanceof File) {
          try {
            const stepId = i + 2; // Azure DevOps step IDs usually start at 2
            const uploadResp = await testCaseApi.uploadAttachment(step.attachment, undefined, stepId);
            const attachmentUrl = uploadResp?.data?.data?.attachmentUrl;
            const attachmentId = uploadResp?.data?.data?.attachmentId;
            if (attachmentUrl || attachmentId) {
              const attachmentRef = attachmentUrl || attachmentId;
              attachmentIds.push(attachmentRef);
              
              nextSteps[i] = {
                ...step,
                attachment: {
                  url: attachmentRef,
                  name: step.attachment.name,
                  type: step.attachment.type
                }
              };
              
              toast.info(`📎 Uploaded: ${step.attachment.name}`);
            }
          } catch (err: any) {
            console.error('Attachment upload failed', err);
            const errorMsg = err?.response?.data?.message || err?.message || 'Unknown error';
            toast.error(`Attachment failed: ${errorMsg}`);
            return;
          }
        }
      }

      // STEP 2: Create test case with attachment IDs
      const payload = {
        title,
        description,
        steps: nextSteps.map((s) => ({
          action: s.action || '',
          expectedResult: s.expectedResult || '',
          attachment: s.attachment
        } as Step)),
        tags,
        priority: parseInt(priority, 10) || 1,
        state: stateField,
        area,
        iteration,
        userStoryId: userStoryId || null,
        reason,
        sharedParameterName: sharedParameterName || null,
        attachmentIds: attachmentIds.length > 0 ? attachmentIds : undefined,
      };

      const resp = await testCaseApi.createTestCase(payload);
      if (resp?.data?.success) {
        toast.success('✅ Test case created successfully!');
        localStorage.removeItem(DRAFT_KEY); // Clear draft on successful save
        resetForm();
        navigate('/app/team-tests');
      } else {
        toast.error(resp?.data?.message || 'Failed to save test case');
      }
    } catch (err: any) {
      console.error('Save failed', err);
      toast.error(err?.response?.data?.message || 'Failed to save test case');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndNew = async () => {
    await handleSave();
    if (!saving) {
      resetForm();
      toast.info('Ready to create another test case');
    }
  };

  const addBulkSteps = () => {
    const bulkText = prompt('Enter steps (one per line, format: "Action | Expected Result"):');
    if (!bulkText) return;

    const lines = bulkText.split('\n').filter(l => l.trim());
    const newSteps: Step[] = lines.map((line, idx) => {
      const parts = line.split('|').map(p => p.trim());
      return {
        id: steps.length + idx + 1,
        action: parts[0] || line,
        expectedResult: parts[1] || '',
      };
    });

    setSteps([...steps, ...newSteps]);
    toast.success(`Added ${newSteps.length} steps`);
  };

  const extractTestCase = () => {
    toast.info('Extracting sections into steps…');
  };

  return (
    <div className="page-card tc-shell tc-wide tc-density-compact">
      {/* Draft Banner */}
      {hasDraft && (
        <div className="tc-banner warning" style={{ marginBottom: '16px' }}>
          <strong>📝 Draft Found:</strong> You have unsaved work from a previous session.
          <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
            <button className="btn-secondary" onClick={restoreDraft}>Restore Draft</button>
            <button className="btn-secondary danger" onClick={discardDraft}>Discard</button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="page-header-actions etc-header-row">
        <div className="etc-header-left">
          <h2 id="tcHeader">Create Test Case</h2>
          <div className="header-title-field">
            <label className="form-label" htmlFor="testTitle">Title *</label>
            <input
              id="testTitle"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., TC 1.1 – Login with valid credentials"
              aria-label="Test Case Title"
              aria-describedby="tcHeader"
              required
              autoFocus
            />
            {similarTestCases.length > 0 && (
              <div className="tc-banner warning" style={{ marginTop: '8px', fontSize: '12px' }}>
                <strong>⚠️ Similar test cases found:</strong>
                <ul style={{ marginTop: '4px', marginLeft: '16px' }}>
                  {similarTestCases.map(tc => (
                    <li key={tc.id}>
                      {tc.title}
                      <button 
                        className="link-button" 
                        style={{ marginLeft: '8px' }}
                        onClick={() => navigate(`/app/edit-test/${tc.id}`, { state: { cloneFrom: true } })}
                      >
                        Clone
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        <div className="header-actions-right">
          <button className="btn-secondary" onClick={() => setShowKeyboardShortcuts(true)} title="Keyboard Shortcuts (Ctrl+K)">
            ⌨️
          </button>
          <button className="btn-primary" onClick={() => setOpenTemplatesModal(true)}>📋 Templates</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            💾 {saving ? 'Saving…' : 'Save'}
          </button>
          <button className="btn-primary" onClick={handleSaveAndNew} disabled={saving}>
            💾+ Save & New
          </button>
        </div>
      </div>

      {/* Auto-save indicator */}
      {autoSaveEnabled && lastSaved && (
        <div style={{ fontSize: '11px', color: '#666', marginBottom: '8px', textAlign: 'right' }}>
          💾 Auto-saved {Math.floor((Date.now() - lastSaved) / 1000)}s ago
        </div>
      )}

      <div className="tc-grid">
        <div className="form-card meta-card">

          {userStoryTitle && (
            <div className="tc-banner success">
              <strong>✓ Linked to User Story:</strong> {userStoryTitle} (ID: {userStoryId})
            </div>
          )}

          {description && !descriptionExpanded && (
            <div className="tc-banner info">
              <div>
                <strong>Description:</strong> {description.substring(0, 100)}{description.length > 100 ? '…' : ''}
              </div>
            </div>
          )}

          <button className="link-button" onClick={() => setDescriptionExpanded(!descriptionExpanded)}>
            {descriptionExpanded ? '▼ Hide details' : '▶ More options & description'}
          </button>

          {descriptionExpanded && (
            <>
              <div className="tc-field">
                <label className="form-label" htmlFor="testDescription">
                  Description
                  <button 
                    className="link-button" 
                    style={{ marginLeft: '8px', fontSize: '11px' }}
                    onClick={() => setUseRichEditor(!useRichEditor)}
                  >
                    {useRichEditor ? 'Use Plain Text' : 'Use Rich Editor'}
                  </button>
                </label>
                {useRichEditor ? (
                  <div style={{ border: '1px solid #ddd', borderRadius: '4px', minHeight: '200px' }}>
                    <RichEditor
                      initialHtml={description}
                      onChange={setDescription}
                      placeholder="Detailed description with rich formatting..."
                      variant="embedded"
                    />
                  </div>
                ) : (
                  <textarea 
                    id="testDescription" 
                    className="form-input" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    placeholder="Detailed description..." 
                    rows={6}
                  />
                )}
              </div>

              <div className="tc-field">
                <label className="form-label">
                  <input 
                    type="checkbox" 
                    checked={autoSaveEnabled} 
                    onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                    style={{ marginRight: '8px' }}
                  />
                  Auto-save draft every 30 seconds
                </label>
              </div>
            </>
          )}

          <div className="inputsGrid">
            <div className="form-group">
              <label className="form-label" htmlFor="state">State</label>
              <select id="state" className="form-input" value={stateField} onChange={(e) => setStateField(e.target.value)}>
                <option value="Design">Design</option>
                <option value="Ready">Ready</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="priority">Priority</label>
              <select id="priority" className="form-input" value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="1">1-Critical</option>
                <option value="2">2-High</option>
                <option value="3">3-Medium</option>
                <option value="4">4-Low</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="area">Area Path</label>
              <input id="area" className="form-input" value={area} onChange={(e) => setArea(e.target.value)} placeholder="Epos" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="iteration">Iteration Path</label>
              <input id="iteration" className="form-input" value={iteration} onChange={(e) => setIteration(e.target.value)} placeholder="Epos" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="tags">Tags (semicolon separated)</label>
              <input id="tags" className="form-input" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="automation; regression; smoke" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reason">Reason</label>
              <select id="reason" className="form-input" value={reason} onChange={(e) => setReason(e.target.value)} aria-label="Reason">
                <option value="New">New</option>
                <option value="Regression">Regression</option>
                <option value="Investigation">Investigation</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="steps-wrapper">
        <div className="tc-section steps-section steps-tall">
          <div className="tc-section-header">
            <div>
              <h4>Test Steps</h4>
              <p className="muted">Add steps with rich formatting, attachments, and drag-to-reorder.</p>
            </div>
            <div className="tc-section-actions">
              <button className="btn-secondary" onClick={addBulkSteps} title="Add multiple steps at once">
                📝 Bulk Add
              </button>
              <button className="btn-secondary ghost" onClick={extractTestCase}>🔗 Extract</button>
              <button className="btn-secondary danger" onClick={handleCancel}>✕ Cancel</button>
            </div>
          </div>
          <StepsEditor steps={steps} onChange={setSteps} />
        </div>
      </div>

      {/* Templates Modal */}
      {openTemplatesModal && (
        <TemplatesModal
          open={openTemplatesModal}
          onClose={() => setOpenTemplatesModal(false)}
          onSelect={(template) => {
            setTitle(template.name);
            setDescription(template.description);
            setSteps(template.steps);
            if (template.sharedParameterName) {
              setSharedParameterName(template.sharedParameterName);
            }
            toast.success(`Template "${template.name}" applied`);
          }}
        />
      )}

      {/* Keyboard Shortcuts Modal */}
      {showKeyboardShortcuts && (
        <div className="re-modal" onClick={() => setShowKeyboardShortcuts(false)}>
          <div className="re-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="re-modal-title">⌨️ Keyboard Shortcuts</div>
            <div style={{ padding: '16px' }}>
              <div style={{ marginBottom: '12px' }}>
                <strong>Ctrl/Cmd + S</strong> - Save test case
              </div>
              <div style={{ marginBottom: '12px' }}>
                <strong>Ctrl/Cmd + K</strong> - Show keyboard shortcuts
              </div>
              <div style={{ marginBottom: '12px' }}>
                <strong>Escape</strong> - Cancel and go back
              </div>
              <div style={{ marginBottom: '12px' }}>
                <strong>Tab</strong> - Navigate between fields
              </div>
            </div>
            <div className="re-modal-actions">
              <button className="re-btn azure" onClick={() => setShowKeyboardShortcuts(false)}>Got it!</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateTestCasePage;

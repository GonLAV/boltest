import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';
import { testCaseApi } from '../testCase.api';
import { Step } from '../testCase.types';
import StepsEditor from './StepsEditor';
import './EditTestCasePage.css';

interface TestCaseDetail {
  id: number;
  title: string;
  description?: string;
  state?: string;
  priority?: number;
  area?: string;
  iteration?: string;
  tags?: string;
  steps?: Step[];
  createdBy?: string;
  createdDate?: string;
  linkedUserStory?: {
    id: number;
    title: string;
  };
}

const EditTestCasePage: React.FC = () => {
  const { testCaseId } = useParams<{ testCaseId: string }>();
  const navigate = useNavigate();
  
  const [testCase, setTestCase] = useState<TestCaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState<Step[]>([]);
  const [tags, setTags] = useState('');
  const [stateField, setStateField] = useState('Design');
  const [area, setArea] = useState('');
  const [iteration, setIteration] = useState('');
  const [priority, setPriority] = useState('2');
  const [linkedStory, setLinkedStory] = useState<{ id: number; title: string } | null>(null);

  // Fetch test case on mount
  useEffect(() => {
    const fetchTestCase = async () => {
      try {
        setLoading(true);
        if (!testCaseId) throw new Error('Test Case ID not provided');
        
        const resp = await testCaseApi.getTestCaseById(parseInt(testCaseId, 10));
        if (resp?.data?.success && resp.data.data?.testCase) {
          const tc = resp.data.data.testCase;
          setTestCase(tc);
          setTitle(tc.title || '');
          setDescription(tc.description || '');
          setTags(tc.tags || '');
          setStateField(tc.state || 'Design');
          setArea(tc.area || '');
          setIteration(tc.iteration || '');
          setPriority(String(tc.priority || 2));
          setLinkedStory(tc.linkedUserStory || null);
          const incomingSteps = (tc.steps || []).map((s: Step, idx: number) => ({
            ...s,
            id: s.id || Date.now() + idx,
            action: s.action || '',
            expectedResult: s.expectedResult || ''
          }));
          setSteps(incomingSteps);
        } else {
          toast.error('Test case not found');
          navigate('/app/team-tests');
        }
      } catch (err: any) {
        console.error('Error fetching test case:', err);
        toast.error(err?.response?.data?.message || 'Failed to load test case');
        navigate('/app/team-tests');
      } finally {
        setLoading(false);
      }
    };

    fetchTestCase();
  }, [testCaseId, navigate]);

  const handleSave = async () => {
    try {
      if (!testCaseId || !title.trim()) {
        toast.error('Title is required');
        return;
      }

      setSaving(true);
      const payload = {
        title,
        description,
        steps: steps.map((s) => ({ action: s.action, expectedResult: s.expectedResult, attachment: s.attachment } as Step)),
        state: stateField || 'Design',
        priority: parseInt(priority, 10) || 1,
        area,
        iteration,
        tags
      };

      const resp = await testCaseApi.updateTestCase(parseInt(testCaseId, 10), payload);
      if (resp?.data?.success) {
        toast.success('Test case updated successfully');
        navigate('/app/team-tests');
      } else {
        toast.error(resp?.data?.message || 'Failed to update test case');
      }
    } catch (err: any) {
      console.error('Error saving test case:', err);
      toast.error(err?.response?.data?.message || 'Failed to save test case');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="etc-state-text">
        Loading test case...
      </div>
    );
  }

  if (!testCase) {
    return (
      <div className="etc-state-text">
        Test case not found
      </div>
    );
  }

  return (
    <div className="page-card">
      <div className="card-header etc-header">
        <div>
          <h2>Edit Test Case</h2>
          <p className="muted">ID: #{testCase.id}</p>
        </div>
        <div className="pill">Edit</div>
      </div>

      {linkedStory && (
        <div className="alert alert-success etc-linked-alert">
          🔗 Linked to User Story: {linkedStory.title} (#{linkedStory.id})
        </div>
      )}

      <div className="form-card">
        <div className="form-row etc-form-row">
          <div className="form-group form-group-full etc-flex-1">
            <label className="form-label">Title *</label>
            <input className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., TC 1.1 – Login" />
          </div>
        </div>

        <div className="etc-mb-12">
          <label className="form-label">Description</label>
          <textarea className="form-input etc-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detailed description..." />
        </div>

        <div className="etc-grid-fields">
          <div className="form-group">
            <label className="form-label">State</label>
            <select className="form-input" aria-label="State" value={stateField} onChange={(e) => setStateField(e.target.value)}>
              <option value="Design">Design</option>
              <option value="Ready">Ready</option>
              <option value="Active">Active</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Priority</label>
            <select className="form-input" aria-label="Priority" value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="1">1-High</option>
              <option value="2">2-High</option>
              <option value="3">3-Med</option>
              <option value="4">4-Low</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Area</label>
            <input className="form-input" value={area} onChange={(e) => setArea(e.target.value)} placeholder="Epos" />
          </div>
          <div className="form-group">
            <label className="form-label">Iteration</label>
            <input className="form-input" value={iteration} onChange={(e) => setIteration(e.target.value)} placeholder="Epos" />
          </div>
        </div>

        <div className="etc-mb-12">
          <label className="form-label">Tags</label>
          <input className="form-input" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="tag1, tag2" />
        </div>

        <div className="section-block etc-mt-12">
          <div className="card-header etc-steps-header">
            <div>
              <h3 className="card-title">Steps</h3>
              <p className="muted">Rich step editor with drag, duplicate, attach.</p>
            </div>
          </div>
          <StepsEditor steps={steps} onChange={setSteps} />
        </div>

        <div className="form-actions etc-mt-16">
          <button className="btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
          <button className="btn-secondary" onClick={() => navigate('/app/team-tests')} disabled={saving}>Cancel</button>
        </div>

        <div className="muted etc-footer-meta">
          Created by: {testCase.createdBy || 'Unknown'} · {testCase.createdDate ? new Date(testCase.createdDate).toLocaleString() : 'Unknown'}
        </div>
      </div>
    </div>
  );
};

export default EditTestCasePage;

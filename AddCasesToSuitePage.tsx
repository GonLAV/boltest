import React, { useState } from 'react';
import { testSuitesApi, AddCasesPayload } from '../testSuites.api';
import './AddCasesToSuitePage.css';

const AddCasesToSuitePage: React.FC = () => {
  const [planId, setPlanId] = useState<number | ''>('');
  const [suiteId, setSuiteId] = useState<number | ''>('');
  const [testCaseIds, setTestCaseIds] = useState('');
  const [apiVersion, setApiVersion] = useState('7.2-preview.3');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const parseIds = (raw: string) => raw.split(/[,\s]+/).map(x => Number(x.trim())).filter(n => !Number.isNaN(n));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    const ids = parseIds(testCaseIds);
    if (!planId || !suiteId || ids.length === 0) {
      setError('Plan ID, Suite ID, and at least one Test Case ID are required');
      return;
    }

    const payload: AddCasesPayload = {
      planId: Number(planId),
      suiteId: Number(suiteId),
      testCaseIds: ids,
      apiVersion: apiVersion || undefined,
    };

    try {
      setLoading(true);
      const res = await testSuitesApi.addCases(payload);
      setResult(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to add test cases to suite');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-card">
      <div className="card-header">
        <div>
          <h2>Add Test Cases to Suite</h2>
          <p className="muted">Calls Azure DevOps Test Suites API (Add) with PAT stored on the server.</p>
        </div>
        <div className="pill">Test Suite</div>
      </div>

      <form className="form-grid two-col" onSubmit={handleSubmit}>
        <div className="stack">
          <label>
            Plan ID
            <input type="number" value={planId} onChange={(e) => setPlanId(e.target.value ? Number(e.target.value) : '')} required placeholder="e.g. 42" />
          </label>
          <label>
            Suite ID
            <input type="number" value={suiteId} onChange={(e) => setSuiteId(e.target.value ? Number(e.target.value) : '')} required placeholder="e.g. 100" />
          </label>
          <label>
            API Version
            <input value={apiVersion} onChange={(e) => setApiVersion(e.target.value)} placeholder="7.2-preview.3" />
          </label>
        </div>

        <div className="stack">
          <label>
            Test Case IDs (comma or space separated)
            <textarea
              value={testCaseIds}
              onChange={(e) => setTestCaseIds(e.target.value)}
              rows={4}
              placeholder="39, 40, 41"
              required
            />
          </label>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Adding...' : 'Add to Suite'}</button>
          </div>
        </div>
      </form>

      {error && <div className="alert alert-error">{error}</div>}
      {result?.success && <div className="alert alert-success">Added {result.data?.count ?? result.data?.value?.length ?? ''} test case(s)</div>}
      {result?.data?.value && (
        <div className="card">
          <pre className="ats-result-pre">{JSON.stringify(result.data.value, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default AddCasesToSuitePage;

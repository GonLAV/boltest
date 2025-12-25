/**
 * Shared Parameters Manager UI Component
 * Easy-to-use interface for creating and managing shared test parameters
 */

import React, { useState } from 'react';
import './sharedParameters.css';

interface ParameterColumn {
  name: string;
}

interface ParameterRow {
  [key: string]: string;
}

export const SharedParametersView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'create' | 'manage' | 'link'>('create');
  const [paramName, setParamName] = useState('');
  const [project, setProject] = useState('');
  const [columns, setColumns] = useState<ParameterColumn[]>([
    { name: 'FirstName' },
    { name: 'LastName' }
  ]);
  const [rows, setRows] = useState<ParameterRow[]>([
    { FirstName: '', LastName: '' }
  ]);
  const [testSteps, setTestSteps] = useState<string[]>(['']);
  const [expectedResults, setExpectedResults] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Add new column
  const addColumn = () => {
    setColumns([...columns, { name: `Column${columns.length + 1}` }]);
    setRows(rows.map(row => ({ ...row, [`Column${columns.length + 1}`]: '' })));
  };

  // Update column name
  const updateColumnName = (index: number, newName: string) => {
    const oldName = columns[index].name;
    const newColumns = [...columns];
    newColumns[index].name = newName;
    setColumns(newColumns);

    // Update rows with new column name
    const newRows = rows.map(row => {
      const { [oldName]: value, ...rest } = row;
      return { ...rest, [newName]: value || '' };
    });
    setRows(newRows);
  };

  // Remove column
  const removeColumn = (index: number) => {
    const colName = columns[index].name;
    const newColumns = columns.filter((_, i) => i !== index);
    setColumns(newColumns);

    // Remove column from rows
    const newRows = rows.map(row => {
      const { [colName]: _, ...rest } = row;
      return rest;
    });
    setRows(newRows);
  };

  // Add data row
  const addRow = () => {
    const emptyRow = columns.reduce((acc, col) => {
      acc[col.name] = '';
      return acc;
    }, {} as ParameterRow);
    setRows([...rows, emptyRow]);
  };

  // Update row data
  const updateRowData = (rowIndex: number, colName: string, value: string) => {
    const newRows = [...rows];
    newRows[rowIndex][colName] = value;
    setRows(newRows);
  };

  // Remove row
  const removeRow = (index: number) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  // Add test step
  const addTestStep = () => {
    setTestSteps([...testSteps, '']);
    setExpectedResults([...expectedResults, '']);
  };

  // Update test step
  const updateTestStep = (index: number, value: string) => {
    const newSteps = [...testSteps];
    newSteps[index] = value;
    setTestSteps(newSteps);
  };

  // Update expected result
  const updateExpectedResult = (index: number, value: string) => {
    const newResults = [...expectedResults];
    newResults[index] = value;
    setExpectedResults(newResults);
  };

  // Remove test step
  const removeTestStep = (index: number) => {
    setTestSteps(testSteps.filter((_, i) => i !== index));
    setExpectedResults(expectedResults.filter((_, i) => i !== index));
  };

  // Create parameter set
  const handleCreateParameter = async () => {
    if (!paramName || !project || columns.length === 0) {
      setMessage('❌ Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/shared-parameters/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: paramName,
          project,
          columns: columns.map(c => c.name),
          data: rows
        })
      });

      const result = await response.json();
      if (result.success) {
        setMessage(`✅ ${result.message}\nFile: ${result.fileName}`);
        // Reset form
        setParamName('');
        setRows([columns.reduce((acc, c) => ({ ...acc, [c.name]: '' }), {})]);
      } else {
        setMessage(`❌ Error: ${result.error}`);
      }
    } catch (error: any) {
      setMessage(`❌ Failed to create parameter set: ${error.message}`);
    }
    setLoading(false);
  };

  // Convert steps to parameter format
  const handleConvertSteps = async () => {
    if (!paramName || testSteps.length === 0) {
      setMessage('❌ Please enter parameter name and test steps');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/shared-parameters/convert-to-steps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parameterName: paramName,
          testSteps,
          expectedResults
        })
      });

      const result = await response.json();
      if (result.success) {
        setMessage(`✅ Steps converted!\nParameters used: ${result.parametersUsed.join(', ')}`);
      } else {
        setMessage(`❌ Error: ${result.error}`);
      }
    } catch (error: any) {
      setMessage(`❌ Failed to convert steps: ${error.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="shared-parameters-container">
      <h1>📊 Shared Parameters Manager</h1>
      <p className="subtitle">Create and manage parameterized test data for data-driven testing</p>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab-button ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          ➕ Create Parameters
        </button>
        <button
          className={`tab-button ${activeTab === 'manage' ? 'active' : ''}`}
          onClick={() => setActiveTab('manage')}
        >
          📝 Manage Data
        </button>
        <button
          className={`tab-button ${activeTab === 'link' ? 'active' : ''}`}
          onClick={() => setActiveTab('link')}
        >
          🔗 Link to Test Cases
        </button>
      </div>

      {/* Message Display */}
      {message && (
        <div className="message-box">
          <p>{message}</p>
          <button onClick={() => setMessage('')} className="close-btn">✕</button>
        </div>
      )}

      {/* CREATE TAB */}
      {activeTab === 'create' && (
        <div className="tab-content">
          <h2>Create New Parameter Set</h2>

          {/* Basic Info */}
          <div className="form-section">
            <h3>Step 1: Basic Information</h3>
            <div className="form-group">
              <label>Parameter Set Name *</label>
              <input
                type="text"
                placeholder="e.g., CL_APPLICANT, PL_HOMEOWNER"
                value={paramName}
                onChange={(e) => setParamName(e.target.value)}
                className="form-input"
              />
              <small>Used as identifier in Azure DevOps</small>
            </div>

            <div className="form-group">
              <label>Project/Tenant *</label>
              <select
                value={project}
                onChange={(e) => setProject(e.target.value)}
                className="form-input"
              >
                <option value="">Select project...</option>
                <option value="Progressive PL">Progressive PL</option>
                <option value="USAA">USAA</option>
                <option value="National General">National General</option>
                <option value="Test Tenant">Test Tenant</option>
              </select>
            </div>
          </div>

          {/* Columns */}
          <div className="form-section">
            <h3>Step 2: Define Columns (Parameters)</h3>
            <p className="helper-text">
              These column names become @ParameterName in test steps
            </p>

            <div className="columns-list">
              {columns.map((col, idx) => (
                <div key={idx} className="column-item">
                  <input
                    type="text"
                    value={col.name}
                    onChange={(e) => updateColumnName(idx, e.target.value)}
                    className="form-input"
                    placeholder="Column name"
                  />
                  {columns.length > 1 && (
                    <button
                      className="btn-remove"
                      onClick={() => removeColumn(idx)}
                      title="Remove column"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button onClick={addColumn} className="btn-secondary">
              + Add Column
            </button>
          </div>

          {/* Data Rows */}
          <div className="form-section">
            <h3>Step 3: Add Test Data</h3>
            <p className="helper-text">
              Add rows of test data. Test will run once per row.
            </p>

            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    {columns.map((col) => (
                      <th key={col.name}>{col.name}</th>
                    ))}
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rowIdx) => (
                    <tr key={rowIdx}>
                      <td>{rowIdx + 1}</td>
                      {columns.map((col) => (
                        <td key={`${rowIdx}-${col.name}`}>
                          <input
                            type="text"
                            value={row[col.name] || ''}
                            onChange={(e) =>
                              updateRowData(rowIdx, col.name, e.target.value)
                            }
                            className="table-input"
                          />
                        </td>
                      ))}
                      <td>
                        {rows.length > 1 && (
                          <button
                            className="btn-remove"
                            onClick={() => removeRow(rowIdx)}
                            title="Remove row"
                          >
                            ✕
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button onClick={addRow} className="btn-secondary">
              + Add Row
            </button>
          </div>

          {/* Create Button */}
          <div className="form-section">
            <button
              onClick={handleCreateParameter}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? '⏳ Creating...' : '✅ Create Parameter Set'}
            </button>
          </div>
        </div>
      )}

      {/* MANAGE TAB */}
      {activeTab === 'manage' && (
        <div className="tab-content">
          <h2>Manage Existing Parameters</h2>

          <div className="form-section">
            <h3>Add More Test Data to Existing Set</h3>
            <div className="form-group">
              <label>Select Parameter Set</label>
              <input
                type="text"
                placeholder="e.g., CL_APPLICANT_SharedParameters"
                className="form-input"
              />
            </div>

            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Column</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {columns.map((col) => (
                    <tr key={col.name}>
                      <td>{col.name}</td>
                      <td>
                        <input type="text" className="table-input" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button className="btn-primary">📤 Import to Azure DevOps</button>
          </div>
        </div>
      )}

      {/* LINK TAB */}
      {activeTab === 'link' && (
        <div className="tab-content">
          <h2>Convert Test Steps to Parameter Format</h2>

          <div className="form-section">
            <h3>Create Parameterized Test Case</h3>

            <div className="form-group">
              <label>Parameter Set Name *</label>
              <input
                type="text"
                placeholder="e.g., CL_APPLICANT"
                value={paramName}
                onChange={(e) => setParamName(e.target.value)}
                className="form-input"
              />
              <small>Parameters will be referenced as @ParameterName in steps</small>
            </div>

            <h4>Test Case Steps</h4>
            <p className="helper-text">
              Use @ColumnName to reference parameters (e.g., "Enter @FirstName in name field")
            </p>

            <div className="steps-list">
              {testSteps.map((step, idx) => (
                <div key={idx} className="step-item">
                  <div className="step-number">{idx + 1}</div>
                  <div className="step-inputs">
                    <textarea
                      placeholder="Test step action (use @ParameterName for values)"
                      value={step}
                      onChange={(e) => updateTestStep(idx, e.target.value)}
                      className="form-textarea"
                      rows={2}
                    />
                    <textarea
                      placeholder="Expected result"
                      value={expectedResults[idx] || ''}
                      onChange={(e) => updateExpectedResult(idx, e.target.value)}
                      className="form-textarea"
                      rows={2}
                    />
                  </div>
                  {testSteps.length > 1 && (
                    <button
                      className="btn-remove"
                      onClick={() => removeTestStep(idx)}
                      title="Remove step"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button onClick={addTestStep} className="btn-secondary">
              + Add Step
            </button>

            <div className="form-section">
              <button
                onClick={handleConvertSteps}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? '⏳ Converting...' : '🔗 Create Test Case with Parameters'}
              </button>
            </div>

            {/* Preview */}
            <div className="preview-section">
              <h4>📋 Preview</h4>
              <p>
                <strong>Parameter Set:</strong> {paramName || 'Not set'}
              </p>
              <p>
                <strong>Test Steps:</strong> {testSteps.length}
              </p>
              <p>
                <strong>Execution:</strong> Test will run once per data row in {paramName}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SharedParametersView;
